// Demo store, used whenever BLOB_READ_WRITE_TOKEN is not set:
// local development and PR preview deployments.
//
// It starts with a handful of made-up Maxes and keeps changes in memory only,
// so you can sign up, edit and delete freely. Nothing here ever touches the
// real sign-ups, and everything resets when the server restarts.
//
// Files in /api that start with "_" are not deployed as their own endpoint.

const now = '2026-01-01T12:00:00.000Z';

const seed = [
  { id: 'demo0000000000000001', name: 'Max Demo',        city: 'Berlin',    country: 'Germany',        skills: ['TypeScript', 'Bouldering'], bald: 'no',  lat: 52.52,   lng: 13.405 },
  { id: 'demo0000000000000002', name: 'Max Example',     city: 'Munich',    country: 'Germany',        skills: ['Finance', 'Skiing'],        bald: 'yes', lat: 48.1351, lng: 11.582 },
  { id: 'demo0000000000000003', name: 'Max Placeholder', city: 'Vienna',    country: 'Austria',        skills: ['Design'],                   bald: 'no',  lat: 48.2082, lng: 16.3738 },
  { id: 'demo0000000000000004', name: 'Max Testington',  city: 'Zurich',    country: 'Switzerland',    skills: ['Rust', 'Cooking'],          bald: 'no',  lat: 47.3769, lng: 8.5417 },
  { id: 'demo0000000000000005', name: 'Max Sample',      city: 'Lisbon',    country: 'Portugal',       skills: ['Sales', 'Surfing'],         bald: 'yes', lat: 38.7223, lng: -9.1393 },
  { id: 'demo0000000000000006', name: 'Max Mock',        city: 'New York',  country: 'United States',  skills: ['Law'],                      bald: 'no',  lat: 40.7128, lng: -74.006 },
  { id: 'demo0000000000000007', name: 'Max Fixture',     city: 'Singapore', country: 'Singapore',      skills: ['Hardware', 'Chess'],        bald: 'no',  lat: 1.3521,  lng: 103.8198 },
  { id: 'demo0000000000000008', name: 'Max Stub',        city: 'Cape Town', country: 'South Africa',   skills: ['Medicine'],                 bald: 'yes', lat: -33.9249, lng: 18.4241 },
].map((m) => ({ ...m, createdAt: now, updatedAt: now }));

const store = new Map(seed.map((m) => [m.id, m]));

export const demo = {
  async readAll() {
    return [...store.values()].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  },
  async save(max) {
    store.set(max.id, max);
  },
  async remove(id) {
    store.delete(id);
  },
};
