import { createPublicKey, verify } from "node:crypto";

type AccessClaims = { aud?: string | string[]; email?: string; exp?: number; iss?: string; nbf?: number };
type AccessKey = JsonWebKey & { kid?: string };
let keyCache: { expiresAt: number; keys: AccessKey[] } | undefined;

function decodePart<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

async function accessKeys(teamDomain: string): Promise<AccessKey[]> {
  if (keyCache && keyCache.expiresAt > Date.now()) return keyCache.keys;
  const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, {
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Unable to retrieve Cloudflare Access keys");
  const body = (await response.json()) as { keys?: AccessKey[] };
  if (!body.keys?.length) throw new Error("Cloudflare Access returned no keys");
  keyCache = { keys: body.keys, expiresAt: Date.now() + 60 * 60 * 1000 };
  return body.keys;
}

export async function verifiedAccessEmail(jwt: string): Promise<string | null> {
  const teamDomain = (process.env.ZGX_ACCESS_TEAM_DOMAIN ?? "").replace(/\/$/, "");
  const audiences = new Set(
    (process.env.ZGX_ACCESS_AUDS ?? "").split(",").map((value) => value.trim()).filter(Boolean),
  );
  if (!teamDomain || audiences.size === 0) return null;
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    const header = decodePart<{ alg?: string; kid?: string }>(parts[0]);
    const claims = decodePart<AccessClaims>(parts[1]);
    if (header.alg !== "RS256" || !header.kid || !claims.email) return null;
    const now = Math.floor(Date.now() / 1000);
    if (!claims.exp || claims.exp <= now || (claims.nbf && claims.nbf > now + 30)) return null;
    if (claims.iss !== teamDomain) return null;
    const tokenAudiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!tokenAudiences.some((audience) => audience && audiences.has(audience))) return null;
    const key = (await accessKeys(teamDomain)).find((candidate) => candidate.kid === header.kid);
    if (!key) return null;
    const valid = verify(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`),
      createPublicKey({ key, format: "jwk" }),
      Buffer.from(parts[2], "base64url"),
    );
    return valid ? claims.email.toLowerCase() : null;
  } catch {
    return null;
  }
}
