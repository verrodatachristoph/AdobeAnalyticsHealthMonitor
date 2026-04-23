"use client";

import { createCustomKPI } from "@/app/(app)/settings/kpis/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Lock, Plus } from "lucide-react";
import { useActionState, useState } from "react";

type Props = {
  propertyId: string;
  isAdmin: boolean;
};

const SENSITIVITY = [
  {
    value: "low",
    label: "Notify on big drops only",
    consequence:
      "We alert when a metric falls well outside the historical range.",
  },
  {
    value: "medium",
    label: "Notify on noticeable drops",
    consequence:
      "We alert on meaningful deviations — the kind an analyst would flag in a Monday report.",
  },
  {
    value: "high",
    label: "Notify on any unusual change",
    consequence:
      "We alert early, including subtle movements. Expect more notifications.",
  },
] as const;

const WEIGHT = [
  {
    value: "standard",
    label: "Standard",
    consequence: "Contributes to the property's composite score.",
    adminOnly: false,
  },
  {
    value: "elevated",
    label: "Elevated",
    consequence: "A sustained drop can move the property to Watch or Degraded.",
    adminOnly: false,
  },
  {
    value: "critical",
    label: "Critical — admin only",
    consequence:
      "A sustained drop can move the property to Critical. Reserved for agency admins.",
    adminOnly: true,
  },
] as const;

export function KPIEditorSheet({ propertyId, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCustomKPI, null);
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [weight, setWeight] = useState<"standard" | "elevated" | "critical">(
    "standard",
  );
  const [baseline, setBaseline] = useState<14 | 28>(28);
  const [visibleToClient, setVisibleToClient] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && state?.ok) {
          // Reset on close after successful save
        }
      }}
    >
      <SheetTrigger asChild>
        <Button className="gap-2 rounded-full bg-amber text-on-accent hover:bg-amber-hover">
          <Plus size={16} aria-hidden /> Add KPI
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-field sm:max-w-[560px]"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-light">Add custom KPI</SheetTitle>
          <SheetDescription>
            New KPIs run in shadow mode for 56 days while we learn the baseline,
            then start contributing to the property score.
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="mt-8 space-y-10 px-4 pb-10">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="sensitivityTier" value={sensitivity} />
          <input type="hidden" name="weightTier" value={weight} />
          <input type="hidden" name="baselineWindowDays" value={baseline} />

          <Section title="Identity">
            <div className="space-y-2">
              <Label htmlFor="kpi-name">KPI name</Label>
              <Input
                id="kpi-name"
                name="name"
                required
                maxLength={80}
                placeholder="e.g. Mobile checkout completions"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-description">Description (optional)</Label>
              <Textarea
                id="kpi-description"
                name="description"
                rows={2}
                placeholder="What does this track and why does it matter?"
              />
            </div>
          </Section>

          <Section title="Source">
            <div className="space-y-2">
              <Label htmlFor="kpi-metric">Adobe metric ID</Label>
              <Input
                id="kpi-metric"
                name="metric"
                required
                placeholder="metrics/orders"
              />
              <p className="text-xs text-secondary">
                Pulled from <span className="font-mono">/reports/metrics</span>.
                Cmdk picker comes in a follow-up.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-segment">Segment ID (optional)</Label>
              <Input
                id="kpi-segment"
                name="segment"
                placeholder="All traffic (no segment)"
              />
            </div>
          </Section>

          <Section title="Detection">
            <Label>Baseline window</Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionTile
                selected={baseline === 14}
                onClick={() => setBaseline(14)}
                title="14 days"
                consequence="Faster to detect trend changes; more sensitive to one-off events."
              />
              <OptionTile
                selected={baseline === 28}
                onClick={() => setBaseline(28)}
                title="28 days"
                consequence="Smoother baseline; better for stable recurring metrics."
              />
            </div>
            <Label>Sensitivity</Label>
            <div className="space-y-3">
              {SENSITIVITY.map((s) => (
                <OptionTile
                  key={s.value}
                  selected={sensitivity === s.value}
                  onClick={() => setSensitivity(s.value)}
                  title={s.label}
                  consequence={s.consequence}
                />
              ))}
            </div>
          </Section>

          <Section title="Visibility & priority">
            <div className="rounded-xl bg-card-soft p-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="kpi-visible" className="text-sm font-medium">
                  Show to client
                </Label>
                <Switch
                  id="kpi-visible"
                  name="visibleToClient"
                  checked={visibleToClient}
                  onCheckedChange={setVisibleToClient}
                />
              </div>
              <p className="mt-2 text-xs text-secondary">
                {visibleToClient
                  ? "Client viewers will see this KPI in their property view."
                  : "Hidden from client — only agency staff can see this KPI."}
              </p>
            </div>

            <Label>Weight</Label>
            <div className="space-y-3">
              {WEIGHT.map((w) => (
                <OptionTile
                  key={w.value}
                  selected={weight === w.value}
                  onClick={() => {
                    if (!w.adminOnly || isAdmin) setWeight(w.value);
                  }}
                  disabled={w.adminOnly && !isAdmin}
                  title={w.label}
                  consequence={w.consequence}
                  lockIcon={w.adminOnly && !isAdmin}
                />
              ))}
            </div>
          </Section>

          <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-hairline bg-field px-4 py-4">
            {state && !state.ok && (
              <p className="text-sm text-status-degraded" role="status">
                {state.message}
              </p>
            )}
            {state && state.ok && (
              <p className="text-sm text-primary" role="status">
                {state.message}
              </p>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full bg-amber text-on-accent hover:bg-amber-hover"
              >
                {pending ? "Saving…" : "Save KPI"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-medium uppercase tracking-[0.12em] text-secondary">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function OptionTile({
  selected,
  onClick,
  disabled = false,
  title,
  consequence,
  lockIcon = false,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  consequence: string;
  lockIcon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "relative w-full rounded-xl px-4 py-3 text-left transition-colors",
        selected
          ? "bg-card-paper ring-2 ring-amber"
          : "bg-card-soft hover:bg-card-paper",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary">{title}</span>
        {lockIcon && <Lock size={14} aria-hidden className="text-secondary" />}
      </div>
      <p className="mt-1 text-xs text-secondary">{consequence}</p>
    </button>
  );
}
