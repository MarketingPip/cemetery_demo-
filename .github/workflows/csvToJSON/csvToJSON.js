import fs from 'fs/promises'; // Using fs.promises for async operations
import Papa from 'papaparse';

const convertCsvToJson = async (filePath, outputFilePath, homePage=true) => {
  try {
    // Step 1: Read the CSV file asynchronously
    const csvData = await fs.readFile(filePath, 'utf8');

    // Step 2: Parse the CSV data using PapaParse
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    // Step 3: Process the parsed data
    const records = results.data.map((record, index) => {
      try {
        record.id = index;

        if(!homePage){
        // Handle 'parents' field (replace 'None' with null and parse JSON string)
        record.parents = record.parents ? JSON.parse(record.parents.replace(/'/g, '"').replace(/None/g, 'null')) : [];

        // Handle 'spouses' field (replace 'None' with null and parse JSON string)
        record.spouses = record.spouses ? JSON.parse(record.spouses.replace(/'/g, '"').replace(/None/g, 'null')) : [];
        }
        // Handle 'gps' field (replace single quotes and parse JSON string)
        if (record.gps) {
          record.gps = JSON.parse(record.gps.replaceAll("'", "`"));
        }
      } catch (e) {
         if(!homePage){
        // If any parsing fails, set 'parents' and 'spouses' as empty arrays
        record.parents = [];
        record.spouses = [];
         }
      }

      return record;
    });

    // Step 4: Write the final JSON object to a file
    await fs.writeFile(outputFilePath, JSON.stringify(records, null, 2), 'utf8');

    console.log(`Data successfully written to ${outputFilePath}`);
    return records;
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
}

// Example Usage
const inputFilePath = './assets/cemetery_data.csv'; // Replace with your actual CSV file path
const outputFilePath = './assets/cemetery_data.json'; // Replace with your desired output JSON file path

convertCsvToJson(inputFilePath, outputFilePath)
  .then((jsonData) => {
    console.log('Processed JSON Data:', jsonData);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
