# Veluws Verleden

The app uses the Next.js Pages Router. The homepage is implemented in `src/components/home/HomePage.tsx` and served at `/` through `src/pages/index.tsx`. The interactive schoolplate is at `/schoolplaat`.

The shared Roman-inspired color palette is defined with `--roman-*` CSS variables in `src/styles/globals.css`.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Tests

De Molenspel regels zijn getest met Node's built-in test runner. Node 22.6 of nieuwer is nodig for the TypeScript stripping flag.

```bash
npm test
```

## Production

```bash
npm run build
npm start
```
