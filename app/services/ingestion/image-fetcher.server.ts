/**
 * Fetch car image from KBB Brasil CDN.
 * Returns URL or null on failure.
 */
export async function fetchKbbImage(
  brand: string,
  model: string,
  _year: number,
  _bodyType: string
): Promise<string | null> {
  const b = brand.toLowerCase().replace(/\s+/g, "-");
  const m = model.toLowerCase().replace(/\s+/g, "-");
  const url = `https://static.kbb.com.br/pkw/t/${b}/${m}/2023/5od.jpg`;

  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) return url;
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch car image from Wikimedia Commons API.
 * Returns thumbnail URL or null on failure.
 */
export async function fetchWikimediaImage(
  brand: string,
  model: string
): Promise<string | null> {
  const query = `${brand} ${model} car`;
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url|size&iiurlwidth=800&format=json&origin=*`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const firstPage = Object.values(pages)[0] as {
      imageinfo?: { thumburl?: string }[];
    };
    return firstPage?.imageinfo?.[0]?.thumburl ?? null;
  } catch {
    return null;
  }
}

/**
 * Try KBB first, then Wikimedia, then return null.
 */
export async function fetchCarImage(
  brand: string,
  model: string,
  year: number,
  bodyType: string
): Promise<string | null> {
  const kbb = await fetchKbbImage(brand, model, year, bodyType);
  if (kbb) return kbb;

  const wiki = await fetchWikimediaImage(brand, model);
  return wiki;
}
