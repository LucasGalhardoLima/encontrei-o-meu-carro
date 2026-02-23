# Data Model: Preference-Based Car Discovery

**Feature Branch**: `001-preference-car-discovery`
**Date**: 2026-02-18

## Entity Relationship Overview

```text
IngestionSource 1──N IngestionJob
IngestionJob    1──N IngestionLog

Car             1──1 Spec
Car             1──N Feedback
Car             1──N CarImage

RejectedCar     (standalone — prevents re-ingestion)
```

## Entities

### Car (modified — add moderation fields)

Primary entity representing a vehicle in the catalog.

| Field              | Type        | Constraints                    | Notes                              |
|--------------------|-------------|--------------------------------|------------------------------------|
| id                 | UUID        | PK, auto-generated             |                                    |
| brand              | String      | NOT NULL                       | e.g., "Fiat"                       |
| model              | String      | NOT NULL                       | e.g., "Argo Drive 1.0"            |
| year               | Int         | NOT NULL                       | Model year                         |
| price_avg          | Decimal     | 12,2                           | Average FIPE price in BRL          |
| type               | String      | NOT NULL                       | "SUV", "Sedan", "Hatch", "Picape" |
| imageUrl           | String?     |                                | Primary image URL                  |
| fipe_code          | String?     | UNIQUE                         | FIPE reference code                |
| moderation_status  | String      | DEFAULT "pending"              | "pending", "approved", "rejected"  |
| source             | String?     |                                | "fipe", "manual", "ai-enriched"   |
| source_data        | Json?       |                                | Raw data from ingestion source     |
| createdAt          | DateTime    | DEFAULT now()                  |                                    |
| updatedAt          | DateTime    | @updatedAt                     |                                    |

**Indexes**: brand, model, price_avg, moderation_status, fipe_code
(unique).

**State transitions**:
- `pending` → `approved` (admin approves in moderation queue)
- `pending` → `rejected` (admin rejects → creates RejectedCar entry)
- `approved` → `pending` (ingestion flags significant data changes)

**Visibility rule**: Only cars with `moderation_status = "approved"`
appear in public routes (results, detail, comparison). Pending and
rejected cars are visible only in admin routes.

### Spec (modified — add tank_capacity)

Normalized specification data for a car.

| Field                    | Type     | Constraints        | Notes                          |
|--------------------------|----------|--------------------|--------------------------------|
| id                       | UUID     | PK, auto-generated |                                |
| carId                    | UUID     | UNIQUE, FK → Car   | CASCADE delete                 |
| trunk_liters             | Int      | DEFAULT 0          | Trunk volume in liters         |
| tank_capacity            | Int      | DEFAULT 0          | Fuel tank capacity in liters   |
| wheelbase                | Float    | DEFAULT 0          | Wheelbase in meters            |
| ground_clearance         | Int      | DEFAULT 0          | Ground clearance in mm         |
| fuel_consumption_city    | Float    | DEFAULT 0          | km/L city driving              |
| fuel_consumption_highway | Float?   |                    | km/L highway (from Inmetro)    |
| hp                       | Int?     |                    | Horsepower                     |
| acceleration             | Float?   |                    | 0-100 km/h in seconds          |
| transmission             | String   | DEFAULT "Automático" |                              |
| fuel_type                | String   | DEFAULT "Flex"     | Gasolina, Flex, Diesel, etc.   |
| trunk_score              | Float    | DEFAULT 0          | Normalized 0-10                |
| wheelbase_score          | Float    | DEFAULT 0          | Normalized 0-10                |
| ground_clearance_score   | Float    | DEFAULT 0          | Normalized 0-10                |
| consumption_score        | Float    | DEFAULT 0          | Normalized 0-10                |
| hp_score                 | Float    | DEFAULT 0          | Normalized 0-10                |
| acceleration_score       | Float    | DEFAULT 0          | Normalized 0-10                |

**Indexes**: trunk_liters, fuel_consumption_city, tank_capacity.

**Derived calculations** (computed at display time, not stored):
- Range (km) = fuel_consumption_city × tank_capacity
- Fuel stops for 400km = ceil(400 / range) - 1
- Suitcase count = floor(trunk_liters / 65) (standard large
  suitcase ≈ 65L)

### CarImage (new)

Multiple images per car for gallery display.

| Field     | Type     | Constraints        | Notes                      |
|-----------|----------|--------------------|----------------------------|
| id        | UUID     | PK, auto-generated |                            |
| carId     | UUID     | FK → Car           | CASCADE delete             |
| url       | String   | NOT NULL           | Image URL                  |
| source    | String   | NOT NULL           | "kbb", "wikimedia", "manual" |
| isPrimary | Boolean  | DEFAULT false      | Primary display image      |
| order     | Int      | DEFAULT 0          | Gallery sort order         |
| createdAt | DateTime | DEFAULT now()      |                            |

**Indexes**: carId, isPrimary.

### Feedback (unchanged)

User feedback on car recommendations.

| Field     | Type     | Constraints        | Notes                    |
|-----------|----------|--------------------|--------------------------|
| id        | UUID     | PK, auto-generated |                          |
| carId     | UUID     | FK → Car           | CASCADE delete           |
| thumbs    | Boolean  | NOT NULL           | true = like              |
| weights   | Json?    |                    | User preference weights  |
| createdAt | DateTime | DEFAULT now()      |                          |

**Indexes**: carId.

### IngestionJob (new)

Tracks each run of the automated data pipeline.

| Field        | Type      | Constraints        | Notes                       |
|--------------|-----------|--------------------|-----------------------------|
| id           | UUID      | PK, auto-generated |                             |
| status       | String    | DEFAULT "pending"  | pending, running, completed, failed |
| startedAt    | DateTime? |                    | When job execution began    |
| completedAt  | DateTime? |                    | When job finished           |
| carsAdded    | Int       | DEFAULT 0          | New cars added to queue     |
| carsUpdated  | Int       | DEFAULT 0          | Existing cars flagged       |
| carsSkipped  | Int       | DEFAULT 0          | Duplicates/rejected skipped |
| errors       | Json?     |                    | Array of error objects      |
| createdAt    | DateTime  | DEFAULT now()      |                             |

**Indexes**: status, createdAt.

### IngestionLog (new)

Per-source log entries within a job run.

| Field         | Type      | Constraints        | Notes                    |
|---------------|-----------|--------------------|-----------------------|
| id            | UUID      | PK, auto-generated |                          |
| jobId         | UUID      | FK → IngestionJob  | CASCADE delete           |
| source        | String    | NOT NULL           | "parallelum", "inmetro", "llm", "kbb-images", "wikimedia" |
| status        | String    | DEFAULT "pending"  | pending, running, completed, failed |
| itemsProcessed| Int       | DEFAULT 0          |                          |
| errors        | Json?     |                    | Source-specific errors   |
| startedAt     | DateTime? |                    |                          |
| completedAt   | DateTime? |                    |                          |
| createdAt     | DateTime  | DEFAULT now()      |                          |

**Indexes**: jobId, source.

### RejectedCar (new)

Prevents re-ingestion of admin-rejected cars.

| Field      | Type     | Constraints              | Notes                   |
|------------|----------|--------------------------|-------------------------|
| id         | UUID     | PK, auto-generated       |                         |
| fipe_code  | String   | UNIQUE                   | FIPE reference code     |
| brand      | String   | NOT NULL                 |                         |
| model      | String   | NOT NULL                 |                         |
| year       | Int      | NOT NULL                 |                         |
| reason     | String?  |                          | Why rejected            |
| rejectedAt | DateTime | DEFAULT now()            |                         |

**Indexes**: fipe_code (unique), brand + model + year (composite).

### User Preference (client-side only)

Stored in browser localStorage via Zustand. Not persisted server-side.

```typescript
interface UserPreference {
  comfort: number;   // 0-100 weight
  economy: number;   // 0-100 weight
  performance: number; // 0-100 weight
  space: number;     // 0-100 weight
}
```

### Comparison Set (client-side only)

Stored in browser localStorage via Zustand. Max 4 car IDs.

```typescript
interface ComparisonState {
  selectedCarIds: string[];  // max 4
}
```

### Favorite / Garage Item (client-side only)

Stored in browser localStorage via Zustand.

```typescript
interface FavoritesState {
  favoriteIds: string[];
}
```

## Migration Plan

1. Add `tank_capacity` to Spec model.
2. Add `fipe_code`, `moderation_status`, `source`, `source_data`
   to Car model.
3. Add `fuel_consumption_highway` to Spec model.
4. Create CarImage model.
5. Create IngestionJob model.
6. Create IngestionLog model.
7. Create RejectedCar model.
8. Set all existing cars to `moderation_status = "approved"`.
9. Backfill `tank_capacity` for existing cars (via LLM enrichment
   or manual entry).
