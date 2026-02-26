const CORE_VALUES = [
  "Radical Generosity",
  "Relentless Growth",
  "Authentic Connection",
  "Bold Execution",
  "Spiritual Intelligence",
];

const THREE_YEAR = [
  "$12M ARR",
  "500K active community members",
  "30-person remote-first team",
  "3 product lines (Challenge, Wristband, Coaching)",
  "4.8+ App Store rating",
];

const ONE_YEAR = [
  "Hit $1.5M ARR",
  "Launch smart wristband V1",
  "Grow to 50K challenge participants",
  "Hire Integrator + 3 key seats",
  "K-factor > 2.0 on viral loops",
];

function VtoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-3">
      <div className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">{label}</div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2 text-sm text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function VtoTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">V/TO — Vision/Traction Organizer</h1>
        <p className="text-xs text-muted-foreground mt-1">The strategic blueprint for IamBlessedAF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Vision */}
        <div className="space-y-0">
          <VtoBlock label="Core Values">
            <BulletList items={CORE_VALUES} />
          </VtoBlock>

          <VtoBlock label="Core Focus">
            <div className="text-sm leading-relaxed text-foreground">
              <span className="text-emerald-400 font-semibold">Purpose:</span> Empower 1 million people to transform
              their lives through gratitude and community
              <br />
              <span className="text-emerald-400 font-semibold">Niche:</span> Neuroscience-backed social challenges
              with viral growth mechanics
            </div>
          </VtoBlock>

          <VtoBlock label="10-Year Target">
            <div className="text-lg font-bold text-primary">
              $100M revenue &bull; 10M lives impacted &bull; Category creator in gratitude tech
            </div>
          </VtoBlock>
        </div>

        {/* Right column - Traction */}
        <div className="space-y-0">
          <VtoBlock label="3-Year Picture (end of 2028)">
            <BulletList items={THREE_YEAR} />
          </VtoBlock>

          <VtoBlock label="1-Year Goals (2026)">
            <BulletList items={ONE_YEAR} />
          </VtoBlock>

          <VtoBlock label="Marketing Strategy">
            <div className="text-sm leading-relaxed text-foreground">
              <span className="text-emerald-400 font-semibold">Target Market:</span> Coaches, network
              marketers, spiritual entrepreneurs (30-50, US-based)
              <br />
              <span className="text-emerald-400 font-semibold">3 Uniques:</span>{" "}
              1. Neuroscience-backed gratitude system &bull;
              2. Viral K-factor growth engine &bull;
              3. Physical + digital integration (wristband)
            </div>
          </VtoBlock>
        </div>
      </div>
    </div>
  );
}
