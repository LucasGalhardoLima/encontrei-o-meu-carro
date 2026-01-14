export function getWebmotorsUrl(brand: string, model: string) {
    // Normalization for Webmotors URL structure usually involves lowercase and hyphens
    // Example: https://www.webmotors.com.br/carros/estoque/fiat/fastback
    const b = brand.toLowerCase().replace(/\s+/g, '-');
    const m = model.toLowerCase().replace(/\s+/g, '-');
    return `https://www.webmotors.com.br/carros/estoque/${b}/${m}`;
}

export function getOlxUrl(brand: string, model: string) {
    // OLX search structure
    const query = `${brand} ${model}`.replace(/\s+/g, '%20');
    return `https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/${brand.toLowerCase()}?q=${query}`;
}

export function getMercadoLivreUrl(brand: string, model: string) {
    // ML search structure
    const query = `${brand} ${model}`.replace(/\s+/g, '-');
    return `https://lista.mercadolivre.com.br/veiculos/carros-caminhonetes/${brand.toLowerCase()}/${query}`;
}
