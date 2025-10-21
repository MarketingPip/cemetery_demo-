   
  import L from "https://esm.sh/leaflet";
  import "https://esm.sh/leaflet.markercluster";  
  import { Datepicker } from "https://esm.sh/vanillajs-datepicker";
    
 import  { autocomp } from "https://esm.sh/@knadh/autocomp";  
	  
function getNames(data, getFirst = false) {
  const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

  return new Set(
    data.map(entry => {
      if (!entry.name) return null;

      const parts = entry.name.trim().split(/\s+/);

      if (getFirst) {
        // Find first actual name (skip initials like "H.")
        for (let i = 0; i < parts.length; i++) {
          const cleaned = parts[i].replace(/\./g, '');
          if (cleaned.length > 1) return cleaned;
        }
        return null;
      } else {
        // Get last non-suffix part
        for (let i = parts.length - 1; i >= 0; i--) {
          const word = parts[i].replace(/\./g, '').toLowerCase();
          if (!suffixes.has(word)) {
            return parts[i].replace(/[^a-zA-Z'-]/g, '');
          }
        }
        return null;
      }
    }).filter(Boolean)
  );
}
    
const stephen_township =  {"type":"FeatureCollection","features":[{"type":"Feature","id":"relation/11187008","properties":{"type":"relation","id":11187008,"tags":{"boundary":"traditional","designation":"geographic_township","name":"Stephen","type":"boundary"},"relations":[],"meta":{},"name":"Stephen"},"geometry":{"type":"Polygon","coordinates":[[[-81.468891,43.2889253],[-81.4700823,43.2947554],[-81.4708574,43.2987264],[-81.4724662,43.306969],[-81.4726102,43.3075765],[-81.4762016,43.3253727],[-81.4782523,43.3356143],[-81.47827,43.3357034],[-81.4783498,43.336105],[-81.4783923,43.3363136],[-81.4784573,43.336638],[-81.4784627,43.3366654],[-81.4785155,43.3369287],[-81.4785927,43.3373143],[-81.4786639,43.3376701],[-81.4787009,43.3378548],[-81.4787717,43.3382081],[-81.4788264,43.3384812],[-81.4788861,43.3387796],[-81.4789107,43.3389025],[-81.4790516,43.339606],[-81.4791206,43.3399532],[-81.4793349,43.3410322],[-81.4794627,43.3416753],[-81.4794877,43.3418029],[-81.4795912,43.3423321],[-81.4796674,43.3427034],[-81.4798277,43.3435709],[-81.479927,43.3440257],[-81.4800022,43.3443924],[-81.480028,43.3445274],[-81.4801071,43.3449175],[-81.4803233,43.3459502],[-81.4803744,43.3462188],[-81.4805551,43.3471429],[-81.4805802,43.3472714],[-81.4805987,43.3473635],[-81.4807039,43.3478873],[-81.4809398,43.3490618],[-81.4810422,43.3495386],[-81.4811385,43.3500335],[-81.4812112,43.3504075],[-81.4812995,43.3508612],[-81.481329,43.3510049],[-81.481343,43.3510729],[-81.4813774,43.3512397],[-81.4816737,43.3526759],[-81.4819154,43.3538481],[-81.4820238,43.3543969],[-81.4822835,43.3556588],[-81.482367,43.3560647],[-81.4823986,43.3561918],[-81.4824781,43.3566219],[-81.4825827,43.3571561],[-81.4825978,43.3572307],[-81.4826031,43.357257],[-81.4826708,43.3575913],[-81.4826873,43.3576728],[-81.4827517,43.3579769],[-81.4827823,43.3581213],[-81.4827881,43.3581489],[-81.4828392,43.3583923],[-81.4829271,43.3588104],[-81.4830346,43.3593244],[-81.4831349,43.3598039],[-81.4832051,43.3601391],[-81.483284,43.3605159],[-81.4833204,43.36069],[-81.4833786,43.3609678],[-81.4834242,43.3611853],[-81.4834946,43.3615217],[-81.4835406,43.3617634],[-81.4840855,43.3616986],[-81.4846606,43.3616356],[-81.485099,43.3615875],[-81.4866279,43.361419],[-81.491656,43.3608395],[-81.4920706,43.3607989],[-81.4924035,43.3607635],[-81.4934994,43.3606472],[-81.4940549,43.3605882],[-81.4959725,43.3603845],[-81.4960436,43.3603766],[-81.4960439,43.3603776],[-81.5088658,43.3589933],[-81.5174448,43.3580856],[-81.533767,43.3563862],[-81.5529289,43.3543569],[-81.561919,43.3534267],[-81.5625961,43.3533345],[-81.5637687,43.3532329],[-81.5657172,43.3530309],[-81.5741301,43.3521766],[-81.584624,43.3511129],[-81.5939059,43.3501624],[-81.6073474,43.3487949],[-81.6098692,43.3485376],[-81.6108557,43.3484369],[-81.6125547,43.3482638],[-81.6187502,43.3476328],[-81.6274076,43.3467508],[-81.6327708,43.3462025],[-81.6602402,43.3433507],[-81.6792057,43.3413029],[-81.6980655,43.3393225],[-81.7168858,43.3373785],[-81.7378366,43.3352227],[-81.7411725,43.3366613],[-81.7417483,43.335982],[-81.7423521,43.3353963],[-81.7425654,43.3351712],[-81.7443389,43.3335595],[-81.7445821,43.3334571],[-81.7447221,43.3333512],[-81.7449694,43.3330903],[-81.7451261,43.3327574],[-81.7454442,43.3324272],[-81.7455923,43.3322976],[-81.7457343,43.3321043],[-81.7461576,43.3317033],[-81.7464588,43.3314269],[-81.7466485,43.3311962],[-81.746871,43.3309794],[-81.7469899,43.3309081],[-81.7474851,43.3304285],[-81.7478568,43.330163],[-81.7481611,43.3298333],[-81.7484783,43.3295863],[-81.7485694,43.3294838],[-81.7486445,43.3293519],[-81.7488645,43.3291437],[-81.7489755,43.3289725],[-81.7490492,43.3289301],[-81.749535,43.3284401],[-81.749677,43.3282468],[-81.749915,43.3280768],[-81.7501881,43.3277966],[-81.7510888,43.3271685],[-81.7514714,43.3268212],[-81.7517959,43.3263797],[-81.7528013,43.325644],[-81.7532759,43.3251075],[-81.7546715,43.323852],[-81.7555286,43.3232147],[-81.7560483,43.3225545],[-81.7564338,43.3222524],[-81.7569839,43.3217484],[-81.7575441,43.3212983],[-81.7585105,43.3204041],[-81.7598172,43.3193103],[-81.7605368,43.3187902],[-81.7611055,43.3183515],[-81.7615495,43.318093],[-81.7619358,43.3176167],[-81.7625893,43.3170743],[-81.7636405,43.3163669],[-81.7643234,43.3159163],[-81.7654843,43.3151717],[-81.7668119,43.3142986],[-81.767162,43.3140662],[-81.7673808,43.3138197],[-81.7680541,43.3138781],[-81.768071,43.3137957],[-81.7665743,43.3136629],[-81.7664904,43.3136506],[-81.766626,43.313536],[-81.765271,43.3133836],[-81.7641941,43.3132216],[-81.7634541,43.3130728],[-81.7625396,43.3127226],[-81.7618055,43.3124818],[-81.7611738,43.3121841],[-81.7607346,43.3121622],[-81.7602533,43.3121841],[-81.7596216,43.3122235],[-81.7590019,43.3122673],[-81.7584544,43.312311],[-81.757949,43.3122848],[-81.7576241,43.3122147],[-81.7571909,43.3120746],[-81.7568901,43.3117813],[-81.7568058,43.3115887],[-81.7568119,43.3113436],[-81.7568841,43.3110765],[-81.7570044,43.3107219],[-81.7572751,43.3102316],[-81.7574677,43.3098595],[-81.7574255,43.3095442],[-81.757227,43.3092816],[-81.7569201,43.3089839],[-81.7564148,43.3087124],[-81.7559334,43.308406],[-81.7556025,43.3081608],[-81.755404,43.3078412],[-81.7552897,43.3074647],[-81.7553017,43.3071407],[-81.7554702,43.3067467],[-81.7557409,43.3066372],[-81.7560899,43.306646],[-81.756487,43.3067248],[-81.757221,43.3069349],[-81.7578347,43.3070575],[-81.7583521,43.3070488],[-81.7586709,43.3070137],[-81.7589718,43.3069174],[-81.7595072,43.3066503],[-81.7599043,43.3063526],[-81.7602052,43.3060462],[-81.7606985,43.3054682],[-81.7609151,43.3049209],[-81.7609873,43.3046801],[-81.7610053,43.3043036],[-81.7609151,43.3040322],[-81.7606383,43.3036293],[-81.7602774,43.3032178],[-81.7599765,43.302815],[-81.7599886,43.302526],[-81.7603074,43.302237],[-81.7610535,43.301948],[-81.7617333,43.3016371],[-81.7621304,43.3014051],[-81.762329,43.3011336],[-81.7624072,43.3008008],[-81.7623455,43.3003589],[-81.7620504,43.2999225],[-81.7616315,43.2993336],[-81.7614221,43.2989179],[-81.7614316,43.2985784],[-81.7614887,43.2983012],[-81.761641,43.2980449],[-81.7620789,43.297747],[-81.7625835,43.2974421],[-81.7629167,43.2971927],[-81.7630785,43.296971],[-81.7631832,43.2967423],[-81.7632403,43.2963127],[-81.7632118,43.2960009],[-81.7630309,43.2955575],[-81.762812,43.2950032],[-81.7626977,43.2944766],[-81.7625389,43.2936579],[-81.7624007,43.2926399],[-81.7622706,43.2915451],[-81.7621974,43.2904383],[-81.7622287,43.2894245],[-81.7622246,43.2891167],[-81.7621636,43.2887971],[-81.7620051,43.2885012],[-81.7618059,43.2882645],[-81.761631,43.2880721],[-81.7613465,43.2877466],[-81.7612082,43.2875927],[-81.7611391,43.2872997],[-81.7611351,43.286986],[-81.7612448,43.28677],[-81.7614196,43.2864533],[-81.7616189,43.2862432],[-81.7619034,43.2859414],[-81.7623832,43.2855655],[-81.7626718,43.2853761],[-81.7628588,43.2851275],[-81.7632084,43.2848789],[-81.7634808,43.2846185],[-81.7636109,43.2843729],[-81.7637004,43.2841538],[-81.7637207,43.283926],[-81.7637898,43.2834258],[-81.7638061,43.283044],[-81.7637614,43.2828102],[-81.763676,43.2825942],[-81.7635662,43.2824196],[-81.7633345,43.2821917],[-81.7629157,43.2819105],[-81.7626474,43.281653],[-81.7625011,43.2814784],[-81.7624319,43.2813038],[-81.7623628,43.2810552],[-81.7623994,43.2807118],[-81.7625011,43.2804218],[-81.7626515,43.280114],[-81.7627978,43.2797943],[-81.7628385,43.2795516],[-81.7628263,43.2793681],[-81.7627694,43.2791669],[-81.762684,43.2789922],[-81.7625051,43.2787732],[-81.7623344,43.278572],[-81.7620742,43.2782789],[-81.7617611,43.2780214],[-81.7614034,43.2777639],[-81.7609887,43.2773644],[-81.7604439,43.2768849],[-81.7603016,43.2766866],[-81.7601919,43.2765149],[-81.7602,43.2762929],[-81.7602285,43.2760709],[-81.7603098,43.2759199],[-81.7605334,43.2758045],[-81.7606513,43.2757719],[-81.7613993,43.2757779],[-81.761753,43.2757867],[-81.7618831,43.2757453],[-81.7620823,43.2756595],[-81.7621921,43.2755233],[-81.7622775,43.2753339],[-81.7623059,43.2751356],[-81.76231,43.2749372],[-81.7623547,43.2747212],[-81.7624645,43.2745495],[-81.7627779,43.2742334],[-81.7631318,43.2740067],[-81.763691,43.2738108],[-81.7644626,43.2737078],[-81.7652695,43.2735635],[-81.7657084,43.2733934],[-81.7661189,43.2730893],[-81.7667418,43.2727234],[-81.7670745,43.2726409],[-81.7676549,43.2725585],[-81.768115,43.2724451],[-81.7686247,43.2721101],[-81.7687238,43.2717802],[-81.7688229,43.2713628],[-81.7686105,43.2711618],[-81.7683698,43.2709659],[-81.7682707,43.2707855],[-81.7683557,43.2705175],[-81.7687379,43.2702598],[-81.7692263,43.2700485],[-81.7696227,43.2697857],[-81.7698988,43.2694816],[-81.7699554,43.269162],[-81.76992,43.2687755],[-81.7696086,43.2682291],[-81.7694741,43.2678168],[-81.769559,43.2676622],[-81.7695307,43.2673632],[-81.7693962,43.2668581],[-81.7691131,43.2664715],[-81.7686034,43.2661262],[-81.7683203,43.2660231],[-81.7679168,43.2659922],[-81.76757,43.2659458],[-81.767393,43.2657654],[-81.7673293,43.2654304],[-81.7673576,43.2649459],[-81.767485,43.2646366],[-81.7678885,43.2642449],[-81.7684406,43.2638067],[-81.7687308,43.2635335],[-81.7689644,43.2633583],[-81.7692476,43.2631572],[-81.7694741,43.2628222],[-81.7699412,43.2623531],[-81.7704934,43.2621315],[-81.7711517,43.2618737],[-81.7714702,43.2615232],[-81.7716378,43.2611898],[-81.7718416,43.2608851],[-81.7720294,43.2607249],[-81.7722118,43.2604007],[-81.7722762,43.2600921],[-81.7722601,43.2597678],[-81.7721313,43.2594475],[-81.7719543,43.2591076],[-81.7716914,43.2586896],[-81.7714393,43.2583887],[-81.7711604,43.2581778],[-81.770522,43.2578652],[-81.7701948,43.2576972],[-81.7698193,43.2573066],[-81.7693794,43.2569315],[-81.7692292,43.2566776],[-81.7692667,43.2563885],[-81.7695403,43.256154],[-81.770125,43.2560251],[-81.7706507,43.2559509],[-81.7715627,43.255654],[-81.7718148,43.2553922],[-81.7720562,43.2551304],[-81.7723727,43.2546889],[-81.7728931,43.2541029],[-81.7733973,43.2537083],[-81.7741913,43.2530636],[-81.7746794,43.252544],[-81.7750818,43.2519696],[-81.7753446,43.2514148],[-81.775806,43.2508404],[-81.7762351,43.2503716],[-81.7767447,43.2499144],[-81.7769915,43.2496565],[-81.7771524,43.2492893],[-81.7772919,43.2487657],[-81.777367,43.2480545],[-81.7773616,43.2475466],[-81.7773724,43.2470151],[-81.7772383,43.2465345],[-81.7770344,43.2461438],[-81.7767555,43.2457061],[-81.7763639,43.2452958],[-81.7761922,43.2450575],[-81.77616,43.2447409],[-81.7761493,43.2443893],[-81.7762458,43.2439242],[-81.7763692,43.2433772],[-81.7763585,43.2428301],[-81.7759615,43.2412357],[-81.7758006,43.2406183],[-81.7755967,43.2401571],[-81.7752212,43.2397624],[-81.7746633,43.2392622],[-81.7741966,43.2388753],[-81.7739284,43.2384962],[-81.7737728,43.2380273],[-81.7736441,43.23723],[-81.7736548,43.2365014],[-81.7698803,43.2369135],[-81.7649363,43.237469],[-81.7647429,43.2374907],[-81.760638,43.2379701],[-81.755014,43.2386269],[-81.7413721,43.2401251],[-81.7368644,43.2405851],[-81.71843,43.2427327],[-81.7163388,43.2429763],[-81.7128631,43.2433833],[-81.7099865,43.2437135],[-81.7090546,43.2438046],[-81.7059439,43.2441683],[-81.7058627,43.2441778],[-81.7012654,43.2447132],[-81.6959433,43.2453429],[-81.6932539,43.2456604],[-81.6913145,43.2458784],[-81.6897293,43.2460576],[-81.6663117,43.2487048],[-81.658692,43.2495529],[-81.6405759,43.2515692],[-81.6186441,43.2538807],[-81.618169,43.2539299],[-81.6155283,43.2542035],[-81.6129126,43.254488],[-81.612759,43.2545048],[-81.612298,43.2545549],[-81.6117948,43.2546086],[-81.6114518,43.2546458],[-81.6108193,43.2547146],[-81.607301,43.2550969],[-81.6068402,43.2551479],[-81.6053183,43.2553135],[-81.5944911,43.2564921],[-81.5941588,43.2565299],[-81.5904979,43.256911],[-81.5898564,43.2569544],[-81.5654697,43.2596716],[-81.5403356,43.2624427],[-81.5281199,43.2637798],[-81.5275289,43.2638438],[-81.5152851,43.2651876],[-81.4903962,43.2679342],[-81.4854869,43.2684708],[-81.4841699,43.2686115],[-81.4721465,43.2699193],[-81.4713598,43.2700049],[-81.4694261,43.2702284],[-81.4654832,43.2706507],[-81.465305,43.2706704],[-81.466056,43.2744639],[-81.4670218,43.2793417],[-81.4676387,43.2824574],[-81.4680179,43.2843725],[-81.468891,43.2889253]]]}}]}
   
    
// Lazy load datepicker only when needed
async function loadDatePicker() {
  const { Datepicker } = await import("https://esm.sh/vanillajs-datepicker");
  const datepicker = new Datepicker(document.getElementById("year-from"), { pickLevel: 2, format: "yyyy" });
  const datepicker2 = new Datepicker(document.getElementById("year-to"), { pickLevel: 2, format: "yyyy" });
}

async function loadAutoComplete(lastNames, firstNames) {
  const { autocomp } = await import("https://esm.sh/@knadh/autocomp");

  const createAutoComplete = (selector, names) => {
    autocomp(document.querySelector(selector), {
      onQuery: async (query) =>
        [...names].filter(name =>
          name.toLowerCase().startsWith(query.toLowerCase())
        ).slice(0, 10),

      onSelect: (val) => val,

      onRender: (name) => {
        const el = document.createElement("span");
        el.textContent = name;
        return el;
      }
    });
  };

  createAutoComplete("#surname", lastNames);
  createAutoComplete("#given-name", firstNames);
}

 


    
   // Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
} 

       async function getCemeteryData() {
    try {
        const response = await fetch('assets/cemetery_data.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.json();
        return csvText;
    } catch (error) {
        console.error('Error fetching cemetery data:', error);
        return [];
    }
}
    

    // Cemetery records data (CSV format)
    let csvData;



    
      
    // App state
    let records = [];
    let filteredRecords = [];
    let currentPage = 1;
    const recordsPerPage = 5;
    let sortColumn = 'name';
    let sortDirection = 'asc';

    // DOM elements
    const searchForm = document.getElementById('search-form');
    const resultsBody = document.getElementById('results-body');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalRecords = document.getElementById('total-records');
    const tableSortHeaders = document.querySelectorAll('th[data-sort]');

    // Initialize the application
    function init() {
    //  parseData();
      setupEventListeners();
      renderRecords();
    }

    // Parse CSV data using PapaParse
 /*   function parseData() {
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

    */

    // Setup event listeners for sorting, pagination, and search
    function setupEventListeners() {
      // Sort table columns
      tableSortHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
          const column = e.currentTarget.dataset.sort; // Use currentTarget to reliably get the header element
          if (column) {
            // Toggle sort direction if clicking the same column
            if (sortColumn === column) {
              sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
              sortColumn = column;
              sortDirection = 'asc';
            }
            currentPage = 1; // Reset page on sort change
            renderRecords();
            updateSortIcons();
          }
        });
      });

      // Pagination buttons
      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          updateTable();
          updatePagination();
        }
      }); 

      nextPageBtn.addEventListener('click', () => {
        const pageCount = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage < pageCount) {
          currentPage++;
          updateTable();
          updatePagination();
        }
      });

      // Search form
      // Apply debounce to filters and pagination
      const debouncedRender = debounce(renderRecords, 300);
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1; // Reset page on new search
        debouncedRender();
      });
    }


    
    // Render records: filter, sort, and update table/pagination
    function renderRecords() {
      const surname = document.getElementById('surname').value.trim().toLowerCase();
      const givenName = document.getElementById('given-name').value.trim().toLowerCase();
      const yearFrom = parseInt(document.getElementById('year-from').value);
      const yearTo = parseInt(document.getElementById('year-to').value);

      // Filter the records based on search criteria
      filteredRecords = records.filter(record => {
        const nameLower = record.name ? record.name.toLowerCase() : '';
        const matchesSurname = !surname || nameLower.includes(surname);
        const matchesGivenName = !givenName || nameLower.includes(givenName);
        let matchesYearRange = true;
        if (yearFrom) {
          const birthYear = record.birth_date ? new Date(record.birth_date).getFullYear() : NaN;
          matchesYearRange = matchesYearRange && birthYear >= yearFrom;
        }
        if (yearTo) {
          const deathYear = record.death_date ? new Date(record.death_date).getFullYear() : NaN;
          matchesYearRange = matchesYearRange && deathYear <= yearTo;
        }
        return matchesSurname && matchesGivenName && matchesYearRange;
      });

      // Sort filtered records
      filteredRecords.sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';

        // For date columns, compare timestamps
        if (sortColumn === 'birth_date' || sortColumn === 'death_date') {
          valA = new Date(valA).getTime() || 0;
          valB = new Date(valB).getTime() || 0;
        } else {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      updateTable();
      updatePagination();
    }

    // Update the results table with paginated records
    function updateTable() {
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  resultsBody.innerHTML = '';

  if (paginatedRecords.length === 0) {

    !document.querySelector('#pagination').classList.contains('hidden') && document.querySelector('#pagination').classList.add('hidden');
    resultsBody.innerHTML = `<tr>
  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
    <div class="mb-4 text-xl font-semibold">No results found</div>
    <p class="mb-6 text-lg text-gray-600">We couldn’t find any cemetery records matching your search criteria. Please consider the following tips to refine your search:</p>
    
    <ul class="list-disc pl-6 mb-4 text-left text-gray-500">
      <li>Try different spellings or abbreviations of names.</li>
      <li>Use variations for German names (e.g., 'Schmidt' vs. 'Schmitt').</li>
      <li>Search for both singular and plural forms (e.g., 'Smith' and 'Smythe').</li>
      <li>Consider phonetic variations (e.g., 'Fischer' vs. 'Fisher').</li>
      <li>Try initials or nicknames if available (e.g., 'J. Smith' or 'Johnny').</li>
    </ul>

    <div class="mb-4 text-gray-600">
      <p class="mb-2">You are currently viewing the results of your search. If you are still unable to find the record, please try broadening your search or using our tips above.</p>
      
    </div>
  </td>
</tr>`;
   
    return;
  }

 if (paginatedRecords.length != 0) {
   document.querySelector('#pagination').classList.contains('hidden') && document.querySelector('#pagination').classList.remove('hidden');
  }
	    

  requestAnimationFrame(() => {
    const fragment = document.createDocumentFragment();

    paginatedRecords.forEach(record => {
//           <a href="https://www.findagrave.com/memorial/${record.memorial_url}" target="_blank">FindAGrave</a>
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4">${record.name || 'N/A'}</td>
        <td class="px-6 py-4">${record.birth_date || 'N/A'}</td>
        <td class="px-6 py-4">${record.death_date || 'N/A'}</td>
        <td class="px-6 py-4">${record.location || 'N/A'}</td>
        <td class="px-6 py-4">
          <a href="tribute?id=${record.id}" class="text-blue-600 hover:text-blue-800 mr-3">View Details</a>
        </td>`;
      fragment.appendChild(row);
    });

    resultsBody.appendChild(fragment);
  });

        // Update pagination details
      showingStart.textContent = filteredRecords.length ? startIndex + 1 : 0;
      showingEnd.textContent = Math.min(endIndex, filteredRecords.length);
      totalRecords.textContent = filteredRecords.length;
}  

    // Update pagination controls and page number buttons
    function updatePagination() {
      const pageCount = Math.ceil(filteredRecords.length / recordsPerPage);
      pageNumbers.innerHTML = '';

      // Disable/enable pagination buttons
      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = currentPage === pageCount || pageCount === 0;

      const pageNumberWindowSize = 3;
      let startPage = Math.max(1, currentPage - Math.floor(pageNumberWindowSize / 2));
      let endPage = Math.min(pageCount, startPage + pageNumberWindowSize - 1);

      if (endPage - startPage < pageNumberWindowSize - 1) {
        startPage = Math.max(1, endPage - pageNumberWindowSize + 1);
      }

      // Previous ellipsis
      if (startPage > 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('px-3', 'py-1', 'text-gray-700', 'hidden', 'sm:inline');
        pageNumbers.appendChild(ellipsis);
      }

      // Page number buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('px-3', 'py-1', 'border', 'rounded', 'text-gray-700', 'hover:bg-gray-50');
        if (i === currentPage) {
          pageBtn.classList.add('bg-gray-300');
        }
        pageBtn.addEventListener('click', () => {
          currentPage = i;
          updateTable();
          updatePagination();
        });
        pageNumbers.appendChild(pageBtn);
      }

      // Next ellipsis
      if (endPage < pageCount) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('px-3', 'py-1', 'text-gray-700', 'hidden', 'sm:inline');
        pageNumbers.appendChild(ellipsis);
      }
    }

    // Update sort icons on table headers
    function updateSortIcons() {
      tableSortHeaders.forEach(header => {
        const icon = header.querySelector('i');
        if (header.dataset.sort === sortColumn) {
          icon.className = sortDirection === 'asc' ? 'fas fa-sort-up ml-1' : 'fas fa-sort-down ml-1';
        } else {
          icon.className = 'fas fa-sort ml-1';
        }
      });
    }

const overlay = document.getElementById('nav-overlay');
const menu = document.getElementById('mobile-menu');

function handleOverlayClick() {
  overlay.classList.add('hidden');
  menu.classList.remove('translate-x-0');
  menu.classList.add('translate-x-full');
  overlay.removeEventListener('click', handleOverlayClick);
}

document.getElementById('menu-toggle').addEventListener('click', () => {
  if (menu.classList.contains('translate-x-full')) {
    menu.classList.remove('translate-x-full');
    menu.classList.add('translate-x-0');
    overlay.addEventListener('click', handleOverlayClick);
    overlay.classList.remove('hidden');
  } else {
    menu.classList.remove('translate-x-0');
    menu.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    overlay.removeEventListener('click', handleOverlayClick);
  }
});

window.addEventListener('resize', () => {
  const desktopWidth = 1024;
  const isMenuOpen = !overlay.classList.contains('hidden') && menu.classList.contains('translate-x-0');

  if (window.innerWidth >= desktopWidth && isMenuOpen) {
    overlay.classList.add('hidden');
    menu.classList.remove('translate-x-0');
    menu.classList.add('translate-x-full');
    overlay.removeEventListener('click', handleOverlayClick);
  }
});

// Close menu when clicking any link with #
document.querySelectorAll('#mobile-menu a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('translate-x-full');
  });
});

/* Handle Dropdown Toggle

document.querySelectorAll('[data-dropdown-toggle]').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;
    dropdown.classList.toggle('hidden');
  });
});
*/

    
document.addEventListener("DOMContentLoaded", function () {
 
// GeoJSON configuration

// Stephen Township

function renderStephenGeoData(L, customOptions, map){  
  
function highlightFeatureOnMouseOver(e) {
  e.target.setStyle({
    color: "red",
    fillColor: "#ffffff",
    opacity: 1,
    //fillOpacity: 0,
    weight: 4
  });

  e.target.bringToFront();
  //e.target.openPopup();
}

function resetFeatureStyle(e) {
  //newPolygons.resetStyle(e.target);
  stephen_geo.setStyle({
    color: "#e600ff",
    fillColor: "#fbff00",
    opacity: 1,
    weight: 1
  });
}
const stephen_geo = L.geoJSON(stephen_township, {
  style: {
    color: "#e600ff",
    fillColor: "#fbff00",
    opacity: 1,
    weight: 1
  },
  onEachFeature: function (feature, layer) {
    layer.on({
      // click: zoomToClickedPolygon,
      mouseover: highlightFeatureOnMouseOver,
      mouseout: resetFeatureStyle
    });
    layer.bindPopup(
      L.popup({
        ...customOptions,
        lazyload: `<div class="grid grid-cols-5 gap-4">
    <div class="col-span-3 p-3">
        <div class="space-y-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">Stephen Township</h3>
            <p class="text-gray-700 dark:text-gray-300">
                Stephen Township is a historical township located in the southern part of Huron County, Ontario. It was one of the townships amalgamated to form the municipality of South Huron in 2001. Known for its agricultural landscape and small-town charm, Stephen Township is a part of the rich rural heritage of the region.
            </p>
            <a href="https://digital.library.mcgill.ca/countyatlas/hur-m-stephen.htm" 
               class="flex items-center font-medium text-blue-600 hover:" target="_blank" title="View the Stephen Township Atlas from McGill University">
                Explore Stephen Township Atlas
                <svg class="w-2 h-2 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                </svg>
            </a>
        </div>
    </div>
    <div class="h-full w-full">
        <img class="lazyload w-full h-full object-fill col-span-2 rounded-r-lg min-w-[160px]" 
             alt="Stephen Township" 
             data-src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE0LAVdGCH6DshaCnsRf__FKhA34RhYG2bKA&s">
    </div>
</div>
`
      })
    ); //
  }
}).addTo(map);  

}  
// Cemetery Data (Created Manually)  
const geojsonData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Crediton Cemetery",
        "location": "Crediton, Ontario, Canada",
        "type": "Cemetery",
        "established": "circa 1860",
        "description": "A historic cemetery serving the Crediton community",
        "address": "Near County Road 12, Crediton, ON",
        "status": "Active",
        "contact": {
          "organization": "Crediton Cemetery Board",
          "phone": "519-555-1234",
          "email": "creditoncemetery@example.com"
        },
        "visiting_hours": "Dawn to Dusk"
      },
      "geometry": {
        "coordinates": [
          [-81.55479986184099, 43.300126225136836],
          [-81.55203518800734, 43.30037642774607],
          [-81.55177018041198, 43.2992452952557],
          [-81.55213546115156, 43.29920880676022],
          [-81.55207099984473, 43.29867190208515],
          [-81.55344617439398, 43.2985467974018],
          [-81.55354644753824, 43.298880409318144],
          [-81.55358942174281, 43.29919316882703],
          [-81.5545778284502, 43.29912540440358],
          [-81.55479986184099, 43.30012101257117]
        ],
        "type": "LineString"
      }
    }
  ]
};


  // Lazy load leaflet
async function loadLeaflet() {
  const L = (await import("https://esm.sh/leaflet")).default;
  window.L = L;
  await import("https://esm.sh/leaflet.markercluster");
  renderMap(L);
}

  
function renderMap(pkg){ 

const L = pkg

  
const map = L.map("cemetery-map", {
    preferCanvas: true
}).setView([51.505, -0.09], 13);

      // Base layers
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
	updateWhenIdle: true      
      });
      
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        //maxZoom: 19,
        attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
	updateWhenIdle: true        
      });
      
     
      osmLayer.addTo(map);
      
      // Initialize layer control
      const layerControl = L.control.layers(
        {
          "Street Map": osmLayer,
          "Satellite": satelliteLayer
        },
        {},
        { collapsed: true }
      ).addTo(map);
	


// Create marker cluster group
const markers = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 80
});

// Custom popup options
const customOptions = {
    className: 'popupCustom',
    lazyload: true  // Add lazyload flag
};

// Popup content template
const getPopupContent = (record) => `
    <div class="grid grid-cols-5 gap-4">
        <div class="col-span-3 p-3">
            <div class="space-y-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">${record.name}</h3>
                <p class="text-gray-700 dark:text-gray-300">
                    <b>Location:</b> ${record.location || 'N/A'}<br>
                    <b>Born:</b> ${record.birth_date || 'N/A'}<br>
                    <b>Passed:</b> ${record.death_date || 'N/A'}
                </p>
                <a href="tribute?id=${record.id || '#'}" class="text-blue-600 hover:" target="_blank">View Memorial</a>
            </div>
        </div>
        <div class="h-full w-full">
            <img class="lazyload w-full h-full object-fill col-span-2 rounded-r-lg min-w-[160px]" alt="${record.name}" data-src="${record.image_url || ''}">
        </div>
    </div>`;

// Initial marker
L.marker([43.29868, -81.55274], {
    icon: L.divIcon({
        html: "Crediton Cemetery",
        className: 'text-below-marker'
    })
}).addTo(map);

// Specific Crediton Cemetery marker with lazy-loaded popup
const creditonPopupContent = `
    <div class="grid grid-cols-5 gap-4">
        <div class="col-span-3 p-3">
            <div class="space-y-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">Crediton Cemetery</h3>
                <p class="text-gray-700 dark:text-gray-300">
                    The Crediton Cemetery, located at <b>40 Victoria Avenue West, Crediton, Ontario, N0M 1M0</b>,<br>
                    is a peaceful resting place that serves as a memorial to the community's history.
                </p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=40%20Victoria%20Ave%20W,%20Crediton,%20ON%20N0M%201M0" 
                   class="flex items-center font-medium text-blue-600 hover:" target="_blank">
                    Get Directions
                    <svg class="w-2 h-2 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                </a>
            </div>
        </div>
        <div class="h-full w-full">
            <img class="lazyload w-full h-full object-fill col-span-2 rounded-r-lg min-w-[160px]" 
                 alt="Crediton Cemetery" 
                 data-src="https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=RoZKv6Zz4zxYvZGyh_IWkQ&cb_client=search.gws-prod.gps&w=408&h=240&yaw=347.2649&pitch=0&thumbfov=100">
        </div>
    </div>`;

// Add initial marker with lazy-loaded popup
L.marker([43.29868, -81.55274])
    .bindPopup(L.popup({
        ...customOptions,
        lazyload: creditonPopupContent
    }))
    .addTo(map);

// Process cemetery data
const cemeteryData = records.filter(record => record.gps);
  
let _debounceTimeout = null; // Declare a variable to hold the timeout reference
let _debounceCancel = false; // Flag to track debounce state

function smoothLeafletDebounce() {
  // If there's an existing timeout, cancel it to prevent multiple timeouts from running
  if (_debounceTimeout) {
    clearTimeout(_debounceTimeout);
  }

  // Cancel debounce temporarily
  _debounceCancel = true;

  // Set a new timeout and store its reference in _debounceTimeout
  _debounceTimeout = setTimeout(() => {
    _debounceCancel = false;
    _debounceTimeout = null; // Reset the timeout reference after it completes
  }, 5000);
}

  
markers.on('click', function (a) {
//   smoothLeafletDebounce()
});

markers.on('clusterclick', function (a) {
   // smoothLeafletDebounce()
});
  
// Popup open handler for lazy loading
map.on('popupopen', function (e) {
 //  _debounceCancel = true;
  // smoothLeafletDebounce()	
  const popup = e.popup;

  // Check if lazyload option is set and content is not yet loaded
  if (popup.options.lazyload && !popup.getContent()) {
    popup.setContent(popup.options.lazyload);
  }
});

map.on('popupclose', function (e) {
  _debounceCancel = false;
});  


// Update markers function
function updateMarkers() {
 /*   if( _debounceCancel){
      return;
    };*/ 
    const bounds = map.getBounds();
    markers.clearLayers();

    cemeteryData.forEach(record => {
        let { latitude, longitude } = record.gps;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if (latitude && longitude) {
            const marker = L.marker([latitude, longitude])
                .bindPopup(L.popup({
                    ...customOptions,
                    lazyload: getPopupContent(record)
                }));
            markers.addLayer(marker);
        }
    });
}



// Add debounced event listeners
//const debouncedUpdate = debounce(updateMarkers, 250);
//map.on('moveend', updateMarkers);

// Initial setup
map.addLayer(markers);
map.setView([43.29868, -81.55274], 13);
updateMarkers();

 
renderStephenGeoData(L, customOptions, map);
  
L.geoJSON(geojsonData, {
    style: {
        color: "#ff0000",
        weight: 3,
        opacity: 0.8
    }
}).addTo(map);

  // Event listeners for zoom buttons
  document.getElementById("zoom-in").addEventListener("click", () => map.zoomIn());
  document.getElementById("zoom-out").addEventListener("click", () => map.zoomOut());
  document.getElementById("reset-view").addEventListener("click", () => map.setView([43.29868, -81.55274], 13));

   
  document.querySelector("#map-container").classList.add("hidden")
  document.querySelector("#cemetery-map").classList.remove("hidden")
  window.dispatchEvent(new Event('resize')); // needs for weirdness in leaflet
}
  
 




// Select the button
const backToTopBtn = document.getElementById("backToTopBtn");

// Show/hide the button when scrolling
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("hidden");
    backToTopBtn.classList.add("opacity-100");
  } else {
    backToTopBtn.classList.add("hidden");
    backToTopBtn.classList.remove("opacity-100");
  }
});

// Smooth scroll to top when clicked
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

  
  
  // page loader
 
function fadeOutAndHide(elementId, hide = true) {
    const element = document.querySelector(elementId);

    if (element) {
        // Apply Tailwind fade-out classes
        element.classList.add('opacity-0', 'transition-opacity', 'duration-500');

        // Listen for the end of the transition
        const onTransitionEnd = () => {
            if (hide) {
                // Hide the element after the transition ends
                element.classList.add('hidden');
            }
            // Remove the event listener after the transition ends
            element.removeEventListener('transitionend', onTransitionEnd);
        };

        // Add the event listener for the transitionend event
        element.addEventListener('transitionend', onTransitionEnd);
    }
}


  function enableAllResources() {
  document.querySelectorAll('link[disabled], script[disabled]').forEach(el => {
    el.removeAttribute('disabled');
  });
}
   


function checkAndSetNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');

  if (name) {
    const surnameInput = document.getElementById('surname');
    const searchForm = document.getElementById('search-form');  // Assuming your form has id="searchForm"

    if (surnameInput) {
      surnameInput.value = name;

      // Scroll input into view smoothly
      surnameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Trigger form submit
      if (searchForm) {
        searchForm.requestSubmit();
      }
    }
  }
}

  
   // Initialize the app

     // Example Usage
getCemeteryData().then(data => {
    records = data; // Array of objects with CSV headers as keys
    init();
    fadeOutAndHide('#preload');
    enableAllResources(); // enable all disabled CSS and scripts for leaflet. 
    loadDatePicker();
    loadLeaflet();
    checkAndSetNameFromURL();
    loadAutoComplete(getNames(records), getNames(records, true)); 
    //renderMap()
});



//   const heroSection = document.querySelector("#home");
  // heroSection.classList.remove("hero-image-loading");
  // heroSection.classList.add("hero-image");
  
});

