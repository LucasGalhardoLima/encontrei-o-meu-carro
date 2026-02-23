# API Contracts: Preference-Based Car Discovery

**Feature Branch**: `001-preference-car-discovery`
**Date**: 2026-02-18

## Public Endpoints

### GET /api/cars

Fetch multiple cars by IDs. Only returns approved cars.

**Query Parameters**:
- `ids` (string, required) — Comma-separated UUIDs, max 20.

**Response 200**:
```json
{
  "cars": [
    {
      "id": "uuid",
      "brand": "Fiat",
      "model": "Argo Drive 1.0",
      "year": 2024,
      "price_avg": "69215.00",
      "type": "Hatch",
      "imageUrl": "https://...",
      "fipe_code": "001494-0",
      "spec": {
        "trunk_liters": 300,
        "tank_capacity": 48,
        "wheelbase": 2.52,
        "ground_clearance": 150,
        "fuel_consumption_city": 11.3,
        "fuel_consumption_highway": 14.1,
        "hp": 75,
        "acceleration": 13.5,
        "transmission": "Manual",
        "fuel_type": "Flex",
        "trunk_score": 3.6,
        "consumption_score": 6.6,
        "hp_score": 1.5,
        "acceleration_score": 3.0,
        "wheelbase_score": 4.5,
        "ground_clearance_score": 1.0
      },
      "images": [
        { "url": "https://...", "isPrimary": true }
      ]
    }
  ]
}
```

**Response 400**: `{ "error": "ids parameter required" }`

**Validation**: UUIDs validated via regex. Max 20 IDs enforced.
Only `moderation_status = "approved"` cars returned.

---

### GET /api/cars/search

Search and filter the approved catalog.

**Query Parameters**:
- `brand` (string, optional) — Filter by brand name.
- `type` (string, optional) — Filter by body type.
- `minPrice` (number, optional) — Minimum price in BRL.
- `maxPrice` (number, optional) — Maximum price in BRL.
- `page` (number, optional, default 1) — Pagination page.
- `limit` (number, optional, default 20, max 50) — Items per page.
- `sort` (string, optional) — Sort field: "price", "brand", "year".
- `order` (string, optional, default "asc") — "asc" or "desc".

**Response 200**:
```json
{
  "cars": [ /* same car shape as /api/cars */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### POST /api/feedback

Record user feedback on a car recommendation.

**Request Body** (JSON):
```json
{
  "carId": "uuid",
  "thumbs": true,
  "weights": {
    "comfort": 30,
    "economy": 40,
    "performance": 10,
    "space": 20
  }
}
```

**Validation**: Zod schema. `carId` must be valid UUID referencing
an approved car. `thumbs` required boolean. `weights` optional.

**Response 200**: `{ "success": true }`
**Response 400**: `{ "error": "Invalid payload" }`
**Response 405**: `{ "error": "Method not allowed" }`

---

### GET /resource.og

Generate dynamic Open Graph images for social sharing.

**Query Parameters**:
- `carId` (string, required) — UUID of the car.

**Response 200**: PNG image (1200x630px) with car photo, name,
price, and match highlights.

**Response 404**: Default fallback OG image.

---

## SSR Loader Contracts

These are React Router loader functions, not REST endpoints. They
run server-side and provide data to route components.

### Homepage Loader (`/`)

**Returns**: Minimal data — no car loading needed. Static page
with quiz CTA.

### Quiz Loader (`/quiz`)

**Returns**: Empty (quiz is client-side with Zustand state).

### Results Loader (`/results`)

**Query Parameters** (from URL):
- `w_comfort` (number) — Comfort weight.
- `w_economy` (number) — Economy weight.
- `w_performance` (number) — Performance weight.
- `w_space` (number) — Space weight.
- `mode` (string) — "match" or "browse".
- `brand` (string, optional) — Filter.
- `type` (string, optional) — Filter.
- `page` (number, optional) — Pagination.

**Returns**:
```typescript
{
  cars: Array<Car & {
    spec: Spec;
    matchResult?: {
      percentage: number;
      categoryScores: Record<string, number>;
      badges: string[];
    };
  }>;
  pagination: { page: number; total: number; totalPages: number };
  mode: "match" | "browse";
}
```

**Logic**: If mode=match, loads all approved cars, calculates match
scores via `calculateMatch()`, sorts by percentage desc. If
mode=browse, loads approved cars without scoring, sorts by brand.

### Car Detail Loader (`/carros/:id`)

**Params**: `id` (UUID).

**Returns**:
```typescript
{
  car: Car & {
    spec: Spec;
    images: CarImage[];
  };
  enrichedMetrics: {
    range_km: number;
    fuel_stops_400km: number;
    suitcase_count: number;
    trip_label: string;  // "Completa 400km sem parar"
    trunk_label: string; // "Cabe 4 malas grandes"
  };
  marketplaceLinks: {
    webmotors: string;
    olx: string;
    mercadolivre: string;
  };
}
```

### Compare Loader (`/compare`)

**Query Parameters**: `ids` (comma-separated UUIDs, 2-4).

**Returns**:
```typescript
{
  cars: Array<Car & {
    spec: Spec;
    enrichedMetrics: EnrichedMetrics;
  }>;
}
```

### Garage Loader (`/garagem`)

**Note**: Car IDs come from client-side Zustand store. Loader
receives IDs via URL search params (set by client on navigation).

**Returns**: Same shape as `/api/cars` response.

---

## Admin Endpoints

All admin routes require Basic HTTP authentication via
`requireAdminAuth()`.

### Admin Moderation Queue Loader (`/admin`)

**Returns**:
```typescript
{
  pendingCars: Array<Car & { spec: Spec; source_data: unknown }>;
  approvedCount: number;
  pendingCount: number;
  recentJobs: IngestionJob[];
}
```

### POST /admin/cars/:id/approve

**Action**: Sets `moderation_status = "approved"`, recalculates
scores via `calculateScores()`.

**Response**: Redirect to `/admin`.

### POST /admin/cars/:id/reject

**Request Body**: `{ "reason": "string" }`

**Action**: Sets `moderation_status = "rejected"`, creates
RejectedCar entry with fipe_code to prevent re-ingestion.

**Response**: Redirect to `/admin`.

### POST /admin/cars/new

**Request Body**: CarFormSchema (Zod validated).

**Action**: Creates car with `moderation_status = "approved"`,
calculates scores, saves.

**Response**: Redirect to `/admin/cars/:id`.

### PUT /admin/cars/:id

**Request Body**: CarFormSchema (Zod validated).

**Action**: Updates car, recalculates scores, saves.

**Response**: Redirect to `/admin/cars/:id`.

### DELETE /admin/cars/:id

**Action**: Cascading delete (car + spec + feedback + images).

**Response**: Redirect to `/admin`.

### POST /admin/ingestion/trigger

**Action**: Manually trigger an ingestion job (outside of cron
schedule).

**Response**: `{ "jobId": "uuid", "status": "pending" }`

---

## Ingestion Pipeline Contracts (Internal)

These are not HTTP endpoints — they are internal service functions
called by the cron job.

### runIngestionJob()

**Trigger**: Cron at 3 AM BRT daily, or manual via admin.

**Steps**:
1. Create IngestionJob record (status: running).
2. Fetch brands + models from Parallelum FIPE v2.
3. For each current model (2024-2026 year codes):
   a. Check if fipe_code exists in Car or RejectedCar tables.
   b. If new → create Car (status: pending) + Spec (empty scores).
   c. If existing approved + significant price change → flag for review.
4. Match Inmetro PBE data by brand + model → fill fuel consumption.
5. For cars with missing specs → LLM enrichment call.
6. For cars without images → fetch from KBB CDN + Wikimedia.
7. Calculate scores for all new/updated specs.
8. Update IngestionJob record (status: completed, counts).
9. Log per-source results to IngestionLog.

### enrichCarWithLLM(car: Car)

**Input**: Car with brand, model, year.

**Output**:
```typescript
{
  tank_capacity: number;
  trunk_liters: number;
  wheelbase: number;
  ground_clearance: number;
  hp: number;
  acceleration: number;
  transmission: string;
  body_type: string;
}
```

**Behavior**: Calls Claude API with structured output prompt.
Returns enriched specs flagged as `source: "ai-enriched"`.
