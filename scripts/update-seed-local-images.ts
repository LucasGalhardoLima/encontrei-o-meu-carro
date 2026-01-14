import fs from 'fs';
import path from 'path';

// This script updates seed.ts to use local image paths instead of remote URLs

const imageDir = path.join(process.cwd(), 'public', 'images');
const seedFile = path.join(process.cwd(), 'prisma', 'seed.ts');

// Map of model names to filenames
const imageMap: Record<string, string> = {
  'Fastback': 'fastback.jpg',
  'T-Cross': 'tcross.jpg',
  'Polo': 'polo.jpg',
  'Strada': 'strada.jpg',
  'HB20': 'hb20.jpg',
  'Onix': 'onix.jpg',
  'Compass': 'compass.jpg',
  'Corolla': 'corolla.jpg',
  'Creta': 'creta.jpg',
  'Kicks': 'kicks.jpg',
  'Renegade': 'renegade.jpg',
  'HR-V': 'hrv.jpg',
  'Corolla Cross': 'corolla-cross.jpg',
  'Tracker': 'tracker.jpg',
  'Mobi': 'mobi.jpg',
  'Kwid': 'kwid.jpg',
  'Dolphin': 'dolphin.jpg'
};

async function main() {
  console.log('📝 Updating seed.ts to use local images...\n');
  
  let seedContent = fs.readFileSync(seedFile, 'utf-8');
  let updatedCount = 0;
  
  for (const [model, filename] of Object.entries(imageMap)) {
    const imagePath = path.join(imageDir, filename);
    
    // Check if local image exists
    if (fs.existsSync(imagePath)) {
      const localUrl = `/images/${filename}`;
      
      // Replace any imageUrl for this model with local path
      const regex = new RegExp(
        `(model:\\s*"${model}"[\\s\\S]*?imageUrl:\\s*)"[^"]*"`,
        'g'
      );
      
      const newContent = seedContent.replace(regex, `$1"${localUrl}"`);
      
      if (newContent !== seedContent) {
        console.log(`✅ Updated ${model} → ${localUrl}`);
        seedContent = newContent;
        updatedCount++;
      }
    } else {
      console.log(`⚠️  Skipping ${model} (image not found locally)`);
    }
  }
  
  if (updatedCount > 0) {
    fs.writeFileSync(seedFile, seedContent, 'utf-8');
    console.log(`\n✅ Updated ${updatedCount} image URLs in seed.ts`);
  } else {
    console.log('\nℹ️  No updates needed');
  }
}

main();
