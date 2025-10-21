
import * as markmap from "markmap-lib";
import { Markmap, loadCSS, loadJS } from "markmap-view";

function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
    
function renderMarkmap(parents, spouses, children, grandchildren, siblings, person) {
  // Initialize the Markdown output

  let markdown = `# ${person.name}`;
  if (person.dob && person.dod) {
    markdown += ` (${person.dob}–${person.dod})\n`;
  } else {
    markdown += "\n";
  }
  // Process parents, spouses, children, and grandchildren to generate markdown
  if (parents && parents.length) {
    markdown += `- Parents\n`;
    parents.forEach((gc) => {
      markdown += `    - ${gc.name}\n`;
    });
  }

  if (spouses && spouses.length) {
    markdown += `- Spouses\n`;
    spouses.forEach((gc) => {
      markdown += `    - ${gc.name}\n`;
    });
    markdown += "\n";
  }

  if (children && children.length) {
    markdown += `- Children\n`;
    children.forEach((gc) => {
      markdown += `    - ${gc.name}\n`;
    });
    markdown += "\n";
  }


    if (siblings && siblings.length) {
    markdown += `- Siblings\n`;
    siblings.forEach((gc) => {
      markdown += `    - ${gc.name}\n`;
    });
    markdown += "\n";
  }
  if (grandchildren && grandchildren.length) {
    markdown += `- Grandchildren:\n`;
    grandchildren.forEach((gc) => {
      markdown += `    - ${gc.name}\n`;
    });
    markdown += "\n";
  }

  const { Transformer } = markmap;

  const transformer = new Transformer();
  const { root, features } = transformer.transform(markdown);

  // Extract used assets (CSS and JS)
  const { styles, scripts } = transformer.getUsedAssets(features);

  // Load the assets (if any)
  if (styles) loadCSS(styles);
  if (scripts) {
    loadJS(scripts, {
      getMarkmap: () => markmap
    });
  }

  // Create the mindmap
  return Markmap.create("#markmap", {}, root);
}

function populateFamilyMemorialLink(familyName) {
  // Get the elements by their classes or IDs
  const familyNameElement = document.querySelector('.family-name');
  const seeOtherLink = document.getElementById('see-other');
  
  // Check if the elements exist
  if (familyNameElement && seeOtherLink) {
    // Update the family name in the <strong> tag
    familyNameElement.textContent = familyName;
    
    // Construct the URL for the search link (replace with actual base URL if needed)
    const url = new URL(seeOtherLink.href);  // Existing URL in the href attribute
    url.searchParams.set('surname', familyName);  // Assuming you want to search by family name
    
    // Update the href attribute with the new URL
    seeOtherLink.href = url.toString();
  } else {
    console.error('Required elements not found.');
  }
}
    
    
function populateGenealogyLink(name, gender) {
  // Get the link element by ID
  const geneLink = document.getElementById('gene-link');
  
  // Check if the element exists
  if (geneLink) {
    // Construct the URL with the dynamic parameters
    const url = new URL(geneLink.href);  // Existing URL in the href attribute
    url.searchParams.set('name', name);
    url.searchParams.set('gender', gender);
    
    // Update the href attribute with the new URL
    geneLink.href = url.toString();
  } else {
    console.error('Genealogy link element not found.');
  }
}

let lightbox = document.getElementById("lightboxModal");
let lightboxImage = document.getElementById("lightboxImage");

function openLightbox(imageUrl, caption) {
  lightboxImage.src = imageUrl;
  lightboxImage.alt = caption || "Enlarged photo";
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");

  // Create a reference to the event handler
  lightbox._clickHandler = function (e) {
    if (e.target !== lightboxImage) {
      closeLightbox();
    }
  };

  // Add event listener using the handler reference
  lightbox.addEventListener("click", lightbox._clickHandler);
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  lightbox.classList.remove("flex");

  // Remove the event listener using the stored reference
  if (lightbox._clickHandler) {
    lightbox.removeEventListener("click", lightbox._clickHandler);
    delete lightbox._clickHandler;
  }
}


// Add lightbox functionality to all photos in the Photos tab
function initLightBox(){    
const photoItems = document.body.querySelectorAll(".lightbox");

photoItems.forEach((img) => {
  // Add the new event listener
  img.addEventListener("click", () => {
    openLightbox(
      img.getAttribute("data-fullsize"),
      img.getAttribute("data-caption")
    );
  });
 });
}     

function exhibitMentions(exhibitsData, targetId) {
  if (!Array.isArray(exhibitsData.exhibits)) return null;

  const idStr = String(targetId);

  const matches = exhibitsData.exhibits.filter(exhibit =>
    Array.isArray(exhibit.idMentions) &&
    exhibit.idMentions.some(id => String(id) === idStr)
  );

  return matches.length ? matches : null;
}


async function getExhibits(tributeId) {
  const url = `./../exhibits_mentions.json`; // Replace with the actual API URL

  try {
    // Fetch the JSON data from the URL
    const response = await fetch(url);

    // Check if the response status is OK (200-299 range)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    return exhibitMentions(data, tributeId); // Return the data so it can be used elsewhere
  } catch (error) {
    return null; // Return null or handle the error as appropriate
  }
}

    
async function tributeData(tributeId) {
  const url = `./../assets/people/${tributeId}.json`; // Replace with the actual API URL

  try {
    // Fetch the JSON data from the URL
    const response = await fetch(url);

    // Check if the response status is OK (200-299 range)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Handle the fetched data (you can replace this with your own processing logic)
    console.log('Fetched tribute data:', data);

    return data; // Return the data so it can be used elsewhere
  } catch (error) {
    // Error handling for network errors or JSON parsing errors
    console.error('Error fetching tribute data:', error);
    return null; // Return null or handle the error as appropriate
  }
}


// Function to render a single person (used for parents, spouse, siblings, children)
function renderPerson(person) {
    const tributeUrl = (person?.id !== undefined && person?.id !== null)
    ? `{{ base_url }}/tribute?id=${person.id}`
    : `{{ base_url }}/redirect?page=FindAGrave&url=https://findagrave.com${encodeURIComponent(person.profile_url)}`;

    return `
        <!-- Wrap the whole card in an anchor tag to make it clickable -->
        <a href="${tributeUrl}" 
           title="View ${person.name}'s memorial page" 
           aria-label="Link to ${person.name}'s memorial page"
           class="block">
            <div class="flex items-start gap-4 mb-2">
                <img src="${person?.image_url && person.image_url !== "" ? person.image_url : '{{ base_url }}/assets/images/placeholder.png'}" 
                     alt="${person?.name}" 
                     class="w-24 h-32 object-cover rounded-md border border-gray-700">
                <div>
                    <p class="text-base md:text-lg font-medium">${person.name}</p>
                    <p class="text-sm md:text-base text-gray-400">${formatBirthDeathDates(person.birth_date, person.death_date)}</p>
                </div>
            </div>
        </a>
    `;
}


// Function to render a section (e.g., Parents, Spouse, Siblings, Children)
function renderSection(title, people) {
    if (!people || people.length === 0) return ''; // Return empty string if no people in this section
    const peopleHTML = people.map(person => renderPerson(person)).join('');
    return `
        <div class="mb-8">
            <h2 class="text-lg md:text-xl font-semibold mb-4">${title}</h2>
            <div class="space-y-6">${peopleHTML}</div>
        </div>
    `;
}


// Age Helpers

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

function formatDate(birthDate, deathDate) {
  // Function to handle the date logic (check empty, null, or placeholder)
  function handleDate(date) {
    // If date is empty or null, return "Unknown"
    if (!date || date === "") {
      return "Unknown";
    }

    // Return the date if it's valid
    return date;
  }

  // Handle both birth and death dates
  const birth = handleDate(birthDate);
  const death = handleDate(deathDate);

  // Calculate age if both dates are valid
  if (birth !== "Unknown" && death !== "Unknown") {
    const age = calculateAge(birth, death);

    // Check if the birth or death date contained -00-00, if so, prepend "About"
    if (birth.includes("-00-00") || death.includes("-00-00")) {
      return `About ${age}`;
    }

    return age; // Return age as a number
  }

  // If any date is "Unknown", return "Unknown"
  return "Unknown";
}    
  
// Main function to render the entire family
function renderFamily(family) {
    const container = document.getElementById('family-members-container');
    // Prepare sections, ensuring parents and spouse are always arrays and checking if they are defined
    const parentsSection = renderSection('Parents', Array.isArray(family.parents) && family.parents.length > 0 ? family.parents : []);
    const spouseSection = renderSection('Spouse', Array.isArray(family.spouses) && family.spouses.length > 0 ? family.spouses : []);
    const siblingsSection = renderSection('Siblings', Array.isArray(family.siblings) && family.siblings.length > 0 ? family.siblings : []);
    const childrenSection = renderSection('Children', Array.isArray(family.children) && family.children.length > 0 ? family.children : []);

    // Combine siblings and children into a grid layout if both sections exist
let gridSection = '';

if (siblingsSection && childrenSection) {
    gridSection = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>${siblingsSection}</div>
            <div>${childrenSection}</div>
        </div>
    `;
} else if (siblingsSection || childrenSection) {
    gridSection = siblingsSection || childrenSection;
}

    // Combine all sections
    container.innerHTML = `
        ${parentsSection}
        ${spouseSection}
        ${gridSection}
    `;
}

    function formatBirthDeathDates(birth_date, death_date) {

  if(birth_date){
    birth_date = birth_date.replace("-00-00", "-01-01")
  }

    if(death_date){
    death_date = death_date.replace("-00-00", "-01-01")
  }    
  // Ensure the birth_date and death_date are valid and in the correct format (YYYY-MM-DD)
  const birthYear = birth_date ? new Date(birth_date).getFullYear() : 'Unknown';
  const deathYear = death_date ? new Date(death_date).getFullYear() : 'Unknown';

  // Return the formatted string
  return `${birthYear} - ${deathYear}`;
}

    // Function to populate tribute details
    async function populateTribute() {
      const urlParams = new URLSearchParams(window.location.search);
      const tributeId = urlParams.has('id') ? urlParams.get('id') : null;
      const tribute = await tributeData(tributeId);

      const currentPageName = document.querySelector('.current-page-name');
      
      if (!tribute) {
        document.getElementById('tribute-name').textContent = "Tribute Not Found";
        document.getElementById('tribute-dates').textContent = "";
        document.getElementById('tribute-header-name').textContent = "Tribute Not Found";
        document.getElementById('tribute-image').src = "./../assets/images/placeholder.png";
        document.getElementById('tribute-image').alt = "No photo available";
        document.getElementById('tribute-bio').innerHTML = "<strong>Bio:</strong> Sorry, we couldn’t find this tribute.";
        document.getElementById('grandchildren-list').innerHTML = "";
        currentPageName.innerText = "Tribute Not Found";
        return;
      }

      // Basic Info
      const formattedDates = formatBirthDeathDates(tribute.birth_date, tribute.death_date)
      document.getElementById('tribute-name').textContent = tribute.name;
      currentPageName.innerText = tribute.name;
      document.title = `${tribute.name} (${formattedDates.replaceAll(" ", "")}) | Crediton Cemetery Heritage Portal`;
      document.getElementById('tribute-dates').textContent = formattedDates;
      document.getElementById('tribute-header-name').textContent = tribute.name;
      document.getElementById('tribute-image').src = (tribute.image_url && tribute.image_url !== "") ? tribute.image_url : './../assets/images/placeholder.png';
      document.getElementById('tribute-image').setAttribute('data-fullsize', tribute.image_url); // temp
      document.getElementById('tribute-image').alt = `Photo of ${tribute.name}`;
      document.getElementById('tribute-birth').textContent = (tribute.birth_date && tribute.birth_date !== "") ? tribute.birth_date : "Unknown";
      document.getElementById('tribute-death').textContent = (tribute.death_date && tribute.death_date !== "") ? tribute.death_date : "Unknown";
      document.getElementById('tribute-age').textContent = formatDate(tribute.birth_date,tribute.death_date);
      document.getElementById('tribute-cemetery').textContent = tribute.cemetery;
      document.getElementById('tribute-location').textContent = tribute.location;
      document.getElementById('tribute-bio').innerHTML = `<strong>Bio:</strong> ${tribute.bio ? tribute.bio : 'Bio not available'}`;


     const tabs = {location:document.querySelector("#location-content"),
                   familyTree:document.querySelector("#family-tree-content"),
                   photos:document.querySelector("#photos-content")
                  }


const hasTreeData = 
  (tribute.parents && tribute.parents.length > 0) ||
  (tribute.spouses && tribute.spouses.length > 0) ||
  (tribute.children && tribute.children.length > 0) ||
  (tribute.grandchildren && tribute.grandchildren.length > 0);

  

     if(hasTreeData){
     tabs.familyTree.innerHTML = `<svg id="markmap" class="w-full h-64"></svg>`;
     renderMarkmap(tribute.parents, tribute?.spouses, tribute?.children, tribute?.grandchildren, tribute?.siblings, tribute);  
     }
      // Share Links
      const currentUrl = window.location.href;
      document.getElementById('facebook-share').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      document.getElementById('twitter-share').href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(tribute.name)}`;
      document.getElementById('linkedin-share').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;

      // Gene Link 
      populateGenealogyLink(tribute.name, 'm');
      populateFamilyMemorialLink(tribute.name.split(' ').pop());
      // Populate Family Tree HTML View
      renderFamily(tribute);
      
let map;
      
function initializeMap(coordinates, locationName) {
                const mapContainer = document.getElementById('map');
                if (!mapContainer){
                  return;
                }
                
                map = L.map('map').setView(coordinates, 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                L.marker(coordinates)
                    .addTo(map)
                    .bindPopup(locationName)

            }
      if(tribute.gps){
       document.getElementById('location-content').innerHTML = `<div id="map" class="w-full h-64 rounded-lg"></div>`;
       initializeMap([tribute.gps.latitude, tribute.gps.longitude], tribute.name);
      }
      // Resources
      const resourcesList = document.getElementById('resources-list');
      tribute.resources = [{url:tribute.memorial_url, title:"Find A Grave Tribute"}]; 

        
      const exhibits = await getExhibits(tribute.id)

       if (exhibits) {
  tribute.resources.push(
    ...exhibits.map(ex => ({
      url: `./../exhibits/${ex.title}`,
      title: "Referenced in Exhibit"
    }))
  );
}
      resourcesList.innerHTML = '';
      if (tribute.resources && tribute.resources.length > 0) {
        tribute.resources.forEach(resource => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${resource.url}" class="text-blue-500 hover:underline" target="_blank">${resource.title}</a>`;
          resourcesList.appendChild(li);
        });
      } else {
        resourcesList.innerHTML = '<li>No resources available</li>';
      }
    }

    // Tab Functionality
    function setupTabs() {
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.add('hidden'));

          button.classList.add('active');
          const targetId = button.getAttribute('data-tabs-target');
          if(targetId === "#location-content"){
            window.dispatchEvent(new Event('resize')); // needs for weirdness in leaflet
          }
          document.querySelector(targetId).classList.remove('hidden');
        });
      });
    }

    // Initialize on Page Load
    document.addEventListener('DOMContentLoaded', async () => {
      await populateTribute();
      setupTabs();
      initLightBox();
    });

    // Mobile Menu Toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      mobileMenu.classList.toggle('hidden');
    });
