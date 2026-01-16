import { PrismaClient } from "@prisma/client";
import { calculateScores } from "../app/utils/score.server";

const prisma = new PrismaClient();

const initialCars = [
  {
    brand: "Fiat",
    model: "Fastback",
    year: 2024,
    price_avg: 135990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/fiat/fastback/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 600,
      wheelbase: 2.53,
      ground_clearance: 192,
      fuel_consumption_city: 11.3,
      fuel_type: "Flex",
      transmission: "CVT",
      hp: 130,
      acceleration: 8.1,
    },
  },
  {
    brand: "Volkswagen",
    model: "T-Cross",
    year: 2024,
    price_avg: 145990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/volkswagen/t-cross/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 373,
      wheelbase: 2.65,
      ground_clearance: 190,
      fuel_consumption_city: 11.0,
      fuel_type: "Flex",
      transmission: "Automático",
      hp: 128,
      acceleration: 10.2,
    },
  },
  {
    brand: "Volkswagen",
    model: "Polo",
    year: 2024,
    price_avg: 89990,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2021_Volkswagen_Polo_Life.jpg/800px-2021_Volkswagen_Polo_Life.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 300,
      wheelbase: 2.56,
      ground_clearance: 149,
      fuel_consumption_city: 13.5,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 84,
      acceleration: 13.4,
    },
  },
  {
    brand: "Fiat",
    model: "Strada",
    year: 2024,
    price_avg: 110990,
    type: "Picape",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Fiat_Strada_Volcano_1.3_2021_front_view.jpg/800px-Fiat_Strada_Volcano_1.3_2021_front_view.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 844,
      wheelbase: 2.73,
      ground_clearance: 208,
      fuel_consumption_city: 11.7,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 107,
      acceleration: 11.6,
    },
  },
  {
    brand: "Hyundai",
    model: "HB20",
    year: 2024,
    price_avg: 82990,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Hyundai_HB20_facelift_in_Montevideo_%28cropped%29.jpg/800px-Hyundai_HB20_facelift_in_Montevideo_%28cropped%29.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 300,
      wheelbase: 2.53,
      ground_clearance: 160,
      fuel_consumption_city: 13.3,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 80,
      acceleration: 14.5,
    },
  },
  {
    brand: "Chevrolet",
    model: "Onix",
    year: 2024,
    price_avg: 85990,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Chevrolet_Onix_Premier_2020.jpg/800px-Chevrolet_Onix_Premier_2020.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 275,
      wheelbase: 2.55,
      ground_clearance: 128,
      fuel_consumption_city: 13.9,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 82,
      acceleration: 13.3,
    },
  },
  {
    brand: "Jeep",
    model: "Compass",
    year: 2024,
    price_avg: 184990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/jeep/compass/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 476,
      wheelbase: 2.63,
      ground_clearance: 205,
      fuel_consumption_city: 10.5,
      fuel_type: "Flex",
      transmission: "Automático",
      hp: 185,
      acceleration: 8.8,
    },
  },
  {
    brand: "Toyota",
    model: "Corolla",
    year: 2024,
    price_avg: 148990,
    type: "Sedan",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2020_Toyota_Corolla_Altis_1.8_G_ZRE211R_%2820200228%29.jpg/800px-2020_Toyota_Corolla_Altis_1.8_G_ZRE211R_%2820200228%29.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 470,
      wheelbase: 2.70,
      ground_clearance: 148,
      fuel_consumption_city: 11.6,
      fuel_type: "Flex",
      transmission: "CVT",
      hp: 177,
      acceleration: 9.2,
    },
  },
  {
    brand: "Hyundai",
    model: "Creta",
    year: 2024,
    price_avg: 135990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/hyundai/creta/2024/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 422,
      wheelbase: 2.61,
      ground_clearance: 190,
      fuel_consumption_city: 11.6,
      fuel_type: "Flex",
      transmission: "Automático",
      hp: 120,
      acceleration: 11.5,
    },
  },
  {
    brand: "Nissan",
    model: "Kicks",
    year: 2024,
    price_avg: 125990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/nissan/kicks/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 432,
      wheelbase: 2.62,
      ground_clearance: 200,
      fuel_consumption_city: 11.4,
      fuel_type: "Flex",
      transmission: "CVT",
      hp: 114,
      acceleration: 11.4,
    },
  },
  {
    brand: "Jeep",
    model: "Renegade",
    year: 2024,
    price_avg: 129990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/jeep/renegade/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 320,
      wheelbase: 2.57,
      ground_clearance: 185,
      fuel_consumption_city: 9.5,
      fuel_type: "Flex",
      transmission: "Automático",
      hp: 185,
      acceleration: 8.7,
    },
  },
  {
    brand: "Honda",
    model: "HR-V",
    year: 2024,
    price_avg: 151990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/honda/hr-v/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 354,
      wheelbase: 2.61,
      ground_clearance: 188,
      fuel_consumption_city: 12.7,
      fuel_type: "Flex",
      transmission: "CVT",
      hp: 126,
      acceleration: 11.2,
    },
  },
  {
    brand: "Toyota",
    model: "Corolla Cross",
    year: 2024,
    price_avg: 164990,
    type: "SUV",
    imageUrl: "/images/placeholder.png", // Placeholder (KBB forbidden)
    spec: {
      trunk_liters: 440,
      wheelbase: 2.64,
      ground_clearance: 161,
      fuel_consumption_city: 11.7,
      fuel_type: "Flex",
      transmission: "CVT",
      hp: 177,
      acceleration: 9.8,
    },
  },
  {
    brand: "Chevrolet",
    model: "Tracker",
    year: 2024,
    price_avg: 130990,
    type: "SUV",
    imageUrl: "https://static.kbb.com.br/pkw/t/chevrolet/tracker/2023/5od.jpg", // KBB ✅
    spec: {
      trunk_liters: 393,
      wheelbase: 2.57,
      ground_clearance: 157,
      fuel_consumption_city: 11.2,
      fuel_type: "Flex",
      transmission: "Automático",
      hp: 132,
      acceleration: 10.5,
    },
  },
  {
    brand: "Fiat",
    model: "Mobi",
    year: 2024,
    price_avg: 71990,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Fiat_Mobi_Like_2021.jpg/800px-Fiat_Mobi_Like_2021.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 215,
      wheelbase: 2.30,
      ground_clearance: 190,
      fuel_consumption_city: 13.5,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 74,
      acceleration: 14.4,
    },
  },
  {
    brand: "Renault",
    model: "Kwid",
    year: 2024,
    price_avg: 72990,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Renault_Kwid_Intense_2022_front.jpg/800px-Renault_Kwid_Intense_2022_front.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 290,
      wheelbase: 2.42,
      ground_clearance: 185,
      fuel_consumption_city: 15.3,
      fuel_type: "Flex",
      transmission: "Manual",
      hp: 71,
      acceleration: 13.2,
    },
  },
  {
    brand: "BYD",
    model: "Dolphin",
    year: 2024,
    price_avg: 149800,
    type: "Hatch",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/BYD_Dolphin_IAA_2023_1X7A0063.jpg/800px-BYD_Dolphin_IAA_2023_1X7A0063.jpg", // Wikimedia fallback
    spec: {
      trunk_liters: 345,
      wheelbase: 2.70,
      ground_clearance: 120,
      fuel_consumption_city: 20.0, // Electric equivalent
      fuel_type: "Elétrico",
      transmission: "Automático",
      hp: 95,
      acceleration: 10.9,
    },
  },
];

import { fetchKbbCars } from "../app/services/kbb.server";
import { getCarImageUrl } from "../app/utils/car-gallery";

// Helper to generate semi-realistic specs based on car type
function generateSpec(type: string, price: number) {
  const isSUV = type.toUpperCase().includes("SUV") || type.toUpperCase().includes("CROSS") || type.toUpperCase().includes("JEEP");
  const isSedan = type.toUpperCase().includes("SEDAN");
  
  // Base stats
  let trunk = isSUV ? 400 : (isSedan ? 450 : 280);
  let hp = price > 150000 ? 150 : 80;
  let consumption = price > 200000 ? 9.0 : (isSUV ? 11.0 : 13.5); 
  
  // Random variations (+- 10%)
  const vary = (val: number) => val * (0.9 + Math.random() * 0.2);
  
  return {
    trunk_liters: Math.floor(vary(trunk)),
    wheelbase: isSUV ? 2.62 : (isSedan ? 2.65 : 2.55),
    ground_clearance: isSUV ? 190 : 150,
    fuel_consumption_city: parseFloat(vary(consumption).toFixed(1)),
    fuel_type: "Flex",
    transmission: "Automático",
    hp: Math.floor(vary(hp)),
    acceleration: parseFloat(vary(11.0).toFixed(1)),
  };
}

async function main() {
  console.log("🚀 Start seeding with REAL images...");
  await prisma.car.deleteMany({});

  // 1. Seed Initial Manual Cars (with REAL images mapped via utility)
  for (const car of initialCars) {
    const realImageUrl = getCarImageUrl(car.brand, car.model, car.year, car.type);
    
    await prisma.car.create({
      data: {
        brand: car.brand, 
        model: car.model, 
        year: car.year, 
        price_avg: car.price_avg, 
        type: car.type, 
        imageUrl: realImageUrl, // Using real KBB image
        spec: { create: { ...car.spec, ...calculateScores(car.spec) } },
      },
    });
  }
  console.log(`✅ Seeded ${initialCars.length} manual cars with real photos.`);

  // 2. Seed KBB Mock Cars (with REAL images mapped via utility)
  const kbbCars = await fetchKbbCars();
  let addedCount = 0;

  for (const kbb of kbbCars) {
    const existing = initialCars.find(c => 
        c.brand.toLowerCase() === kbb.brand.toLowerCase() && 
        kbb.model.toLowerCase().includes(c.model.toLowerCase())
    );

    if (existing) continue;

    let type = "Hatch";
    if (kbb.model.includes("Cross") || kbb.model.includes("SUV") || kbb.model.includes("Tracker") || kbb.model.includes("Nivus") || kbb.model.includes("Pulse") || kbb.model.includes("Fastback")) type = "SUV";
    if (kbb.model.includes("Sedan") || kbb.model.includes("Plus") || kbb.model.includes("Virtus") || kbb.model.includes("Cronos") || kbb.model.includes("Corolla") || kbb.model.includes("City")) type = "Sedan";
    if (kbb.model.includes("Toro") || kbb.model.includes("Strada") || kbb.model.includes("Saveiro") || kbb.model.includes("Hilux") || kbb.model.includes("S10") || kbb.model.includes("Ranger") || kbb.model.includes("L200") || kbb.model.includes("Montana") || kbb.model.includes("Oroch") || kbb.model.includes("Amarok") || kbb.model.includes("Frontier") || kbb.model.includes("Titano") || kbb.model.includes("Maverick") || kbb.model.includes("RAM")) type = "Picape";

    const generatedSpec = generateSpec(type, kbb.price_avg);
    const realImageUrl = getCarImageUrl(kbb.brand, kbb.model, kbb.year, type);

    await prisma.car.create({
      data: {
        brand: kbb.brand,
        model: kbb.model,
        year: kbb.year,
        price_avg: kbb.price_avg,
        type: type,
        imageUrl: realImageUrl, // Correctly mapped real photo
        spec: {
            create: {
                ...generatedSpec,
                ...calculateScores(generatedSpec)
            }
        }
      }
    });
    addedCount++;
  }

  console.log(`✅ Seeded ${addedCount} extra cars with real photos from KBB.`);
  console.log("🏁 Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
