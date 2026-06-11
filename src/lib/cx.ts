export type ClassValue = string | number | false | null | undefined;

/** Tiny classNames joiner — keeps truthy class tokens, space-joined. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
