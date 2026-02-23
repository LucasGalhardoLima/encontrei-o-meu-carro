import { runIngestionJob } from "../app/services/ingestion/runner.server";

async function main() {
  console.log("Starting ingestion job...");
  const start = Date.now();

  const result = await runIngestionJob();

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nIngestion completed in ${duration}s`);
  console.log(`  Cars added:   ${result.carsAdded}`);
  console.log(`  Cars updated: ${result.carsUpdated}`);
  console.log(`  Cars skipped: ${result.carsSkipped}`);
  console.log(`  Errors:       ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`);
    }
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
