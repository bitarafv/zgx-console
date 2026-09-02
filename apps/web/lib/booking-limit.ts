export function isBookingLimitExempt(email: string, configured = process.env.ZGX_BOOKING_LIMIT_EXEMPT_EMAIL) {
  const exempt = typeof configured === "string" ? configured.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(exempt) && email === exempt;
}
