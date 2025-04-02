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
      // Ensure a unique ID for each record
      record.id = record.id || index;  // Use the record's ID if it exists, else use the index

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



      // Step 5: Write each record to a separate JSON file in assets/people/[id]
      if (!homePage) {

      // Step 4: Add image_url and id for spouses, parents, and siblings if they exist in the record
      if (record.spouses && Array.isArray(record.spouses) && record.spouses.length) {
        record.spouses = await Promise.all(record.spouses.map(async (spouse) => {
          const spouseMemorialId = spouse.profile_url.split('/')[2]; // Extract memorial ID from spouse's URL
          const spouseRecord = results.data.find(r => r.memorial_url.includes(spouseMemorialId)); // Find the record by memorial_id
          if (spouseRecord && spouseRecord.image_url) {
            spouse.image_url = spouseRecord.image_url;
            console.log(`Found image for ${spouse.name} & ${spouseRecord.id}`)
            
          }
          if (spouseRecord) {
            spouse.id = spouseRecord.id; // Add ID if it's not a homepage
          } else {
            console.log(`Couldn't find record for ${spouse.name}`)
          }
          return spouse;
        }));
      }

      if (record.parents && Array.isArray(record.parents) && record.parents.length) {
        record.parents = await Promise.all(record.parents.map(async (parent) => {
          const parentMemorialId = parent.profile_url.split('/')[2]; // Extract memorial ID from parent's URL
          const parentRecord = results.data.find(r => r.memorial_url.includes(parentMemorialId)); // Find the record by memorial_id
          if (parentRecord && parentRecord.image_url) {
            parent.image_url = parentRecord.image_url;
          }
          if (parentRecord) {
            parent.id = parentRecord.id; // Add ID if it's not a homepage
          }
          return parent;
        }));
      }

      if (record.siblings && Array.isArray(record.siblings) && record.siblings.length) {
        record.siblings = await Promise.all(record.siblings.map(async (sibling) => {
          const siblingMemorialId = sibling.profile_url.split('/')[2]; // Extract memorial ID from sibling's URL
          const siblingRecord = results.data.find(r => r.memorial_url.includes(siblingMemorialId)); // Find the record by memorial_id
          if (siblingRecord && siblingRecord.image_url) {
            sibling.image_url = siblingRecord.image_url;
          }
          if (siblingRecord) {
            sibling.id = siblingRecord.id; // Add ID if it's not a homepage
          }
          return sibling;
        }));
      }
        
        const recordDirectoryPath = './assets/people';
        await fs.mkdir(recordDirectoryPath, { recursive: true }); // Ensure directory exists
        const recordFilePath = `./assets/people/${record.id}.json`;
        await fs.writeFile(recordFilePath, JSON.stringify(record, null, 2), 'utf8');
        console.log(`Record ${record.id} written to ${recordFilePath}`);
      }

      return record;
    });

    if (homePage) {
      // Wait for all the record files to be written asynchronously
      const processedRecords = await Promise.all(records);

      // Step 6: Write the final JSON array to the output file
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
