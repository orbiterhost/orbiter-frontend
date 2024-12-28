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

type Organizations = {
	value: string;
	label: string;
};

export function Combobox({
	organizations,
}: { organizations: Organizations[] }) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="justify-between"
				>
					{value
						? organizations.find((org) => org.value === value)?.label
						: "Select organization..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0">
				<Command>
					<CommandInput placeholder="Search organization..." className="h-9" />
					<CommandList>
						<CommandEmpty>No organization found.</CommandEmpty>
						<CommandGroup>
							{organizations.map((org) => (
								<CommandItem
									key={org.value}
									value={org.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									{org.label}
									<Check
										className={cn(
											"ml-auto",
											value === org.value ? "opacity-100" : "opacity-0",
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
