import nlp from "https://esm.sh/compromise"
import Papa from "https://esm.sh/papaparse";
let doc = nlp(`Ryan Van Valkengoed, 17, of Crediton went missing after leaving a friend's house a short distance from home the evening of January 11.`)
const filteredData = doc.people().json().map(item => {
  // Extract firstName and lastName from the terms
  const firstNameTerm = item.terms.find(term => term.tags.includes("FirstName"));
  const lastNameTerm = item.terms.find(term => term.tags.includes("LastName"));

  console.log(lastNameTerm )
  // Ensure both firstName and lastName are not empty
  const firstName = firstNameTerm ? firstNameTerm.text : null;
  const lastName = lastNameTerm ? lastNameTerm.text : null;

  // If either firstName or lastName is null, skip this item
  if (!firstName || !lastName) {
    return null;
  }

  // Return the new format as an object with firstName, lastName, and fullText
  return {
    firstName,
    lastName,
    fullText: `${firstName} ${lastName}`
  };
}).filter(item => item !== null); // Remove any null items

 

const uniqueNames = Array.from(new Set(filteredData.map(a => a.fullText)))
  .map(fullText => filteredData.find(item => item.fullText === fullText));

   async function getCemeteryData() {
    try {
        const response = await fetch('https://marketingpip.github.io/cemetery_demo-/assets/cemetery_data.csv');
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        return csvText;
    } catch (error) {
        console.error('Error fetching cemetery data:', error);
        return [];
    }
}



const csvData =  await getCemeteryData()

let records;
    // Parse CSV data using PapaParse
    function parseData() {
      const results = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      });
      
      records = results.data.map((record, index) => {
        try {
          record.id = index
          record.parents = record.parents ? JSON.parse(record.parents.replace(/'/g, '"').replace(/None/g, 'null')) : [];
          record.spouses = record.spouses ? JSON.parse(record.spouses.replace(/'/g, '"').replace(/None/g, 'null')) : [];
           if(record.gps){
             record.gps = JSON.parse(record.gps.replaceAll("'", `"`))
             
           
             //record.gps = JSON.parse(JSON.parse(record.gps.trim() )) 
           }
        } catch (e) {
          record.parents = [];
          record.spouses = [];
        }
        return record;
      });
    }

parseData()


function findMatchingNames(uniqueNames, memorials) {
  return uniqueNames.map(uniqueName => {
    // Create the full name from the unique name (e.g., "firstName lastName")
    const fullName = `${uniqueName.firstName}`;

    // Find the memorial that matches the full name (or last name)
    const matchingMemorial = memorials.find(memorial => memorial.name.includes(fullName));

    // If a match is found, return an object with the unique name and memorial id
    if (matchingMemorial) {
      return { 
        nameFoundInArticle:{...uniqueName}, 
        memorialId: matchingMemorial.id,
        memorialURL: matchingMemorial.memorial_url,
        memorialName: matchingMemorial.name
      };
    }

    // If no match, return null or skip
    return null;
  }).filter(item => item !== null); // Remove any null values from the result
}
console.log(findMatchingNames(uniqueNames, records))
