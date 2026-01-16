/**
 * Gera uma URL de imagem real da CDN da KBB Brasil baseada nos dados do carro.
 * Padrão: https://static.kbb.com.br/pkw/t/{marca}/{modelo}/{ano}/{corpo}.jpg
 */
export function getCarImageUrl(brand: string, model: string, year: number, type: string): string {
  const cleanBrand = brand.toLowerCase().trim();
  
  // Normaliza o modelo: lowercase e espaços para underscores
  // Remove variações extras para tentar pegar a imagem base do modelo
  // Ex: "Onix Plus Premier" -> "onix_plus"
  let cleanModel = model
    .toLowerCase()
    .split(' ')[0] // Tenta pegar a primeira palavra ou as duas primeiras se for composto
    .trim();

  // Tratamento especial para modelos comuns compostos
  const modelLower = model.toLowerCase();
  if (modelLower.includes('corolla cross')) cleanModel = 'corolla_cross';
  if (modelLower.includes('onix plus')) cleanModel = 'onix_plus';
  if (modelLower.includes('hb20s')) cleanModel = 'hb20s';
  if (modelLower.includes('city hatchback')) cleanModel = 'city';
  if (modelLower.includes('fastback')) cleanModel = 'fastback';
  if (modelLower.includes('t-cross')) cleanModel = 't-cross';

  // Mapeamento de tipo para código de corpo KBB
  // 5ha = Hatch
  // 4sa = Sedan
  // 5od = SUV / Crossover
  // 5pu = Picape
  let bodyCode = '5od'; // Default SUV
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('hatch')) bodyCode = '5ha';
  if (typeLower.includes('sedan')) bodyCode = '4sa';
  if (typeLower.includes('suv')) bodyCode = '5od';
  if (typeLower.includes('picape') || typeLower.includes('truck')) bodyCode = '5pu';

  return `https://static.kbb.com.br/pkw/t/${cleanBrand}/${cleanModel}/${year}/${bodyCode}.jpg`;
}
