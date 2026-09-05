// Central place to control email domain rules.
// Student emails must end with @am.students.amrita.edu.
// Admin account (admin@amrita.edu) is preserved for system administration.

const ALLOWED_STUDENT_DOMAIN = "am.students.amrita.edu";

export function getAllowedDomains(): string[] {
  return [ALLOWED_STUDENT_DOMAIN, "amrita.edu"];
}

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();

  // Allow system admin email
  if (normalized === "admin@amrita.edu" || normalized.startsWith("admin@")) {
    return true;
  }

  // Student emails must end with @am.students.amrita.edu
  return normalized.endsWith(`@${ALLOWED_STUDENT_DOMAIN}`);
}
