// Request integration is deferred and will be purpose-built (spec section 5).
// The "Request this demo" button renders only when this template is non-null,
// with {slug} substituted. Turning the feature on is a one-line change here.
//
// The single durable contract carried forward: whatever request system gets
// built accepts `slug` as its demo identifier and stores it verbatim. That is
// what makes usage telemetry joinable to the catalog without a migration.
//
// e.g. "https://requests.example.edu/new?demo={slug}"
export const REQUEST_URL_TEMPLATE: string | null = null;
