#!/bin/sh
set -e
pnpm --filter @workspace/db exec tsc -p tsconfig.json
pnpm --filter @workspace/api-zod exec tsc -p tsconfig.json
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-client-react exec tsc -p tsconfig.json
pnpm --filter @workspace/horizone run build
