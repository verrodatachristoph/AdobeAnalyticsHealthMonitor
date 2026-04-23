"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PropertyOption } from "@/lib/queries/custom-kpis";
import { useRouter } from "next/navigation";

type Props = {
  options: PropertyOption[];
  value: string;
};

export function PropertyScopeSelect({ options, value }: Props) {
  const router = useRouter();
  return (
    <Select
      value={value}
      onValueChange={(next) => router.push(`/settings/kpis?property=${next}`)}
    >
      <SelectTrigger className="w-[320px] bg-card-paper">
        <SelectValue placeholder="Pick a property" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>
            <span>{opt.name}</span>
            <span className="ml-2 text-xs text-secondary">
              {opt.clientName}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
