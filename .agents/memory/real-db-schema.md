---
name: Real DB schema vs Drizzle schema
description: The real PostgreSQL DB has different types/columns than what was initially designed; key differences to know before touching the schema
---

# Real DB Schema Key Facts

**Why:** When deploying to the real DB, the Drizzle schema must match exactly or queries fail with "column does not exist" errors.

## dealers table
- Has `city` (NOT NULL), NOT `location`
- Has `address`, `logo`, `subscription_tier` (NOT NULL, default 'basic'), `review_count`, `vehicle_count`
- `rating` is `integer`, NOT `numeric`

## vehicles table  
- `price` is `integer` (NOT `numeric`)
- `transmission`, `vehicle_type`, `location`, `condition` are NOT NULL
- `images` is `jsonb` type with default `'[]'::jsonb` — NOT `text[]`
- Has `vehicle_type`, `doors`, `seats`, `engine_size`, `vin`, `condition`, `views`, `updated_at`
- `dealer_id` is nullable (join must guard against null)

## inquiries table
- Uses `sender_name`, `sender_email`, `sender_phone` (NOT `name`, `email`, `phone`)
- Has `user_id` column (nullable, ignored by API for now)

## How to apply
When updating the Drizzle schema in `lib/db/src/schema/vehicles.ts`, always check real DB constraints via:
`SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name='<table>'`
