// Display formatting for record fields. Lives here rather than inline in
// page templates so the display contract is testable and the templates stay
// glue.

/** Controlled-vocabulary tokens render with spaces: needs_dark -> needs dark */
export const humanize = (token: string): string => token.replaceAll('_', ' ');

/** Sentence case for a label that stands alone, such as a card's hazard
 *  badge: high_voltage -> High voltage. Only the first letter is raised,
 *  never every word. */
export const sentenceCase = (token: string): string => {
  const text = humanize(token);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Dates render as YYYY-MM-DD everywhere: unambiguous, sortable, mono-friendly. */
export const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Durations render with an explicit unit. */
export const formatMinutes = (minutes: number): string => `${minutes} min`;

/** Demonstration-time ranges: "10 min" when degenerate, "5 to 15 min"
 *  otherwise. Spelled out, house style: no dashes of any kind. */
export const formatMinutesRange = (range: { min: number; max: number }): string =>
  range.min === range.max ? `${range.min} min` : `${range.min} to ${range.max} min`;

// Amendment 22: `verified` means the record's content is reviewed; the
// physical check is `last_verified`. The gap between them is disclosed.
export const physicalCheckNote = (
  status: 'stub' | 'drafted' | 'verified',
  lastVerified: Date | undefined,
): string | null =>
  status === 'verified' && lastVerified === undefined
    ? 'Content reviewed. Apparatus not yet checked in person.'
    : null;
