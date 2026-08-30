"use client";
import type { Workload } from "@/lib/types";
import { BLENDED_CLOUD_RATES, DEFAULT_ELECTRICITY_RATE, blendedRate, type BlendedCloudRate, workloadTokenSavings } from "@/lib/token-savings";

type Savings = NonNullable<ReturnType<typeof workloadTokenSavings>>;
const currency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
const hours = (seconds: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(seconds / 3600);

export function TokenSavingsMeter({ item }: { item: Workload }) {
  const savings = workloadTokenSavings(item);
  const rateConfig = BLENDED_CLOUD_RATES[item.id];
  const tooltipId = `savings-help-${item.id}`;
  if (!savings) return <div className="savings-meter savings-meter-waiting"><div className="savings-meter-head"><span>Net token savings</span><small>Awaiting usage telemetry</small>{rateConfig && <SavingsHelp item={item} config={rateConfig} tooltipId={tooltipId}/>}</div></div>;
  const pendingPower = savings.netSavings == null;
  return <div className="savings-meter" aria-live="polite">
    <div className="savings-meter-head"><span>Net token savings</span>{pendingPower ? <small>Awaiting power telemetry</small> : <strong className={savings.netSavings! < 0 ? "negative" : undefined}>{currency(savings.netSavings!)} net saved</strong>}<SavingsHelp item={item} config={savings.rateConfig} tooltipId={tooltipId} savings={savings}/></div>
  </div>;
}

function SavingsHelp({ item, config, tooltipId, savings }: { item: Workload; config: BlendedCloudRate; tooltipId: string; savings?: Savings }) {
  const powerReady = savings?.powerCost != null && savings.activeSeconds != null;
  return <button type="button" className="savings-help" aria-label={`How ${item.name} net savings are calculated`} aria-describedby={tooltipId}>?<span role="tooltip" id={tooltipId}>
    <span><b>Net Token Savings:</b><strong>{savings?.netSavings == null ? "Awaiting telemetry" : `${currency(savings.netSavings)} saved`}</strong></span>
    <p className="savings-equation">({savings?.powerCost == null ? "Gross and power totals unavailable" : `Gross Savings: ${currency(savings.grossSavings)} - Power Cost: ${currency(savings.powerCost)}`})</p>
    <span><b>Blended Cloud Rate:</b><strong>{currency(blendedRate(config))} / 1M tokens</strong></span>
    <p><b>Formula:</b> ({config.inputPercent}% Input @ {currency(config.inputRate)}/1M) + ({config.outputPercent}% Output @ {currency(config.outputRate)}/1M)</p>
    <p><b>Power Offset Calculation:</b></p>
    <p>{powerReady ? `${hours(savings.activeSeconds!)} hrs @ ${savings.averageWatts.toFixed(1)} W x ${currency(DEFAULT_ELECTRICITY_RATE)}/kWh = ${currency(savings.powerCost!)}` : "Active runtime and power telemetry unavailable"}</p>
    <p><b>Why this rate:</b> {config.rationale}</p>
  </span></button>;
}
