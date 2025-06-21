---
layout: none
---
{% assign base_url = site.baseurl | default: "" %}

class PersonInfo extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        const id = this.getAttribute('id');
        this.innerHTML = this.renderLoadingState();
        this.fetchData(id);
      }

      async fetchData(id) {
        try {
          const response = await fetch(`{{base_url}}/assets/people/${id}.json`);  // Replace with your actual API URL
          if (!response.ok) throw new Error('Not found');
          
          const data = await response.json();
          this.renderPersonData(data);
        } catch (error) {
          this.renderError();
        }
      }

      renderLoadingState() {
        return `
          <div class="flex items-center justify-center">
            <div class="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        `;
      }

      renderPersonData(data) {
        const { name, birth_date, death_date, image_url, id } = data;
        const formattedBirthDate = birth_date ? birth_date.split('-')[0] : 'Unknown';
        const formattedDeathDate = death_date ? death_date.split('-')[0] : 'Unknown';
        const imageSrc = image_url || 'https://via.placeholder.com/150';

        this.innerHTML = `
          <a style="text-decoration: none; color: inherit; cursor: pointer;" href="{{base_url}}/tribute/?id=${id}">
          <div class="flex items-start gap-4 mb-2">
            <img src="${imageSrc}" alt="${name}" class="w-24 h-32 object-cover rounded-md border border-gray-700">
            <div>
              <p class="text-base md:text-lg text-white font-medium">${name}</p>
              <p class="text-sm md:text-base text-gray-400">${formattedBirthDate} - ${formattedDeathDate}</p>
            </div>
          </div>
          </a>
        `;
      }

      renderError() {
        this.innerHTML = `
          <div class="flex items-center justify-center p-4 bg-red-100 text-red-500 rounded-md">
            <p>Person not found</p>
          </div>
        `;
      }
    }

    customElements.define('person-info', PersonInfo);
