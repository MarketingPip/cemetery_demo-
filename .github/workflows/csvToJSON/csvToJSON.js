import fs from 'fs/promises'; // Using fs.promises for async operations
import Papa from 'papaparse';

const convertCsvToJson = async (filePath, outputFilePath, homePage = true) => {
  try {
    // Step 1: Read the CSV file asynchronously
    const csvData = await fs.readFile(filePath, 'utf8');

    // Step 2: Parse the CSV data using PapaParse
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    // Step 3: Process the parsed data
    const records = results.data.map(async (record, index) => {
      // Assign an id to each record based on the index
      record.id = index;

      // Helper function to parse JSON fields with error handling
      const parseJsonField = (field, defaultValue = []) => {
        try {
          return field ? JSON.parse(field.replace(/'/g, '"').replace(/None/g, 'null')) : defaultValue;
        } catch {
          return defaultValue;
        }
      };

      // Handle 'parents' and 'spouses' fields when homePage is false
      if (!homePage) {
        record.parents = parseJsonField(record.parents);
        record.spouses = parseJsonField(record.spouses);
      }

      // Handle 'gps' field (replace single quotes and parse JSON string)
      if (record.gps && record.gps.trim().length) {
        try {
          record.gps = JSON.parse(record.gps.replaceAll("'", "`"));
        } catch (e) {
          record.gps = null;
        }
      } else {
        record.gps = null;
      }

      // If homePage is true, filter only required fields
      if (homePage) {
        record = {
          id: record.id,
          gps: record.gps,
          name: record.name,
          birth_date: record.birth_date,
          death_date: record.death_date,
          location: record.location,
          memorial_url: record.memorial_url.split('/').slice(-2).join('/'),
          image_url: record.image_url
        };

        // Delete unwanted fields explicitly to make sure they are removed
        delete record.cemetery;
        delete record.bio;
        delete record.parents;
        delete record.spouses;
        delete record.children;
        delete record.siblings;
      }


     if(!homePage){

      // Step 4: Write each record to a separate JSON file in assets/people/[id]
      const recordDirectoryPath = './assets/people';
      await fs.mkdir(recordDirectoryPath, { recursive: true }); // Ensure directory exists
      const recordFilePath = `./assets/people/${record.id}.json`;
      await fs.writeFile(recordFilePath, JSON.stringify(record, null, 2), 'utf8');
      console.log(`Record ${record.id} written to ${recordFilePath}`);

     }
       
      return record;
    });


   if(homePage){
    // Wait for all the record files to be written asynchronously
    const processedRecords = await Promise.all(records);

    // Step 5: Write the final JSON array to the output file
    await fs.writeFile(outputFilePath, JSON.stringify(processedRecords, null, 2), 'utf8');
    console.log(`Data successfully written to ${outputFilePath}`);

    return processedRecords;
   }
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};


// Example Usage
const inputFilePath = './assets/cemetery_data.csv'; // Replace with your actual CSV file path
const outputFilePath = './assets/cemetery_data.json'; // Replace with your desired output JSON file path

convertCsvToJson(inputFilePath, outputFilePath)
  .then((jsonData) => {
    console.log('Processed JSON Data for Home Page');
  })
  .catch((error) => {
    console.error('Error:', error);
  });


convertCsvToJson(inputFilePath, outputFilePath, false)
  .then((jsonData) => {
    console.log('Processed JSON Data for People IDs');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
