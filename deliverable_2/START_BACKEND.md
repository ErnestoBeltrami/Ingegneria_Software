# Start Backend (IoSonoTrento)

## 1) Go to the correct folder

```bash
cd "/home/fallenangel/Ingegneria_Software/deliverable_2"
```

## 2) Install dependencies

```bash
npm install
```

## 3) Start backend (dev mode)

```bash
npm run dev
```

Alternative (no auto-reload):

```bash
npm start
```

## 4) Quick checks

- Health endpoint: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`

## Notes

- Run commands from `deliverable_2` (not repo root).
- If `nodemon` is stuck after a crash, stop with `Ctrl+C` and run again.
- If you see `Cannot find package 'mongoose'`, install from `deliverable_2`:

```bash
npm --prefix "/home/fallenangel/Ingegneria_Software/deliverable_2" install mongoose
```

