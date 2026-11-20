# Max Network Map 🌍

Every Max, one map. A spinning globe of all the Maxes in our WhatsApp group: where they are, what they're good at, and (crucially) whether they're bald.

**Live:** https://max-network-map.vercel.app

## How it works

- `index.html`: the whole frontend in one file (globe, hover cards, filters, sign-up sheet). No build step.
- `api/maxes.js`: one serverless function. `GET` lists every Max, `POST` adds or updates your own pin, `DELETE` removes it.
- Storage: one JSON file per Max in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). Each browser gets a random token, so you can only edit your own pin.
- Pins are shifted by ~2 km so nobody's exact location is shown.

## Run it locally

You need Node 20+. No accounts, no keys.

```bash
git clone https://github.com/MaximilianSchleper/mnm.git
cd mnm
npm install
npm run dev
```

Open http://localhost:3000. Without a storage token the app runs in **demo mode**: a handful of made-up Maxes kept in memory. Sign up, edit and delete as much as you like; it resets when you restart.

## Contributing

Yes please, especially if your name is Max. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

The real sign-ups are never in this repo and never reach preview deployments. They live only in the production storage. If you find a way to break that, tell Max (the original one) before opening a public issue.

## License

[MIT](LICENSE)
