import { chartPath, formatValue, type Observation, type Reading, type Sample } from "../lib/observatory";
import styles from "./NodeObservatory.module.css";

export function TelemetryChart({ metric, history, end, windowMs, observations = [], compact = false }: {
  metric: Reading; history: Sample[]; end: number; windowMs: number;
  observations?: Observation[]; compact?: boolean;
}) {
  const visible = history.filter(sample => sample.at >= end - windowMs && sample.at <= end);
  const points = visible.filter(sample => sample.values[metric.id] !== null);
  const ceiling = Math.max(metric.id === "tensor" ? 100 : 1, ...points.map(sample => sample.values[metric.id] ?? 0));
  const path = chartPath(visible, metric.id, end, windowMs, ceiling);
  return <figure className={`${styles.chart} ${compact ? styles.compactChart : ""}`}>
    <figcaption><span>{metric.label} <small>{metric.unit}</small></span><strong>{formatValue(metric.value)}</strong></figcaption>
    <div className={styles.plot}>
      <span className={styles.ceiling}>{formatValue(ceiling)}</span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${metric.label} over the selected time window; gaps indicate missing samples.`}>
        <path d="M0,25 H100 M0,50 H100 M0,75 H100 M0,100 H100" className={styles.gridLine}/>
        {observations.filter(event => event.at >= end - windowMs && event.at <= end).map(event => {
          const x = (event.at - end + windowMs) / windowMs * 100;
          return <line key={event.id} x1={x} x2={x} y1="0" y2="100" className={styles.eventLine}><title>{event.text}</title></line>;
        })}
        <path d={path} className={styles.trace}/>
      </svg>
      {!points.length && <span className={styles.noSamples}>No measured samples in this window</span>}
      {points.length === 1 && <span className={styles.noSamples}>First sample received; collecting history</span>}
    </div>
    {!compact && <div className={styles.axis}><span>−{windowMs / 60_000} min</span><span>Source time · gaps are not zeros</span><span>Now / snapshot</span></div>}
  </figure>;
}
