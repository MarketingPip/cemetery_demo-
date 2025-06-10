import fs from 'fs/promises';
import Papa from 'papaparse';

function slugify(name, id) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // dashes for spaces/punctuation
    .replace(/^-+|-+$/g, '')     // trim leading/trailing dashes
    + `-${id}`;
}

const convertCsvToJson = async (filePath, outputFilePath, homePage = true) => {
  try {
    // Step 1: Read the CSV file asynchronously
    const csvData = await fs.readFile(filePath, 'utf8');

    // Step 2: Parse the CSV data using PapaParse
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    // Pre-process all records: assign IDs if missing.
    // This creates a new array (allRecords) where each record is guaranteed to have an id.
    const allRecords = results.data.map((record, index) => {
      record.id = record.id || index;
      return record;
    });

    // Process each record asynchronously.
    const records = allRecords.map(async (record) => {
      // Helper function to parse JSON fields with error handling
      const parseJsonField = (field, defaultValue = []) => {
        try {
          return field
            ? JSON.parse(field.replace(/'/g, '"').replace(/None/g, 'null'))
            : defaultValue;
        } catch {
          return defaultValue;
        }
      };

      // Handle 'parents' and 'spouses' fields when homePage is false
      if (!homePage) {
        record.parents = parseJsonField(record.parents);
        record.spouses = parseJsonField(record.spouses);
        record.children = parseJsonField(record.children);
        record.half_siblings = parseJsonField(record.half_siblings);
      }

      // Handle 'gps' field (replace single quotes and parse JSON string)
      if (record.gps && record.gps.trim().length) {
        try {
          record.gps = parseJsonField(record.gps);
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

        // Delete unwanted fields explicitly to ensure they are removed
        delete record.cemetery;
        delete record.bio;
        delete record.parents;
        delete record.spouses;
        delete record.children;
        delete record.siblings;
      }

      // For non-homePage records, update related people (spouses, parents, siblings)
      if (!homePage) {
        // Process spouses
        if (record.spouses && Array.isArray(record.spouses) && record.spouses.length) {
          record.spouses = await Promise.all(record.spouses.map(async (spouse) => {
            // Extract memorial ID from spouse's profile_url (e.g., /memorial/188035990/john_f-brown)
            const spouseMemorialId = spouse.profile_url.split('/')[2];
            // Use the pre-processed allRecords to find the matching record
            const spouseRecord = allRecords.find(r => r.memorial_url.includes(spouseMemorialId));
            if (spouseRecord) {
              if (spouseRecord.image_url) {
                spouse.image_url = spouseRecord.image_url;
              }
              spouse.id = spouseRecord.id;
            } else {
              console.log(`ID not found for spouse: ${spouse.name}`);
            }
            return spouse;
          }));
          record.slug = slugify(record.name, record.id)
        }

        // Process parents
        if (record.parents && Array.isArray(record.parents) && record.parents.length) {
          record.parents = await Promise.all(record.parents.map(async (parent) => {
            const parentMemorialId = parent.profile_url.split('/')[2];
            const parentRecord = allRecords.find(r => r.memorial_url.includes(parentMemorialId));
            if (parentRecord) {
              if (parentRecord.image_url) {
                parent.image_url = parentRecord.image_url;
              }
              parent.id = parentRecord.id;
            }
            return parent;
          }));
        }

        // Process siblings
        if (record.siblings && Array.isArray(record.siblings) && record.siblings.length) {
          record.siblings = await Promise.all(record.siblings.map(async (sibling) => {
            const siblingMemorialId = sibling.profile_url.split('/')[2];
            const siblingRecord = allRecords.find(r => r.memorial_url.includes(siblingMemorialId));
            if (siblingRecord) {
              console.log(siblingRecord)
              if (siblingRecord.image_url) {
                sibling.image_url = siblingRecord.image_url;
              }
              sibling.id = siblingRecord.id;
            }
            return sibling;
          }));
        }

        // Write each non-homePage record to a separate JSON file in assets/people/[id]
        const recordDirectoryPath = './_tributes';
        await fs.mkdir(recordDirectoryPath, { recursive: true });
        const recordFilePath = `${recordDirectoryPath}/${record.id}.json`;
        await fs.writeFile(recordFilePath, JSON.stringify(record, null, 2), 'utf8');
        console.log(`Record ${record.id} written to ${recordFilePath}`);
      }

      return record;
    });

    if (homePage) {
      // Process each record sequentially to ensure all asynchronous operations complete
      const processedRecords = [];
      for (const recordPromise of records) {
        const processedRecord = await recordPromise;
        processedRecords.push(processedRecord);
      }

      // Write the final JSON array to the output file
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

async function processCsvData(inputFilePath, outputFilePath) {
  try {
    // Process the home page data
    await convertCsvToJson(inputFilePath, outputFilePath);
    console.log('Processed JSON Data for Home Page');

    // Process the people IDs data
    await convertCsvToJson(inputFilePath, outputFilePath, false);
    console.log('Processed JSON Data for People IDs');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function
processCsvData(inputFilePath, outputFilePath);
