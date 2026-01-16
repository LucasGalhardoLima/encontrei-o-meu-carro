
import { fetchBatchCars, type FipeCarDetails } from "../app/services/fipe.server";
import { fetchKbbCars, type KbbCar } from "../app/services/kbb.server";

// Helper to normalize strings for comparison
// e.g. "Fiat Mobi Like 1.0" -> "fiat mobilike 1.0"
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, ""); // Remove special chars & spaces
}

interface ComparisonResult {
  fipeOnly: FipeCarDetails[];
  kbbOnly: KbbCar[];
  duplicates: {
    fipe: FipeCarDetails;
    kbb: KbbCar;
    matchType: "exact" | "fuzzy";
  }[];
}

async function main() {
  console.log("🚀 Starting Data Ingestion & Comparison...");
  
  // 1. Fetch Data
  console.log("\n📡 Fetching FIPE data (this may take a while)...");
  const fipeCars = await fetchBatchCars(50);
  console.log(`✅ Fetched ${fipeCars.length} cars from FIPE.`);

  console.log("\n📡 Fetching KBB data...");
  const kbbCars = await fetchKbbCars();
  console.log(`✅ Fetched ${kbbCars.length} cars from KBB.`);

  // 2. Compare Data
  console.log("\n🔍 Comparing datasets...");
  const result: ComparisonResult = {
    fipeOnly: [],
    kbbOnly: [],
    duplicates: [],
  };

  // Create a map for faster lookup of KBB cars
  // We'll use a broad key like "brand+model" to find potential candidates
  // and then differeniate by year/specifics
  const kbbMap = new Map<string, KbbCar>();
  kbbCars.forEach(car => {
      // Key strategy: "fiatmobi"
      const key = normalize(car.brand + car.model.split(" ")[0]); 
      kbbMap.set(key, car); // Simple map for now, ideally list for collisions
  }); 
  
  // Better strategy: O(N*M) is fine for 50 items. Let's do direct comparison.
  // We want to match Brand + Model + Year
  
  const matchedKbbIds = new Set<string>();

  for (const fipeCar of fipeCars) {
      let match = null;

      // Try to find a match in KBB list
      for (const kbbCar of kbbCars) {
          if (matchedKbbIds.has(kbbCar.id)) continue;

          // Check Brand (Exact)
          if (normalize(fipeCar.Marca) !== normalize(kbbCar.brand)) continue;

          // Check Year (Approximate: FIPE "2024" vs KBB 2024)
          if (fipeCar.AnoModelo !== kbbCar.year) continue;

          // Check Model (Fuzzy)
          // FIPE: "Mobi Like 1.0 Fire Flex 5p."
          // KBB: "Mobi Like 1.0"
          const fipeModelNorm = normalize(fipeCar.Modelo);
          const kbbModelNorm = normalize(kbbCar.model);

          // Does one contain the other?
          if (fipeModelNorm.includes(kbbModelNorm) || kbbModelNorm.includes(fipeModelNorm)) {
             match = kbbCar;
             break;
          }
      }

      if (match) {
          result.duplicates.push({
              fipe: fipeCar,
              kbb: match,
              matchType: "fuzzy"
          });
          matchedKbbIds.add(match.id);
      } else {
          result.fipeOnly.push(fipeCar);
      }
  }

  // Find KBB only
  result.kbbOnly = kbbCars.filter(c => !matchedKbbIds.has(c.id));

  // 3. Report
  console.log("\n📊 COMPARISON REPORT");
  console.log("=====================");
  console.log(`Total FIPE: ${fipeCars.length}`);
  console.log(`Total KBB: ${kbbCars.length}`);
  console.log(`---------------------`);
  console.log(`✅ Duplicates Found: ${result.duplicates.length}`);
  console.log(`🆕 FIPE Only: ${result.fipeOnly.length}`);
  console.log(`🆕 KBB Only: ${result.kbbOnly.length}`);
  
  if (result.duplicates.length > 0) {
      console.log("\nEXAMPLE DUPLICATES (First 5):");
      result.duplicates.slice(0, 5).forEach((d, i) => {
          console.log(`${i+1}. FIPE: "${d.fipe.Modelo}" <==> KBB: "${d.kbb.model}"`);
      });
  }
  
  if (result.fipeOnly.length > 0) {
       console.log("\nEXAMPLE FIPE ONLY (First 3):");
       result.fipeOnly.slice(0, 3).forEach(c => console.log(`- ${c.Marca} ${c.Modelo} (${c.AnoModelo})`));
  }
}

main().catch(console.error);
