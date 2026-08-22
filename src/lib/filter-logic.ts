// Pure filtering semantics for the index page. The DOM script parses card
// attributes into CardFacets, control state into FilterState, and asks this
// module who is visible. Semantics live here so they are unit-tested; the
// DOM layer stays glue.
//
// Two bands of controls (build-plan amendment 15):
//
// Scope always narrows. Course is the instructor's standing context, not a
// topical filter, so a checked course ANDs with everything else; the search
// query intersects the same way. Stubs and out-of-service records are
// hidden by default and revealed by their toggles, per spec section 4.
//
// The topical facets (category, subtopic, time, room) combine by `mode`.
// Within one group a selection is always OR (two topics checked shows demos
// having either). Across groups, 'any' (the default) shows a card matching
// any selected value in any group, so a widening selection widens; 'all'
// is the conjunction, a card must satisfy every group with a selection.
// Category and subtopic stay independent groups with no parent/child
// logic: checking a category does not imply its subtopics, and under 'all'
// a category plus a subtopic homed elsewhere legitimately ANDs to nothing,
// which is the case that prompted the mode control.

export type MatchMode = 'any' | 'all';

export interface CardFacets {
  slug: string;
  status: string;
  condition: string; // 'unknown' when the record does not say
  categories: string[]; // zero or one entries; array for uniform matching
  topics: string[];
  courses: string[];
  timeBuckets: string[]; // every bucket the demo_minutes range overlaps; [] when untimed
  rooms: string[];
}

export interface FilterState {
  q: string;
  mode: MatchMode;
  categories: string[];
  topics: string[];
  courses: string[];
  times: string[];
  rooms: string[];
  showStubs: boolean;
  showOutOfService: boolean;
}

export const emptyState = (): FilterState => ({
  q: '',
  mode: 'any',
  categories: [],
  topics: [],
  courses: [],
  times: [],
  rooms: [],
  showStubs: false,
  showOutOfService: false,
});

const groupMatches = (selected: string[], cardValues: string[]): boolean =>
  selected.length === 0 || selected.some((value) => cardValues.includes(value));

// The topical band as (selection, card values) pairs, so both modes read
// the same list and a new facet group is added in exactly one place.
const topicalPairs = (card: CardFacets, state: FilterState): [string[], string[]][] => [
  [state.categories, card.categories],
  [state.topics, card.topics],
  [state.times, card.timeBuckets],
  [state.rooms, card.rooms],
];

const topicalMatches = (card: CardFacets, state: FilterState): boolean => {
  const pairs = topicalPairs(card, state);
  if (state.mode === 'all') return pairs.every(([selected, values]) => groupMatches(selected, values));
  // 'any': groups with nothing selected impose nothing, and with nothing
  // selected anywhere the band is no constraint at all.
  const active = pairs.filter(([selected]) => selected.length > 0);
  return active.length === 0 || active.some(([selected, values]) => groupMatches(selected, values));
};

/** The facet-only verdict, ignoring status and condition defaults. Split out
 *  so the empty state can say "hidden matches exist; show stubs". */
export const matchesFacets = (
  card: CardFacets,
  state: FilterState,
  searchSlugs: ReadonlySet<string> | null,
): boolean =>
  groupMatches(state.courses, card.courses) &&
  (searchSlugs === null || searchSlugs.has(card.slug)) &&
  topicalMatches(card, state);

export const isDefaultHidden = (card: CardFacets, state: FilterState): boolean =>
  (card.status === 'stub' && !state.showStubs) ||
  (card.condition === 'out_of_service' && !state.showOutOfService);

export const cardVisible = (
  card: CardFacets,
  state: FilterState,
  searchSlugs: ReadonlySet<string> | null,
): boolean => !isDefaultHidden(card, state) && matchesFacets(card, state, searchSlugs);

// The removable-chip row above the grid (2a design, build-plan amendment
// 12). Each entry maps one checked facet box; the DOM layer renders a
// remove button per entry and unchecks the named control. Search is not a
// chip: the query is already visible and editable in the search box. The
// match mode is not a chip either: it is how the chips combine, not one of
// them.
export interface ActiveSelection {
  param: 'cat' | 'topic' | 'course' | 'time' | 'room';
  value: string;
}

export const activeSelections = (state: FilterState): ActiveSelection[] => [
  ...state.categories.map((value) => ({ param: 'cat', value }) as const),
  ...state.topics.map((value) => ({ param: 'topic', value }) as const),
  ...state.courses.map((value) => ({ param: 'course', value }) as const),
  ...state.times.map((value) => ({ param: 'time', value }) as const),
  ...state.rooms.map((value) => ({ param: 'room', value }) as const),
];

/** The dashed note under a filtered grid naming hidden stubs that match
 *  the active filters, so "no results" and "thin results" stop implying
 *  the stockroom lacks the demo. Rendered only when a filter or search is
 *  active: unfiltered, the note would name all 42 stubs. The cap keeps a
 *  broad filter from doing the same. */
export const hiddenStubNote = (titles: readonly string[], cap = 8): string => {
  if (titles.length === 0) return '';
  const shown = titles.slice(0, cap);
  const extra = titles.length - shown.length;
  const list = shown.join(', ') + (extra > 0 ? `, and ${extra} more` : '');
  return titles.length === 1
    ? `1 stub record also matches: ${list}.`
    : `${titles.length} stub records also match: ${list}.`;
};

// URL round trip. Param names are part of the linkable-URL contract:
// q, match, cat, topic, course, time, room, stubs, oos. `match` appears only
// as `match=all`; the default mode leaves the URL clean. The pre-redesign
// `setup` param and the `hazard` facet are gone; the site was pre-launch
// and noindex, so no compatibility shim.
export const serializeState = (state: FilterState): string => {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.mode === 'all') params.set('match', 'all');
  for (const c of state.categories) params.append('cat', c);
  for (const t of state.topics) params.append('topic', t);
  for (const c of state.courses) params.append('course', c);
  for (const t of state.times) params.append('time', t);
  for (const r of state.rooms) params.append('room', r);
  if (state.showStubs) params.set('stubs', '1');
  if (state.showOutOfService) params.set('oos', '1');
  return params.toString();
};

export const parseState = (search: string): FilterState => {
  const params = new URLSearchParams(search);
  return {
    q: params.get('q') ?? '',
    mode: params.get('match') === 'all' ? 'all' : 'any',
    categories: params.getAll('cat'),
    topics: params.getAll('topic'),
    courses: params.getAll('course'),
    times: params.getAll('time'),
    rooms: params.getAll('room'),
    showStubs: params.get('stubs') === '1',
    showOutOfService: params.get('oos') === '1',
  };
};
