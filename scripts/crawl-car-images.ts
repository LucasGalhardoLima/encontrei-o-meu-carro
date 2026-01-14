import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const carsToFind = [
  { brand: "volkswagen", model: "polo", displayName: "Volkswagen Polo", year: 2024, filename: "polo.jpg" },
  { brand: "fiat", model: "strada", displayName: "Fiat Strada", year: 2024, filename: "strada.jpg" },
  { brand: "hyundai", model: "hb20", displayName: "Hyundai HB20", year: 2024, filename: "hb20.jpg" },
  { brand: "chevrolet", model: "onix", displayName: "Chevrolet Onix", year: 2024, filename: "onix.jpg" },
  { brand: "toyota", model: "corolla", displayName: "Toyota Corolla", year: 2024, filename: "corolla.jpg" },
  { brand: "toyota", model: "corolla-cross", displayName: "Toyota Corolla Cross", year: 2024, filename: "corolla-cross.jpg" },
  { brand: "fiat", model: "mobi", displayName: "Fiat Mobi", year: 2024, filename: "mobi.jpg" },
  { brand: "renault", model: "kwid", displayName: "Renault Kwid", year: 2024, filename: "kwid.jpg" },
  { brand: "byd", model: "dolphin", displayName: "BYD Dolphin", year: 2024, filename: "dolphin.jpg" }
];

async function downloadImage(url: string, filename: string): Promise<boolean> {
  const filepath = path.join(process.cwd(), 'public', 'images', filename);
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    
    if (!response.ok) return false;
    
    if (response.body) {
      // @ts-ignore
      await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(filepath));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function tryKBB(brand: string, model: string, year: number, filename: string): Promise<{ success: boolean; url?: string }> {
  console.log(`  🔍 Trying KBB...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Strategy 1: Try direct URL patterns first (fast)
    const directUrlPatterns = [
      `https://static.kbb.com.br/pkw/t/${brand}/${model}/${year}/5od.jpg`,
      `https://static.kbb.com.br/pkw/t/${brand}/${model}/${year - 1}/5od.jpg`,
      `https://static.kbb.com.br/pkw/t/${brand}/${model}/${year - 2}/5od.jpg`,
    ];
    
    for (const directUrl of directUrlPatterns) {
      try {
        const response = await fetch(directUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log(`  ✅ KBB: Found via direct URL (${year})`);
          const downloaded = await downloadImage(directUrl, filename);
          if (downloaded) {
            await browser.close();
            return { success: true, url: directUrl };
          }
        }
      } catch {
        continue;
      }
    }
    
    // Strategy 2: Navigate KBB website to find the car page
    console.log(`  🔍 KBB: Searching website for ${brand} ${model}...`);
    
    const searchUrl = `https://www.kbb.com.br/${brand}/${model}`;
    
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Look for car images on the page
      const imageUrls = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .map(img => img.src || img.getAttribute('data-src') || '')
          .filter(src => src && src.includes('static.kbb.com.br') && src.includes('/pkw/'))
          .filter(src => !src.includes('logo') && !src.includes('icon') && !src.includes('thumb'));
      });
      
      if (imageUrls.length > 0) {
        // Try to download the first valid image
        for (const imageUrl of imageUrls) {
          if (!imageUrl) continue;
          const downloaded = await downloadImage(imageUrl, filename);
          if (downloaded) {
            console.log(`  ✅ KBB: Found via website navigation`);
            await browser.close();
            return { success: true, url: imageUrl };
          }
        }
      }
      
      // Strategy 3: Try clicking on car versions/trims to find images
      const versionLinks = await page.$$('a[href*="versao"], a[href*="version"], .car-version a, .trim-link');
      
      if (versionLinks.length > 0) {
        console.log(`  🔍 KBB: Found ${versionLinks.length} versions, checking first one...`);
        
        try {
          await versionLinks[0].click();
          await page.waitForTimeout(2000);
          
          const versionImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images
              .map(img => img.src || img.getAttribute('data-src') || '')
              .filter(src => src && src.includes('static.kbb.com.br') && src.includes('/pkw/'))
              .filter(src => !src.includes('logo') && !src.includes('icon'));
          });
          
          if (versionImages.length > 0 && versionImages[0]) {
            const downloaded = await downloadImage(versionImages[0], filename);
            if (downloaded) {
              console.log(`  ✅ KBB: Found via version page`);
              await browser.close();
              return { success: true, url: versionImages[0] };
            }
          }
        } catch {
          // Version click failed, continue
        }
      }
      
    } catch (navError: any) {
      console.log(`  ⚠️  KBB: Navigation failed - ${navError.message}`);
    }
    
    await browser.close();
    console.log(`  ⚠️  KBB: No image found, trying fallback...`);
    return { success: false };
    
  } catch (error: any) {
    await browser.close();
    console.log(`  ⚠️  KBB: Error - ${error.message}, trying fallback...`);
    return { success: false };
  }
}

async function tryGoogleImages(displayName: string, year: number, filename: string): Promise<{ success: boolean; url?: string }> {
  console.log(`  🔍 Trying Google Images (fallback)...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const searchQuery = `${displayName} ${year} carro lateral`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
    
    await page.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Click first image to get full resolution
    await page.click('img[data-src]').catch(() => {});
    await page.waitForTimeout(2000);
    
    const imageUrl = await page.evaluate(() => {
      const largeImages = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src && src.startsWith('http') && !src.includes('google') && !src.includes('gstatic'))
        .filter(src => src.includes('http') && src.length > 100); // Likely full-res images
      
      return largeImages[0] || null;
    });
    
    if (imageUrl) {
      const downloaded = await downloadImage(imageUrl, filename);
      await browser.close();
      
      if (downloaded) {
        console.log(`  ✅ Google: Downloaded successfully`);
        return { success: true, url: imageUrl };
      }
    }
    
    await browser.close();
    console.log(`  ❌ Google: No valid image found`);
    return { success: false };
    
  } catch (error: any) {
    await browser.close();
    console.log(`  ❌ Google: Error - ${error.message}`);
    return { success: false };
  }
}

async function findAndDownloadCarImage(car: typeof carsToFind[0]) {
  console.log(`\n📸 ${car.displayName}`);
  
  // Try KBB first
  const kbbResult = await tryKBB(car.brand, car.model, car.year, car.filename);
  if (kbbResult.success) {
    return { ...car, source: 'KBB', imageUrl: kbbResult.url, success: true };
  }
  
  // Fallback to Google Images
  const googleResult = await tryGoogleImages(car.displayName, car.year, car.filename);
  if (googleResult.success) {
    return { ...car, source: 'Google', imageUrl: googleResult.url, success: true };
  }
  
  return { ...car, source: 'None', imageUrl: null, success: false };
}

async function main() {
  console.log('🚗 Car Image Crawler (KBB + Google Fallback)\n');
  console.log('Strategy: Try KBB first, fallback to Google Images if not found\n');
  
  const results = [];
  
  for (const car of carsToFind) {
    const result = await findAndDownloadCarImage(car);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n\n=== SUMMARY ===\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Downloaded: ${successful.length}/${results.length}\n`);
  
  const kbbCount = successful.filter(r => r.source === 'KBB').length;
  const googleCount = successful.filter(r => r.source === 'Google').length;
  
  console.log(`   KBB: ${kbbCount}`);
  console.log(`   Google: ${googleCount}\n`);
  
  successful.forEach(r => console.log(`   ✅ ${r.displayName} (${r.source}) → /images/${r.filename}`));
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   ❌ ${r.displayName}`));
  }
  
  console.log('\n📝 All images saved to public/images/');
  console.log('Next: Update seed.ts to use local paths');
}

main();
