export const hardware = {
  nano: { name: "ZGX Nano", price: 6000, watts: 140, license: 650 },
  fury: { name: "ZGX Fury", price: 125000, watts: 1200, license: 4500 },
} as const;

export const cloudGpus = {
  a10: { name: "A10 24 GB", hourly: 0.5 },
  a100_40: { name: "A100 40 GB", hourly: 1.1 },
  a100_80: { name: "A100 80 GB", hourly: 2.0 },
  l40s: { name: "L40S 48 GB", hourly: 1.57 },
  b200: { name: "B200 192 GB", hourly: 4.86 },
} as const;

export type TcoInput = {
  hardwarePrice: number;
  watts: number;
  licensePerYear: number;
  includeLicense: boolean;
  cloudHourly: number;
  gpuCount: number;
  annualHours: number;
  years: number;
  electricityRate: number;
};

export function calculateTco(input: TcoInput) {
  const cloudAnnual = input.cloudHourly * input.gpuCount * input.annualHours + (input.includeLicense ? input.licensePerYear : 0);
  const powerAnnual = input.watts / 1000 * input.annualHours * input.electricityRate;
  const cloudTotal = cloudAnnual * input.years;
  const zgxTotal = input.hardwarePrice + powerAnnual * input.years;
  const monthlyAvoided = cloudAnnual / 12 - powerAnnual / 12;
  return {
    cloudAnnual,
    powerAnnual,
    cloudTotal,
    zgxTotal,
    savings: cloudTotal - zgxTotal,
    breakEvenMonths: monthlyAvoided > 0 ? Math.ceil(input.hardwarePrice / monthlyAvoided) : null,
  };
}

