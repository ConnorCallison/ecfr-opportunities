import { analyzeAllChapters } from './lib/analyzer.js';

async function main() {
  const titles = [
    //41, // Public Contracts and Property Management
    27, // Alcohol, Tobacco Products and Firearms
    50, // Wildlife and Fisheries
    47, // Telecommunications
    34, // Education
    39, // Postal Service,
    32, // National Defense,
    29, // Labor,
    24, // Housing and Urban Development,
    10, // Energy,
    6, // Domestic Security,
    8, // Aliens and Nationality,
    5, // Administrative Personnel,
    18, // Conservation of Power and Water,
  ];

  console.log(`Analyzing titles: ${titles.join(', ')}`);

  await analyzeAllChapters({ titles });
}

main().catch(console.error);
