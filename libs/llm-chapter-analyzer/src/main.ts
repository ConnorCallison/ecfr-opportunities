import { analyzeAllChapters } from './lib/analyzer';

async function main() {
  // Start with Title 27 (Alcohol, Tobacco Products and Firearms)
  const titles = [27];

  console.log(`Analyzing titles: ${titles.join(', ')}`);

  console.log(process.env.DATABASE_URL);
  console.log(process.env.OPENAI_API_KEY);
  await analyzeAllChapters({ titles });
}

main().catch(console.error);
