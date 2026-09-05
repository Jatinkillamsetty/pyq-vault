// Central place to control email domain rules.
// Any valid email is allowed to register and log in.

export function getAllowedDomains(): string[] {
  return [];
}

export function isAllowedEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

