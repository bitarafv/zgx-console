const DIETPLAN_DEMO_URL = "https://diet.bncvc.com/?demo=true&demo_version=2";

export function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      location: DIETPLAN_DEMO_URL,
      "cache-control": "no-store",
    },
  });
}
