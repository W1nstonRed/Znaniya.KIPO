export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeTeacherName(value: string): string {
  return normalizeName(value).replace(/\*+$/g, "").trim();
}

export function normalizeGroupName(value: string): string {
  return normalizeName(value).replace(/\s+/g, "");
}
