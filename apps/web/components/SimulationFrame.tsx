"use client";
export function SimulationFrame(){const source=process.env.NEXT_PUBLIC_ZGX_SIMULATION_URL??"/simulation";return <section className="simulation-frame-shell" aria-label="Simulation Dashboard"><iframe className="simulation-frame" src={source} title="Simulation Dashboard" allow="clipboard-read; clipboard-write"/></section>}
