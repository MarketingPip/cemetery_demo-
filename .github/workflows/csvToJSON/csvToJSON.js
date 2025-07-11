import fs from 'fs/promises';
import Papa from 'papaparse';

function slugify(name, id) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // dashes for spaces/punctuation
    .replace(/^-+|-+$/g, '')     // trim leading/trailing dashes
    + `-${id}`;
}
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

function yearsOfHistory(providedYear) {
  const currentYear = new Date().getFullYear(); // Get the current year
  const difference = currentYear - providedYear; // Subtract the provided year from the current year
  
    // Round down to the nearest 50
  const roundedDifference = Math.floor(difference / 50) * 50;
  
  return {yearsOfHistory:difference, yearsOfHistory:roundedDifference };
}

function calculateAge(birthDate, endDate) {
  const birthYear = parseInt(birthDate.substring(0, 4));
  const birthMonth = parseInt(birthDate.substring(5, 7));
  const birthDay = parseInt(birthDate.substring(8, 10));

  const endYear = endDate ? parseInt(endDate.substring(0, 4)) : new Date().getFullYear();
  const endMonth = endDate ? parseInt(endDate.substring(5, 7)) : new Date().getMonth() + 1;
  const endDay = endDate ? parseInt(endDate.substring(8, 10)) : new Date().getDate();

  let age = endYear - birthYear;

  if (endMonth < birthMonth || (endMonth === birthMonth && endDay < birthDay)) {
    age--;
  }

  return age;
}

function calculateAverageAge(data) {
  let totalAge = 0;
  let count = 0;

  // Iterate through each record
  data.forEach(record => {
    // Only calculate age if the birth_date is valid
    if (record.birth_date !== "" && record.death_date !== "") {
      

      // Calculate age using the provided function
      const ageAtDeath = calculateAge(record.birth_date, record.death_date);

      // Add the valid age to totalAge and increment the count
      totalAge += ageAtDeath;
      count++;
    } 
  });

  // Return the average age, or 0 if no valid data
  return count > 0 ? totalAge / count : 0;
}


function getEarliestAndLatestData(data) {
  // Initialize variables to store results
  let earliestBirth = null;
  let earliestDeath = null;
  let latestDeath = null;
  let longestLivedPerson = null;
  let latestDeathPerson;
  let earliestBirthPerson;
  let longestLivedYears = 0;
 let earliestDeathPerson = null;
  // Iterate through the data array
  data.forEach(record => {
    // Parse the dates
    const birthDate = new Date(record.birth_date);
    const deathDate = record.death_date && record.death_date !== "00-00-00" ? new Date(record.death_date) : null;
    
    // Skip invalid birth dates (birthDate must be a valid date)
    if (isNaN(birthDate.getTime())) return;

    // Earliest Birth
    if (!earliestBirth || birthDate < earliestBirth) {
      earliestBirth = birthDate;
      earliestBirthPerson = record; // Store the person with the earliest birth
    }

        // Earliest Death
    if (deathDate && (!earliestDeath || deathDate < earliestDeath)) {
      earliestDeath = deathDate;
    }
    
    // Earliest Death (Keep the person with the earliest death date)
    if (deathDate && (!earliestDeathPerson || deathDate < new Date(earliestDeathPerson.death_date))) {
      earliestDeathPerson = record;
    }

    // Latest Death (Keep the person with the latest death date)
    if (deathDate && (!latestDeath || deathDate > latestDeath)) {
      latestDeath = deathDate;
      latestDeathPerson = record; // Store the person with the latest death
    }

    
       // Earliest Death (Keep the person with the earliest death date)
    if (deathDate && (!earliestDeathPerson || deathDate < new Date(earliestDeathPerson.death_date))) {
      earliestDeathPerson = record;
    }
    // Longest Life (calculate how long each person lived)
    if (deathDate) {
      const livedYears = (deathDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25); // Convert milliseconds to years
      if (livedYears > longestLivedYears) {
        longestLivedYears = livedYears;
        longestLivedPerson = record;
      }
    }
  });

  return {
    earliestBirth: earliestBirth ? earliestBirth.toISOString().substring(0, 10) : null,
    earliestDeath: earliestDeath ? earliestDeath.toISOString().substring(0, 10) : null,
    latestDeath: latestDeath ? latestDeath.toISOString().substring(0, 10) : null,
    earliestBirthPerson: earliestBirthPerson, // Person with the earliest birth
    earliestDeathPerson: earliestDeathPerson, // Person with the earliest death
    latestDeathPerson: latestDeathPerson,     // Person with the latest death

    earliestDeathPerson,
    latestDeathPerson,
    longestLivedPerson: longestLivedPerson,
    longestLivedYears: longestLivedYears.toFixed(0)
  };
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
      record.id = record.id || index
      record.parents = parseJsonField(record.parents);
      record.spouses = parseJsonField(record.spouses);
      record.children = parseJsonField(record.children);
      record.half_siblings = parseJsonField(record.half_siblings);
      record.siblings = parseJsonField(record.siblings);  
      return record;
    });

    // Process each record asynchronously.
    const records = allRecords.map(async (record) => {

   /*   // Handle 'parents' and 'spouses' fields when homePage is false
     if (!homePage) {
        record.parents = parseJsonField(record.parents);
        record.spouses = parseJsonField(record.spouses);
        record.children = parseJsonField(record.children);
        record.half_siblings = parseJsonField(record.half_siblings);
      }*/

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
       //   memorial_url: record.memorial_url.split('/').slice(-2).join('/'),
          image_url: record.image_url
        };

        // Delete unwanted fields explicitly to ensure they are removed
        delete record.memorial_url
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



// Process children
if (record.children && Array.isArray(record.children) && record.children.length) {
  record.children = await Promise.all(record.children.map(async (child) => {
    const childMemorialId = child.profile_url.split('/')[2];
    const childRecord = allRecords.find(r => r.memorial_url.includes(childMemorialId));
    if (childRecord) {
      console.log(childRecord);
      if (childRecord.image_url) {
        child.image_url = childRecord.image_url;
      }
      child.id = childRecord.id;
    }
    return child;
  }));
}

        
        // Write each non-homePage record to a separate JSON file in assets/people/[id]
        const recordDirectoryPath = './assets/people';
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

      const cemetery_stats = {grave_records:processedRecords.length, average_age:calculateAverageAge(processedRecords), ...getEarliestAndLatestData(processedRecords)}

      await fs.writeFile('./_data/cemetery_stats.json', JSON.stringify(cemetery_stats, null, 2), 'utf8');
      
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
