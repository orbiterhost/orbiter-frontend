import { zip } from "fflate";
import { CarReader } from "@ipld/car";
import { recursive, type UnixFSEntry } from "ipfs-unixfs-exporter";
import { CID } from "multiformats/cid";
import { Site } from "@/utils/types";

// IPFS gateway used to serve Orbiter sites (matches template-card.tsx).
const GATEWAY = "https://cdn.orbiter.host";

// Pinata gateways don't expose kubo/trustless directory listing (a recursive
// dag-json walk gets rate-limited to 403). Instead we ask the gateway for the
// site's entire DAG as a single CAR file (`?format=car`) and unpack it locally.
// One request per site, full recursive tree + file bytes included.
async function fetchSiteCar(rootCid: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY}/ipfs/${rootCid}?format=car`);
  if (!res.ok) {
    throw new Error(`Failed to fetch CAR for ${rootCid}: ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

// Drain a UnixFS file/raw entry's content stream into a single Uint8Array.
async function readEntryBytes(entry: UnixFSEntry): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of entry.content()) {
    chunks.push(chunk);
    total += chunk.length;
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

// Build the file map ({ path: bytes }) for a single site by unpacking its CAR.
// The exporter prefixes every path with the root CID; we strip it so paths are
// relative to the site root. A single-file (raw leaf) site has no directory, so
// its lone entry's path is the bare CID — we name that index.html.
async function buildSiteFiles(site: Site): Promise<Record<string, Uint8Array>> {
  const carBytes = await fetchSiteCar(site.cid);
  const reader = await CarReader.fromBytes(carBytes);
  const roots = await reader.getRoots();
  const rootCid = roots[0] ?? CID.parse(site.cid);

  const blockstore = {
    async get(cid: CID): Promise<Uint8Array> {
      const block = await reader.get(cid);
      if (!block) {
        throw new Error(`Missing block ${cid.toString()} in CAR for ${site.cid}`);
      }
      return block.bytes;
    },
  };

  const files: Record<string, Uint8Array> = {};
  for await (const entry of recursive(rootCid, blockstore)) {
    if (entry.type !== "file" && entry.type !== "raw") {
      continue; // skip directories
    }
    let path = entry.path;
    if (path === rootCid.toString()) {
      path = "index.html"; // single-file site
    } else {
      path = path.replace(`${rootCid.toString()}/`, "");
    }
    files[path] = await readEntryBytes(entry);
  }
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

// Strip protocol/slashes so a domain is safe to use as a folder name.
function sanitizeFolderName(name: string): string {
  return name.replace(/^https?:\/\//, "").replace(/\/+$/, "").replace(/[/\\]/g, "_");
}

function folderForSite(site: Site): string {
  return sanitizeFolderName(site.domain || site.custom_domain || site.cid);
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
