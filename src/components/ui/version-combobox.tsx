"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SiteVersion = {
  id: string;
  site_id: string;
  created_at: string;
  organization_id: string;
  cid: string;
  domain: string;
  site_contract: string;
  version_number: number;
  deployed_by: string;
};


type VersionOption = {
  value: string;
  label: string;
  data: SiteVersion;
};

type VersionComboboxProps = {
  versions: VersionOption[];
  value: string;
  onVersionSelect: (version: VersionOption | undefined) => void;
};


export function VersionCombobox({ versions, value, onVersionSelect }: VersionComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedVersion = versions.find((v) => v.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {selectedVersion
            ? `v.${selectedVersion.label}`
            : "Select version..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search versions..." className="h-9" />
          <CommandList>
            <CommandEmpty>No versions found.</CommandEmpty>
            <CommandGroup>
              {versions.map((version) => (
                <CommandItem
                  key={version.value}
                  value={version.value}
                  onSelect={() => {
                    onVersionSelect(version);
                    setOpen(false);
                  }}
                >
                  v.{version.label} - {new Date(version.data.created_at).toLocaleString()}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === version.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
