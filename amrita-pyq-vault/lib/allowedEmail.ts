// Central place to control email domain rules.
// Any valid student email is allowed.

export function getAllowedDomains(): string[] {
  return ["*"];
}

export function isAllowedEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  return true;
}
