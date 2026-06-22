// Path of the saved Playwright storage state (cookies + localStorage) produced
// by the `setup` project (auth.setup.ts) and consumed by the browser project.
// Logging in once and reusing this state keeps every spec from re-running the
// login UI flow against the shared engine. Relative to the tests/ cwd, which is
// where both the config and the CI command run.
export const STORAGE_STATE = 'dist/.auth/storage-state.json';
