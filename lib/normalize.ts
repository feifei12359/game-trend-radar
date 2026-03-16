export function normalizeGameName(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .replace(/\s+/g, " ");

  return normalized || "";
}
