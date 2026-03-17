import dotenv from "dotenv";

// Load .env before any other app code so OPENROUTER_API_KEY etc. are available everywhere
dotenv.config();

async function main() {
  const { handleCron } = await import("./controllers/cron");
  console.log(`Starting process to generate draft...`);
  await handleCron();
}
main();


// If you want to run the cron job manually, uncomment the following line:
//cron.schedule(`0 17 * * *`, async () => {
//  console.log(`Starting process to generate draft...`);
//  await handleCron();
//});