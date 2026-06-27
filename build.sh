#!/bin/sh
set -e
pnpm --filter @workspace/db exec tsc -p tsconfig.json
cd lib/api-zod && pnpm exec tsc src/index.ts src/generated/api.ts --declaration --emitDeclarationOnly --outDir dist --module esnext --moduleResolution bundler --target es2022
cd ../..
pnpm --filter @workspace/api-client-react exec tsc -p tsconfig.json
pnpm --filter @workspace/horizone run build
