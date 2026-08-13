import type { CollectionEntry } from 'astro:content';

// Facet derivation and card-data serialization. Facet values come from the
// records themselves at build time: a facet group with no values in any
// record does not render, and the UI grows as the content does.

// Spec section 4 buckets: under 5 min / 5 to 15 / over 15. The boundaries
// have teeth in tests/facets.test.ts.
export const SETUP_BUCKETS = [
  { value: 'under5', label: 'under 5 min' },
  { value: '5to15', label: '5 to 15 min' },
  { value: 'over15', label: 'over 15 min' },
] as const;

export type SetupBucket = (typeof SETUP_BUCKETS)[number]['value'] | 'unknown';

export const setupBucket = (minutes: number | undefined): SetupBucket => {
  if (minutes === undefined) return 'unknown';
  if (minutes < 5) return 'under5';
  if (minutes <= 15) return '5to15';
  return 'over15';
};

// Multi-value card attributes are pipe-joined. Pipes do not survive in
// values; topics and course tags are prose-adjacent but a pipe in either
// would be a typo, and the schema's build-time validation is the place to
// extend if that ever proves wrong.
export const joinValues = (values: readonly string[]): string => values.join('|');
export const splitValues = (joined: string): string[] =>
  joined.length === 0 ? [] : joined.split('|');

type Demo = CollectionEntry<'demos'>;

export interface FacetValues {
  topics: string[];
  courses: string[];
  rooms: string[];
  hazards: string[];
}

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

/** Collect every facet value present across the records, deduplicated and
 *  sorted. Groups that come back empty are not rendered. */
export const deriveFacets = (demos: readonly Demo[]): FacetValues => ({
  topics: uniqueSorted(demos.flatMap((d) => d.data.topics)),
  courses: uniqueSorted(demos.flatMap((d) => d.data.course_tags)),
  rooms: uniqueSorted(demos.flatMap((d) => d.data.room_requirements)),
  hazards: uniqueSorted(demos.flatMap((d) => d.data.hazards)),
});
