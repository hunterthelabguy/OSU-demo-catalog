// Pure filtering semantics for the index page. The DOM script parses card
// attributes into CardFacets, control state into FilterState, and asks this
// module who is visible. Semantics live here so they are unit-tested; the
// DOM layer stays glue.
//
// Within a group, selections are OR (two topics checked shows demos having
// either). Across groups, AND (topic and time bucket must both match).
// Category and topic are independent groups: checking a category does not
// imply its subtopics, and combining a category with a subtopic homed
// elsewhere legitimately ANDs. Stubs and out-of-service records are hidden
// by default and revealed by their toggles, per spec section 4.

export interface CardFacets {
  slug: string;
  status: string;
  condition: string; // 'unknown' when the record does not say
  categories: string[]; // zero or one entries; array for uniform matching
  topics: string[];
  courses: string[];
  timeBuckets: string[]; // every bucket the demo_minutes range overlaps; [] when untimed
  rooms: string[];
  hazards: string[];
}

export interface FilterState {
  q: string;
  categories: string[];
  topics: string[];
  courses: string[];
  times: string[];
  rooms: string[];
  hazards: string[];
  showStubs: boolean;
  showOutOfService: boolean;
}

export const emptyState = (): FilterState => ({
  q: '',
  categories: [],
  topics: [],
  courses: [],
  times: [],
  rooms: [],
  hazards: [],
  showStubs: false,
  showOutOfService: false,
});

const groupMatches = (selected: string[], cardValues: string[]): boolean =>
  selected.length === 0 || selected.some((value) => cardValues.includes(value));

/** The facet-only verdict, ignoring status and condition defaults. Split out
 *  so the empty state can say "hidden matches exist; show stubs". */
export const matchesFacets = (
  card: CardFacets,
  state: FilterState,
  searchSlugs: ReadonlySet<string> | null,
): boolean =>
  groupMatches(state.categories, card.categories) &&
  groupMatches(state.topics, card.topics) &&
  groupMatches(state.courses, card.courses) &&
  groupMatches(state.times, card.timeBuckets) &&
  groupMatches(state.rooms, card.rooms) &&
  groupMatches(state.hazards, card.hazards) &&
  (searchSlugs === null || searchSlugs.has(card.slug));

export const isDefaultHidden = (card: CardFacets, state: FilterState): boolean =>
  (card.status === 'stub' && !state.showStubs) ||
  (card.condition === 'out_of_service' && !state.showOutOfService);

export const cardVisible = (
  card: CardFacets,
  state: FilterState,
  searchSlugs: ReadonlySet<string> | null,
): boolean => !isDefaultHidden(card, state) && matchesFacets(card, state, searchSlugs);

// URL round trip. Param names are part of the linkable-URL contract:
// q, cat, topic, course, time, room, hazard, stubs, oos. The pre-redesign
// `setup` param is gone; the site was pre-launch and noindex, so no
// compatibility shim.
export const serializeState = (state: FilterState): string => {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const c of state.categories) params.append('cat', c);
  for (const t of state.topics) params.append('topic', t);
  for (const c of state.courses) params.append('course', c);
  for (const t of state.times) params.append('time', t);
  for (const r of state.rooms) params.append('room', r);
  for (const h of state.hazards) params.append('hazard', h);
  if (state.showStubs) params.set('stubs', '1');
  if (state.showOutOfService) params.set('oos', '1');
  return params.toString();
};

export const parseState = (search: string): FilterState => {
  const params = new URLSearchParams(search);
  return {
    q: params.get('q') ?? '',
    categories: params.getAll('cat'),
    topics: params.getAll('topic'),
    courses: params.getAll('course'),
    times: params.getAll('time'),
    rooms: params.getAll('room'),
    hazards: params.getAll('hazard'),
    showStubs: params.get('stubs') === '1',
    showOutOfService: params.get('oos') === '1',
  };
};
