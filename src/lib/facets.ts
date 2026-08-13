import type { CollectionEntry } from 'astro:content';
import { CATEGORIES, SUBTOPICS, type Category, type Subtopic } from './demo-schema';

// Facet derivation and card-data serialization. Facet values come from the
// records themselves at build time: a facet group with no values in any
// record does not render, and the UI grows as the content does.

// Spec section 4 boundaries: under 5 min / 5 to 15 / over 15. Since the
// 2026-08-13 redesign the facet is demonstration time (`demo_minutes`, a
// range), not setup time. The boundaries have teeth in tests/facets.test.ts.
export const TIME_BUCKETS = [
  { value: 'under5', label: 'under 5 min' },
  { value: '5to15', label: '5 to 15 min' },
  { value: 'over15', label: 'over 15 min' },
] as const;

export type TimeBucket = (typeof TIME_BUCKETS)[number]['value'];

export interface MinutesRange {
  min: number;
  max: number;
}

/** Every bucket a demonstration-time range overlaps. A range can span
 *  buckets, and the card then matches a selection of any of them. No range
 *  (nobody has timed it) means an empty array: the card never matches a
 *  time selection, the old 'unknown' behavior without a sentinel value. */
export const timeBuckets = (range: MinutesRange | undefined): TimeBucket[] => {
  if (range === undefined) return [];
  const buckets: TimeBucket[] = [];
  if (range.min < 5) buckets.push('under5');
  if (range.min <= 15 && range.max >= 5) buckets.push('5to15');
  if (range.max > 15) buckets.push('over15');
  return buckets;
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
  courses: string[];
  rooms: string[];
  hazards: string[];
}

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

// The calculus-based sequence renders first, in sequence order, because it
// is where these demonstrations are used most; everything else follows
// alphabetically (feedback ruling, 2026-08-13).
const COURSE_SEQUENCE = ['PH211', 'PH212', 'PH213'] as const;

export const sortCourses = (courses: readonly string[]): string[] =>
  [...courses].sort((a, b) => {
    const ia = COURSE_SEQUENCE.indexOf(a as (typeof COURSE_SEQUENCE)[number]);
    const ib = COURSE_SEQUENCE.indexOf(b as (typeof COURSE_SEQUENCE)[number]);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

/** Collect every facet value present across the records, deduplicated and
 *  sorted. Groups that come back empty are not rendered. */
export const deriveFacets = (demos: readonly Demo[]): FacetValues => ({
  courses: sortCourses(uniqueSorted(demos.flatMap((d) => d.data.course_tags))),
  rooms: uniqueSorted(demos.flatMap((d) => d.data.room_requirements)),
  hazards: uniqueSorted(demos.flatMap((d) => d.data.hazards)),
});

export interface CategoryGroup {
  category: Category;
  /** Subtopics homed in this category that at least one record carries,
   *  sorted. May be empty (the equipment case) when the category itself
   *  still has records. */
  subtopics: Subtopic[];
  /** Whether any record names this category as its primary home. */
  hasRecords: boolean;
}

/** The two-level browse structure: categories in vocabulary order, each with
 *  the subtopics homed there that some record actually carries. A subtopic
 *  is listed under its home category regardless of which records carry it,
 *  so a rotation demo tagged conservation_of_energy is reachable from the
 *  Energy disclosure. Categories with neither records nor carried subtopics
 *  are dropped. */
export const subtopicsByCategory = (demos: readonly Demo[]): CategoryGroup[] => {
  const carried = new Set<Subtopic>(demos.flatMap((d) => d.data.topics));
  return CATEGORIES.map((category) => ({
    category,
    subtopics: (Object.keys(SUBTOPICS) as Subtopic[])
      .filter((s) => SUBTOPICS[s].category === category && carried.has(s))
      .sort((a, b) => a.localeCompare(b)),
    hasRecords: demos.some((d) => d.data.category === category),
  })).filter((group) => group.hasRecords || group.subtopics.length > 0);
};
