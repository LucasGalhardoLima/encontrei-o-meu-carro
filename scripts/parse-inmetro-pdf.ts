import {
  downloadPbePdf,
  parsePbeTable,
} from "../app/services/ingestion/inmetro.server";

const DEFAULT_URL =
  "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotores-leves/pbe-veicular-2024.pdf";

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  console.error(`Downloading Inmetro PBE PDF from: ${url}`);

  const buffer = await downloadPbePdf(url);
  console.error(`Downloaded ${buffer.length} bytes`);

  const entries = await parsePbeTable(buffer);
  console.error(`Parsed ${entries.length} entries`);

  // Output as JSON to stdout
  console.log(JSON.stringify(entries, null, 2));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
