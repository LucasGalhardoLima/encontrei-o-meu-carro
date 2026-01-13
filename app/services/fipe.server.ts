export interface FipeBrand {
    nome: string;
    valor: string; // This is the ID/Code
}

export interface FipeModel {
    nome: string;
    codigo: number | string;
}

const BASE_URL = 'https://brasilapi.com.br/api/fipe';

export async function getBrands(): Promise<FipeBrand[]> {
    try {
        const response = await fetch(`${BASE_URL}/marcas/v1/carros`);
        if (!response.ok) throw new Error('Failed to fetch brands');
        return await response.json();
    } catch (error) {
        console.error("FIPE Error:", error);
        return [];
    }
}

// BrasilAPI endpoints for models might vary, checking documentation implies:
// /api/fipe/marcas/v1/{tipoVeiculo} is brands.
// /api/fipe/veiculos/{brandCode} isn't standard in v1 docs, usually it's query by FIPE code or Price.
// PARALLEL OPTION: "Parallelum" API is very common for FIPE hierarchy: 
// https://parallelum.com.br/fipe/api/v1/carros/marcas/{marca}/modelos
// BrasilAPI is great but sometimes limited on hierarchy listing.
// Let's try Parallelum as fallback or primary for hierarchy if BrasilAPI is strictly price lookup.
// Actually, let's use Parallelum for hierarchy (Brands -> Models -> Years). It's the standard widely used free one.

const PARALLELUM_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

let brandsCache: FipeBrand[] | null = null;
let brandsCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 Hour

export async function getBrandsParallelum() {
    if (brandsCache && (Date.now() - brandsCacheTime < CACHE_TTL)) {
        return brandsCache;
    }

    try {
        const res = await fetch(`${PARALLELUM_URL}/marcas`);
        if (!res.ok) throw new Error('Failed to fetch to brands');
        const data = await res.json();
        
        brandsCache = data;
        brandsCacheTime = Date.now();
        
        return data;
    } catch (e) {
        console.error("FIPE Fetch Error", e);
        return [];
    }
}

export async function getModelsParallelum(brandId: string) {
    // Returns { modelos: [], anos: [] }
    const res = await fetch(`${PARALLELUM_URL}/marcas/${brandId}/modelos`);
    return res.json();
}

export async function getCarDetailsParallelum(brandId: string, modelId: string, yearId: string) {
    const res = await fetch(`${PARALLELUM_URL}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
    return res.json();
}
