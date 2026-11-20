// GET  /api/maxes  -> { maxes: [...] }   every Max on the map
// POST /api/maxes  -> { max }            add yourself, or update your own entry
// DELETE /api/maxes -> { ok }             remove your own entry
//
// Storage: one JSON blob per Max in Vercel Blob, at maxes/<id>.json.
// <id> is a SHA-256 of a random token that lives only in the submitter's
// browser, so the same browser can update its own pin and nobody else's.
//
// Without BLOB_READ_WRITE_TOKEN (local dev, PR previews) the API runs in demo
// mode: made-up Maxes, kept in memory, never the real sign-ups. See _demo.js.

import { put, list, get, del } from '@vercel/blob';
import { createHash } from 'node:crypto';
import { demo } from './_demo.js';

const ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const PREFIX = 'maxes/';
const DEMO = !process.env.BLOB_READ_WRITE_TOKEN;

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function readAll() {
  if (DEMO) return demo.readAll();
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    cursor = page.hasMore ? page.cursor : undefined;
    const rows = await Promise.all(page.blobs.map(async (b) => {
      try {
        if (ACCESS === 'public') {
          const r = await fetch(b.url, { cache: 'no-store' });
          return r.ok ? await r.json() : null;
        }
        const res = await get(b.pathname, { access: 'private', useCache: false });
        if (!res) return null;
        return JSON.parse(await new Response(res.stream).text());
      } catch { return null; }
    }));
    out.push(...rows.filter(Boolean));
  } while (cursor);
  out.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  return out;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (req.method === 'GET') {
      const maxes = await readAll();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).end(JSON.stringify(DEMO ? { maxes, demo: true } : { maxes }));
    }

    if (req.method === 'POST') {
      const b = await readBody(req);

      // Honeypot: bots fill every field, people never see this one.
      if (b.website) return res.status(200).end(JSON.stringify({ ok: true }));

      const token = clean(b.token, 80);
      if (token.length < 20) return bad(res, 'Missing browser token. Reload the page and try again.');
      const id = createHash('sha256').update(token).digest('hex').slice(0, 20);

      const name = clean(b.name, 60);
      const city = clean(b.city, 80);
      const country = clean(b.country, 60);
      const lat = Number(b.lat), lng = Number(b.lng);
      const skills = (Array.isArray(b.skills) ? b.skills : String(b.skills || '').split(','))
        .map((s) => clean(s, 32)).filter(Boolean).slice(0, 6);
      const bald = b.bald === 'yes' ? 'yes' : b.bald === 'no' ? 'no' : '';

      if (!name) return bad(res, 'Add your name.');
      if (!city || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
        return bad(res, 'Pick your city from the suggestions so we can place your pin.');
      if (b.consent !== true) return bad(res, 'Tick the box to appear on the public map.');

      // Keep the original join date (and pin offset) when someone edits their entry.
      let prev = null;
      try {
        const all = await readAll();
        prev = all.find((m) => m.id === id) || null;
      } catch { /* first write */ }

      // Small random offset (~2 km) so Maxes in the same city don't stack, and nobody's exact spot is shown.
      const sameCity = prev && prev.city === city;
      const jlat = sameCity ? prev.lat : lat + (Math.random() - 0.5) * 0.04;
      const jlng = sameCity ? prev.lng : lng + (Math.random() - 0.5) * 0.06;

      const max = {
        id, name, city, country, skills, bald,
        lat: Math.round(jlat * 1e4) / 1e4,
        lng: Math.round(jlng * 1e4) / 1e4,
        createdAt: prev?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (DEMO) await demo.save(max);
      else await put(`${PREFIX}${id}.json`, JSON.stringify(max), {
        access: ACCESS,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).end(JSON.stringify({ max }));
    }

    if (req.method === 'DELETE') {
      const b = await readBody(req);
      const token = clean(b.token, 80);
      if (token.length < 20) return bad(res, 'This device has no pin to remove.');
      const id = createHash('sha256').update(token).digest('hex').slice(0, 20);
      if (DEMO) await demo.remove(id);
      else await del(`${PREFIX}${id}.json`);
      return res.status(200).end(JSON.stringify({ ok: true }));
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    console.error(err);
    const msg = /token|BLOB/i.test(String(err && err.message))
      ? 'Storage is not connected yet.'
      : 'Something went wrong on the server. Try again in a moment.';
    return res.status(500).end(JSON.stringify({ error: msg }));
  }
}

function bad(res, error) {
  return res.status(400).end(JSON.stringify({ error }));
}
