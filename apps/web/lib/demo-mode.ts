export function demoModeUrl(value: string | null | undefined): string | null {
  if (!value || value === "#") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.searchParams.set("demo", "true");
    return url.toString();
  } catch {
    return null;
  }
}

export function productionModeUrl(value: string | null | undefined): string | null {
  if (!value || value === "#") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.searchParams.delete("demo");
    return url.toString();
  } catch {
    return null;
  }
}
