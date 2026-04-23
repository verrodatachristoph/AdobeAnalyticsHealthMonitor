import { KPIEditorSheet } from "@/components/kpi-editor-sheet";
import { KPIListRow } from "@/components/kpi-list-row";
import { PropertyScopeSelect } from "@/components/property-scope-select";
import { getSessionWithRole } from "@/lib/auth/require-role";
import { loadCustomKPIs, loadPropertyOptions } from "@/lib/queries/custom-kpis";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ property?: string }>;
};

export default async function CustomKPIsPage({ searchParams }: Props) {
  const session = await getSessionWithRole();
  const isAdmin = session?.role === "agency_admin";
  const properties = await loadPropertyOptions();
  if (properties.length === 0) {
    return (
      <section className="space-y-6 pt-6">
        <h1 className="text-4xl font-light tracking-tight">Custom KPIs</h1>
        <p className="text-sm text-secondary">
          No properties yet. Add a client and property first.
        </p>
      </section>
    );
  }

  const { property } = await searchParams;
  const selectedId = property ?? properties[0].id;
  const selected = properties.find((p) => p.id === selectedId);
  if (!selected) redirect("/settings/kpis");

  const kpis = await loadCustomKPIs(selectedId);

  return (
    <section className="space-y-6 pt-6">
      <header>
        <h1 className="text-4xl font-light tracking-tight">Custom KPIs</h1>
        <p className="mt-2 text-sm text-secondary">
          KPIs in addition to the five required health checks. New KPIs spend
          56 days in shadow mode while they learn a baseline.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PropertyScopeSelect options={properties} value={selectedId} />
        <KPIEditorSheet propertyId={selectedId} isAdmin={isAdmin ?? false} />
      </div>

      {kpis.length === 0 ? (
        <div className="rounded-2xl bg-card-soft p-12">
          <h2 className="text-2xl font-light tracking-tight">
            No custom KPIs yet
          </h2>
          <p className="mt-3 max-w-xl text-base text-secondary">
            Custom KPIs let you track the metrics that matter most to this
            client — beyond the standard health checks we run automatically.
            They start in shadow mode and build a 56-day baseline before
            contributing to the property score.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {kpis.map((kpi) => (
            <KPIListRow key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </section>
  );
}
