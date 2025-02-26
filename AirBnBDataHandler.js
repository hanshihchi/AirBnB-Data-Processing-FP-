import { readFile, writeFile } from 'node:fs/promises';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';
import { parse } from 'csv-parse/sync';

const gunzipAsync = promisify(gunzip);

/**
 * Helper function to extract numeric value from a price string.
 * @param {string} priceStr - Price string (e.g. "$140.00")
 * @returns {number} Numeric value of the price.
 */
const extractPrice = (priceStr) => parseFloat(priceStr.replace(/[^0-9.]/g, ''));

/**
 * Creates a new AirBnBDataHandler with the given data.
 * Implements method chaining for functional operations.
 * @param {Array<Object>} data - Array of listing objects.
 * @returns {Object} The handler with chained methods.
 */
export const AirBnBDataHandler = (data = []) => {
  return {
    data,

    /**
     * Filters listings based on provided criteria.
     * @param {Object} criteria - Filter options.
     * @param {number} [criteria.price] - Maximum price.
     * @param {string} [criteria.room_type] - Room type (e.g. "Entire home/apt" or "Private room").
     * @param {number} [criteria.bedrooms] - Number of bedrooms.
     * @param {number} [criteria.review_scores_rating] - Minimum review score.
     * @returns {Object} A new AirBnBDataHandler instance with filtered data.
     */
    filter(criteria = {}) {
      let filteredData = this.data;
      if (criteria.price !== undefined)
        filteredData = filteredData.filter(
          (listing) => extractPrice(listing.price) <= criteria.price
        );
      if (criteria.room_type)
        filteredData = filteredData.filter(
          (listing) => listing.room_type === criteria.room_type
        );
      if (criteria.bedrooms !== undefined)
        filteredData = filteredData.filter(
          (listing) => parseInt(listing.bedrooms) === criteria.bedrooms
        );
      if (criteria.review_scores_rating !== undefined)
        filteredData = filteredData.filter(
          (listing) =>
            parseFloat(listing.review_scores_rating) >= criteria.review_scores_rating
        );
      return AirBnBDataHandler(filteredData);
    },

    /**
     * Computes statistics on the current listings.
     * This includes:
     *  - Total listings (i.e. the count of the current, possibly filtered, listings)
     *  - Average price per number of bedrooms (ignoring listings with an empty price)
     *
     * @returns {Object} Statistics object.
     */
    computeStats() {
      const count = this.data.length;
      const avgPricePerBedroom = this.data.reduce((acc, curr) => {
        // Skip listings with an empty price
        if (!curr.price || curr.price.trim() === '') {
          return acc;
        }
        const priceValue = extractPrice(curr.price);
        const bedCount = parseInt(curr.bedrooms);
        if (!acc[bedCount]) {
          acc[bedCount] = { sum: 0, count: 0 };
        }
        acc[bedCount].sum += priceValue;
        acc[bedCount].count += 1;
        return acc;
      }, {});

      // Calculate average price for each bedroom count.
      Object.keys(avgPricePerBedroom).forEach((key) => {
        const { sum, count } = avgPricePerBedroom[key];
        avgPricePerBedroom[key] = count > 0 ? sum / count : 0;
      });
      return { count, avgPricePerBedroom };
    },

    /**
     * Computes and ranks the number of listings per host.
     * @returns {Array<Array>} Sorted array of [host_id, count] pairs.
     */
    computeListingsPerHost() {
      const hostListings = this.data.reduce((acc, curr) => {
        const hostId = curr.host_id;
        acc[hostId] = (acc[hostId] || 0) + 1;
        return acc;
      }, {});
      const ranking = Object.entries(hostListings).sort((a, b) => b[1] - a[1]);
      return ranking;
    },

    /**
     * Filters listings based on host location.
     * @param {string} hostLocation - The host location to filter by.
     * @returns {Object} A new AirBnBDataHandler instance with filtered data.
     */
    filterByHostLocation(hostLocation) {
      const filtered = this.data.filter((listing) =>
        listing.host_location.includes(hostLocation)
      );
      return AirBnBDataHandler(filtered);
    },

    /**
     * Exports the current filtered data and any provided calculation results to the given file path.
     * @param {string} filePath - Path where the results will be saved.
     * @param {Object} [calculations={}] - An object containing calculation results (e.g., stats, host rankings).
     * @returns {Promise<Object>} A promise resolving to the current instance.
     */
    async exportResults(filePath, calculations = {}) {
      const exportContent = {
        filteredListings: this.data,
        calculations,
      };
      const output = JSON.stringify(exportContent, null, 2);
      await writeFile(filePath, output, 'utf8');
      return this;
    },
  };
};

/**
 * Loads CSV data from the given file path and returns a new AirBnBDataHandler.
 * If the file is gzipped (.gz extension), it decompresses it.
 * Uses csv-parse to handle CSV complexities like quoted fields, commas, and empty values.
 * @param {string} csvFilePath - Path to the CSV file.
 * @returns {Promise<Object>} A promise resolving to an AirBnBDataHandler instance.
 */
export const loadData = async (csvFilePath) => {
  let buffer = await readFile(csvFilePath);
  if (csvFilePath.endsWith('.gz')) {
    buffer = await gunzipAsync(buffer);
  }
  const content = buffer.toString('utf8');

  // Parse the CSV content using csv-parse.
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return AirBnBDataHandler(records);
};
