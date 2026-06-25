---
name: lib/db rebuild required after schema changes
description: lib/db uses TypeScript project references with composite:true, emitting to dist/; dependents read stale dist/ until rebuilt
---

# lib/db Must Be Rebuilt After Schema Changes

**Why:** The `lib/db` package uses TypeScript project references (`composite: true`, `emitDeclarationOnly: true`) and emits type declarations to `lib/db/dist/`. When the api-server runs `tsc --noEmit`, it reads from `lib/db/dist/` not source — so schema changes don't take effect until you rebuild.

**How to apply:**
After any change to `lib/db/src/schema/vehicles.ts` (or any lib/db source), run:
```
pnpm --filter @workspace/db exec tsc -p tsconfig.json
```
Then re-run the typecheck on dependent packages.

Note: `lib/db` exports directly from source via `"./src/index.ts"` in package.json, but TypeScript project references still use the compiled `dist/` declarations for type checking.
