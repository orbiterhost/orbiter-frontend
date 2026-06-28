import { zip } from "fflate";
import { Site } from "@/utils/types";

// IPFS gateway used to serve Orbiter sites (matches template-card.tsx).
const GATEWAY = "https://cdn.orbiter.host";

// Max parallel gateway requests so we don't hammer the gateway.
const CONCURRENCY = 6;

type DagLink = {
  Name?: string;
  Hash: { "/": string };
  Tsize?: number;
};

type DagNode = {
  Links?: DagLink[];
};

// A node is a directory iff its dag-json has Links with at least one
// non-empty Name. Raw leaves return bytes (no Links) and chunked files
// return empty-Name links — both are treated as files.
const namedLinks = (node: DagNode): DagLink[] =>
  (node.Links ?? []).filter((l) => !!l.Name);

const isDirNode = (node: DagNode): boolean => namedLinks(node).length > 0;

// Raw-codec CIDs (bafkrei…) are always file leaves — skip the dag-json probe.
const isRawLeafCid = (cid: string): boolean => cid.startsWith("bafkrei");

async function fetchDagNode(cid: string): Promise<DagNode> {
  const res = await fetch(`${GATEWAY}/ipfs/${cid}?format=dag-json`);
  if (!res.ok) {
    throw new Error(`Failed to list ${cid}: ${res.status}`);
  }
  return (await res.json()) as DagNode;
}

// Walk a directory CID and collect every file's relative path.
async function collectFilePaths(
  rootCid: string,
  cid: string = rootCid,
  prefix = ""
): Promise<string[]> {
  const node = await fetchDagNode(cid);
  const entries = namedLinks(node);
  const paths: string[] = [];

  for (const entry of entries) {
    const childCid = entry.Hash["/"];
    const childPath = prefix ? `${prefix}/${entry.Name}` : entry.Name!;

    if (isRawLeafCid(childCid)) {
      paths.push(childPath);
      continue;
    }

    const childNode = await fetchDagNode(childCid);
    if (isDirNode(childNode)) {
      paths.push(...(await collectFilePaths(rootCid, childCid, childPath)));
    } else {
      paths.push(childPath);
    }
  }

  return paths;
}

// Fetch a single file's bytes via path so the gateway reassembles chunks.
async function fetchFile(rootCid: string, path: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY}/ipfs/${rootCid}/${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Run async tasks with a bounded concurrency.
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

// Strip protocol/slashes so a domain is safe to use as a folder name.
function sanitizeFolderName(name: string): string {
  return name.replace(/^https?:\/\//, "").replace(/\/+$/, "").replace(/[/\\]/g, "_");
}

function folderForSite(site: Site): string {
  return sanitizeFolderName(site.domain || site.custom_domain || site.cid);
}

// Build the file map ({ path: bytes }) for a single site's folder CID.
async function buildSiteFiles(site: Site): Promise<Record<string, Uint8Array>> {
  const paths = await collectFilePaths(site.cid);
  const files: Record<string, Uint8Array> = {};
  await mapLimit(paths, CONCURRENCY, async (path) => {
    files[path] = await fetchFile(site.cid, path);
  });
  return files;
}

function zipToBlob(files: Record<string, Uint8Array>): Promise<Blob> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 6 }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      // Copy into a fresh ArrayBuffer to satisfy BlobPart typing.
      resolve(new Blob([data.slice()], { type: "application/zip" }));
    });
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export a single site as <domain>.zip with files at the zip root.
export async function exportSite(site: Site): Promise<void> {
  const files = await buildSiteFiles(site);
  const blob = await zipToBlob(files);
  triggerDownload(blob, `${folderForSite(site)}.zip`);
}

export type ExportProgress = {
  current: number; // 1-based index of the site being processed
  total: number;
  domain: string;
};

export type ExportResult = {
  failed: { domain: string; error: string }[];
};

// Export all sites into a single zip, one top-level folder per site.
export async function exportSites(
  sites: Site[],
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  const allFiles: Record<string, Uint8Array> = {};
  const failed: ExportResult["failed"] = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const folder = folderForSite(site);
    onProgress?.({ current: i + 1, total: sites.length, domain: folder });
    try {
      const files = await buildSiteFiles(site);
      for (const [path, bytes] of Object.entries(files)) {
        allFiles[`${folder}/${path}`] = bytes;
      }
    } catch (error) {
      failed.push({
        domain: folder,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (Object.keys(allFiles).length > 0) {
    const blob = await zipToBlob(allFiles);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    triggerDownload(blob, `orbiter-export-${timestamp}.zip`);
  }

  return { failed };
}
