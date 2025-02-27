import readline from 'readline'; //peer review: readline also has a promise-based API "node:readline/promises" to use
import { loadData } from './AirBnBDataHandler.js';

/**
 * Promisified readline question.
 * @param {readline.Interface} rl - Readline interface.
 * @param {string} question - The question to ask.
 * @returns {Promise<string>} User's answer.
 */
const askQuestion = (rl, question) =>
  new Promise((resolve) => rl.question(question, resolve));

/**
 * Starts the console UI.
 * @param {string} csvFilePath - Path to the CSV file.
 */
export const startUI = async (csvFilePath) => {
  let handler = await loadData(csvFilePath);
  console.log('Data loaded. Total listings:', handler.data.length);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Object to store the computed results.
  const calculations = {};

  let exit = false;
  while (!exit) { // peer review: nice cli. one thing to note is that the filter results may accumulated
    console.log(`
      1. Filter Listings
      2. Compute Statistics
      3. Compute Listings Per Host
      4. Filter by Host Location
      5. Export Results
      6. Exit
    `);
    const choice = await askQuestion(rl, 'Select an option: ');
    switch (choice.trim()) {
      case '1': {
        const price = await askQuestion(rl, 'Enter max price (or leave blank): ');
        const roomType = await askQuestion(
          rl,
          'Enter room type (Entire home/apt, Private room, or leave blank): '
        );
        const bedrooms = await askQuestion(rl, 'Enter number of bedrooms (or leave blank): ');
        const rating = await askQuestion(
          rl,
          'Enter minimum review scores rating (or leave blank): '
        );
        const filterParams = {
          price: price ? parseFloat(price) : undefined,
          room_type: roomType || undefined,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          review_scores_rating: rating ? parseFloat(rating) : undefined,
        };
        // Update the working handler with the filtered data.
        handler = handler.filter(filterParams);
        console.log('Filtered listings count:', handler.data.length);
        break;
      }
      case '2': {
        const stats = handler.computeStats();
        calculations.stats = stats;
        console.log('Computed Statistics:');
        console.log('Total listings:', stats.count);
        console.log('Average price per number of bedrooms:', stats.avgPricePerBedroom);
        break;
      }
      case '3': {
        const rankings = handler.computeListingsPerHost();
        calculations.rankings = rankings;
        console.log('Computed Listings Per Host (ranked):', rankings);
        break;
      }
      case '4': {
        const location = await askQuestion(rl, 'Enter host location to filter: ');
        const locationFilteredHandler = handler.filterByHostLocation(location);
        calculations.locationCount = [location, locationFilteredHandler.data.length];
        console.log('Listings count for host location:', locationFilteredHandler.data.length);
        break;
      }
      case '5': {
        const filePath = await askQuestion(rl, 'Enter export file path: ');
        await handler.exportResults(filePath, calculations);
        console.log('Results exported to', filePath);
        break;
      }
      case '6': {
        exit = true;
        break;
      }
      default:
        console.log('Invalid option, try again.');
    }
  }
  rl.close();
};
