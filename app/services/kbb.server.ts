export interface KbbCar {
  brand: string;
  model: string;
  year: number;
  price_avg: number;
  id: string; // KBB unique ID
}

// Mock dataset of ~50 cars
const MOCK_KBB_DB: KbbCar[] = [
  // FIAT
  { brand: "Fiat", model: "Mobi Like 1.0", year: 2024, price_avg: 72990, id: "kbb-001" },
  { brand: "Fiat", model: "Argo Drive 1.3 CVT", year: 2024, price_avg: 94990, id: "kbb-002" },
  { brand: "Fiat", model: "Cronos Precision 1.3 CVT", year: 2024, price_avg: 112990, id: "kbb-003" },
  { brand: "Fiat", model: "Pulse Audace Turbo 200", year: 2024, price_avg: 118990, id: "kbb-004" },
  { brand: "Fiat", model: "Fastback Limited Edition", year: 2024, price_avg: 159990, id: "kbb-005" },
  { brand: "Fiat", model: "Strada Volcano 1.3 CD", year: 2024, price_avg: 117990, id: "kbb-006" },
  { brand: "Fiat", model: "Toro Volcano Turbo 270", year: 2024, price_avg: 175990, id: "kbb-007" },
  { brand: "Fiat", model: "Fiorino Endurance 1.4", year: 2024, price_avg: 113990, id: "kbb-008" },
  { brand: "Fiat", model: "Titano Volcano", year: 2024, price_avg: 239990, id: "kbb-009" }, // New
  { brand: "Fiat", model: "500e Icon", year: 2023, price_avg: 214990, id: "kbb-010" },

  // VOLKSWAGEN
  { brand: "Volkswagen", model: "Polo Track 1.0", year: 2024, price_avg: 89990, id: "kbb-011" },
  { brand: "Volkswagen", model: "Polo Highline TSI", year: 2024, price_avg: 118990, id: "kbb-012" },
  { brand: "Volkswagen", model: "Virtus Exclusive 1.4 TSI", year: 2024, price_avg: 152990, id: "kbb-013" },
  { brand: "Volkswagen", model: "Nivus Highline 200 TSI", year: 2024, price_avg: 153990, id: "kbb-014" },
  { brand: "Volkswagen", model: "T-Cross Highline 200 TSI", year: 2024, price_avg: 179990, id: "kbb-015" },
  { brand: "Volkswagen", model: "Taos Highline 250 TSI", year: 2024, price_avg: 212990, id: "kbb-016" },
  { brand: "Volkswagen", model: "Saveiro Extreme 1.6", year: 2024, price_avg: 115990, id: "kbb-017" },
  { brand: "Volkswagen", model: "Tiguan Allspace R-Line", year: 2024, price_avg: 279990, id: "kbb-018" },
  { brand: "Volkswagen", model: "Jetta GLI 350 TSI", year: 2024, price_avg: 241990, id: "kbb-019" },
  { brand: "Volkswagen", model: "Amarok V6 Highline", year: 2024, price_avg: 305990, id: "kbb-020" },

  // CHEVROLET
  { brand: "Chevrolet", model: "Onix 1.0 MT", year: 2024, price_avg: 86990, id: "kbb-021" },
  { brand: "Chevrolet", model: "Onix Plus Premier", year: 2024, price_avg: 117990, id: "kbb-022" },
  { brand: "Chevrolet", model: "Tracker Premier 1.2", year: 2024, price_avg: 164990, id: "kbb-023" },
  { brand: "Chevrolet", model: "Montana Premier 1.2", year: 2024, price_avg: 153990, id: "kbb-024" },
  { brand: "Chevrolet", model: "S10 High Country", year: 2024, price_avg: 302990, id: "kbb-025" },
  { brand: "Chevrolet", model: "Spin Activ 7", year: 2024, price_avg: 136990, id: "kbb-026" },
  { brand: "Chevrolet", model: "Equinox Premier", year: 2023, price_avg: 241990, id: "kbb-027" },
  { brand: "Chevrolet", model: "Trailblazer Premier", year: 2024, price_avg: 369990, id: "kbb-028" },
  { brand: "Chevrolet", model: "Bolt EUV", year: 2023, price_avg: 279990, id: "kbb-029" }, // EV
  { brand: "Chevrolet", model: "Cruze RS Sport6", year: 2023, price_avg: 169990, id: "kbb-030" },

  // TOYOTA
  { brand: "Toyota", model: "Corolla XEi 2.0", year: 2024, price_avg: 160990, id: "kbb-031" },
  { brand: "Toyota", model: "Corolla Altis Hybrid", year: 2024, price_avg: 185990, id: "kbb-032" },
  { brand: "Toyota", model: "Corolla Cross XRE 2.0", year: 2024, price_avg: 179990, id: "kbb-033" },
  { brand: "Toyota", model: "Corolla Cross XRX Hybrid", year: 2024, price_avg: 212990, id: "kbb-034" },
  { brand: "Toyota", model: "Yaris Hatch XS 1.5", year: 2024, price_avg: 110990, id: "kbb-035" },
  { brand: "Toyota", model: "Yaris Sedan XLS 1.5", year: 2024, price_avg: 125990, id: "kbb-036" },
  { brand: "Toyota", model: "Hilux SRX Plus", year: 2024, price_avg: 334990, id: "kbb-037" },
  { brand: "Toyota", model: "SW4 Diamond", year: 2024, price_avg: 436990, id: "kbb-038" },
  { brand: "Toyota", model: "RAV4 SX Connect Hybrid", year: 2024, price_avg: 349990, id: "kbb-039" },
  { brand: "Toyota", model: "Camry XLE Hybrid", year: 2023, price_avg: 360990, id: "kbb-040" },

  // HYUNDAI
  { brand: "Hyundai", model: "HB20 Sense 1.0", year: 2024, price_avg: 84990, id: "kbb-041" },
  { brand: "Hyundai", model: "HB20 Platinum Plus", year: 2024, price_avg: 121990, id: "kbb-042" },
  { brand: "Hyundai", model: "HB20S Platinum", year: 2024, price_avg: 128990, id: "kbb-043" },
  { brand: "Hyundai", model: "Creta Comfort Plus", year: 2024, price_avg: 137990, id: "kbb-044" },
  { brand: "Hyundai", model: "Creta Ultimate 2.0", year: 2024, price_avg: 184990, id: "kbb-045" },
  { brand: "Hyundai", model: "Creta N Line", year: 2024, price_avg: 176990, id: "kbb-046" },
  
  // HONDA
  { brand: "Honda", model: "City Hatchback Touring", year: 2024, price_avg: 136990, id: "kbb-047" },
  { brand: "Honda", model: "City Sedan Touring", year: 2024, price_avg: 138990, id: "kbb-048" },
  { brand: "Honda", model: "HR-V Advance Turbo", year: 2024, price_avg: 188990, id: "kbb-049" },
  { brand: "Honda", model: "ZR-V Touring", year: 2024, price_avg: 214990, id: "kbb-050" },
];

export async function fetchKbbCars(): Promise<KbbCar[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_KBB_DB);
    }, 500);
  });
}
