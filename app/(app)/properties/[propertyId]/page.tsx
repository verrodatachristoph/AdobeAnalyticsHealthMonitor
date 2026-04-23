// Property Detail — role-aware, diagnostic vs reassurance.
// Spec: docs/features/property-detail.md

type Props = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  const { propertyId: _propertyId } = await params;

  return (
    <section className="space-y-8">
      <header className="space-y-3 pt-12">
        {/* TODO: PropertySwitcher pill + suite ID (agency) */}
        <h1 className="text-4xl font-light tracking-tight">
          {/* TODO: property name */}
          Property detail
        </h1>
        {/* TODO: Status chip + since-when */}
        {/* TODO: Verdict line (role-aware) */}
      </header>

      {/* TODO: StateTimeline strip (last 30 days) */}
      {/* TODO: IncidentBanner / ResolvedCard (conditional on active state) */}
      {/* TODO: MetricBandChart incident-expanded variant (active investigating only) */}
      {/* TODO: Agency-only "What could cause this" contrast card + AcknowledgeControl */}
      {/* TODO: Health checks card (D1-D5 consolidated) */}
      {/* TODO: KPI grid — Tier B + custom + Tier C (agency). "Your priorities" (client). */}
      {/* TODO: Recent activity rail (contrast card, right rail on desktop) */}
    </section>
  );
}
