# AirBnB Data Processor (FP)
- Video Link: https://youtu.be/QPvyj2GlCMk

This project is designed to process AirBnB listings data in a functional programming style. It reads a CSV file (which may be gzipped), applies various filters, computes statistics, and exports the results. The application is built with ES6 modules and leverages pure functions, method chaining, and higher-order functions (e.g., `map`, `filter`, and `reduce`) to ensure code clarity and maintainability.

## Project Structure

- **index.js**  
  The main entry point of the application. It accepts the CSV file path as a command-line argument and starts the command line interface (CLI).

- **AirBnBDataHandler.js**  
  The core module that implements the data processing functionalities. It provides methods for:
  - Filtering listings based on criteria (price, room type, number of bedrooms, review score).
  - Computing statistics on the current (filtered) listings, including:
    - Total listings count.
    - Average price per number of bedrooms (ignoring listings with an empty price).
  - Computing the number of listings per host and ranking them.
  - Filtering listings by host location (Addition).
  - Exporting the current filtered listings along with any computed calculations.
  
  The module is designed to be pure and uses method chaining so that every filtering operation returns a new handler instance without mutating the original data.

- **ui.js**  
  Implements a basic CLI using Node’s built-in `readline` module. The UI presents a menu with the following options:
  1. **Filter Listings** – Update the working dataset based on user-specified criteria, such as price, room_type(addition), number of bedrooms or review score rating.
  2. **Compute Statistics** – Compute and display statistics (e.g., total filtered listings, average price per number of bedrooms).
  3. **Compute Listings Per Host** – Compute and display a ranking of hosts by their number of listings.
  4. **Filter by Host Location(Addition)** – Filter the listings based on a specified host location.
  5. **Export Results** – Export the current filtered listings and any computed calculations to a json file.
  6. **Exit** – Close the application.
  
- **Configuration Files**
  - **eslint and prettier**  
    Provide ESLint and Prettier configurations to maintain code quality and formatting standards.


## Counter Example (Impure Code)

Below is a counter example shows an impure function that violates functional programming principles by directly mutating a global variable:

```js
// Global variable that holds the listings data.
let globalListings = [];

/**
 * Impure function that filters listings based on criteria,
 * but directly mutates the globalListings variable.
 * This violates the principle of pure functions.
 *
 * @param {Object} criteria - Filtering criteria (e.g., { price: 200 }).
 * @returns {Array<Object>} The filtered listings.
 */
function impureFilterListings(criteria = {}) {
  // Directly modify the global state.
  if (criteria.price !== undefined) {
    globalListings = globalListings.filter(
      (listing) => extractPrice(listing.price) <= criteria.price
    );
  }
  // Further filtering could be added here...
  return globalListings;
}

/**
 * Helper function to extract numeric value from a price string.
 * @param {string} priceStr - Price string (e.g. "$140.00")
 * @returns {number} Numeric value of the price.
 */
function extractPrice(priceStr) {
  return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
}
```
The function impureFilterListings directly alters the globalListings variable, which can lead to unpredictable side effects and makes the code harder to test and maintain. A proper functional approach should take data as an input and return a new, filtered result without modifying the original dataset.


## Run
- **Install Dependencies:**
```bash
npm install csv-parse
```
- **Run the Application:**
Provide the path to the CSV file (e.g., listings.csv.gz):
```bash
node index.js path/to/listings.csv.gz
```

## Resources
  - csv-parse/sync: https://csv.js.org/parse/api/sync/
  - JSDoc: https://jsdoc.app/
  - **AI Usage:**
    - ChatGPT(4o/o3-mini-high)
      - Used for Loading csv
        - Prompt: How to load the csv file that can handle complex structures, such as lists(commas within fields), quoted strings, and empty values in Node.js?
        - Verified through researching on the csv-parse/sync(link provided in resources)
      - Used for JSDoc documentation
        - Prompt: (code) Help me document my code using JSDoc
        - Verified through researching on the JSDoc(link provided in resources)
      - Used for writing README.md(Overview, Structure, Counter Example)
        - Prompt: Write a README file that explains the program, including structure and the counter example
