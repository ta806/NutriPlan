import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.min.js';
import Search from './classes/search.js';
import Filter from './classes/filter.js';
import Categories from './classes/categories.js';
import GetById from './classes/getById.js';
import Analyze from './classes/analyze.js';
import Product from './classes/product.js';
import Barcode from './classes/barcode.js';
import ProductCategories from './classes/productCategories.js';

if (!document.querySelector('link[href*="sweetalert2"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';
  document.head.appendChild(link);
}

// Loading Overlay
const appLoadingOverlay = document.getElementById('app-loading-overlay');

// Header
const headerMenuBtn = document.getElementById('header-menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// Main Sections
const searchFiltersSection = document.getElementById('search-filters-section');
const mealCategoriesSection = document.getElementById(
  'meal-categories-section'
);
const allRecipesSection = document.getElementById('all-recipes-section');
const mealDetailsSection = document.getElementById('meal-details');

// Product Scanner Section
const productsSection = document.getElementById('products-section');
const productsGrid = document.getElementById('products-grid');
const productSearchInput = document.getElementById('product-search-input');
const searchProductBtn = document.getElementById('search-product-btn');
const nutriScoreFilters = document.getElementById('nutri-score-filters');
const productsCount = document.getElementById('products-count');
const productCategories = document.getElementById('product-categories');
const modal = document.getElementById('product-detail-modal');
const barcodeInput = document.getElementById('barcode-input');
const lookupBarcodeBtn = document.getElementById('lookup-barcode-btn');

// Food Log Section
const foodLogSection = document.getElementById('foodlog-section');
const recipesCount = document.getElementById('recipes-count');

// Buttons
const mealsRecipesBtn = document.getElementById('meals-recipes-btn');
const productScannerBtn = document.getElementById('product-scanner-btn');
const foodLogBtn = document.getElementById('food-log-btn');

// meals Container
const recipesGrid = document.getElementById('recipes-grid');

// Search Input
const searchInput = document.getElementById('search-input');

// Global Variables
let debounceTimeout;
let allMeals = [];
let allProducts = [];
let currentProduct = null;
let currentLayout = 'grid';

// Buttons
const allButtons = [mealsRecipesBtn, productScannerBtn, foodLogBtn];

// Sections
const allSections = [
  searchFiltersSection,
  mealCategoriesSection,
  allRecipesSection,
  mealDetailsSection,
  productsSection,
  foodLogSection,
];

// Classes
const inactiveClass =
  'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
const activeClass =
  'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all';

const activeAreaClass =
  'px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all';

const inactiveAreaClass =
  'px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';

// Functions
function reset() {
  allSections.forEach(sec => (sec.style.display = 'none'));

  appLoadingOverlay.classList.remove('loading');

  allButtons.forEach(btn => {
    const a = btn.querySelector('a');
    const span = a.querySelector('span');
    a.className = inactiveClass;
    span.classList.remove('font-semibold');
    span.classList.add('font-medium');
  });
}

function activateButton(btn, showSections = [], hash) {
  reset();
  const a = btn.querySelector('a');
  const span = a.querySelector('span');

  a.className = activeClass;
  span.classList.add('font-semibold');
  span.classList.remove('font-medium');

  showSections.forEach(sec => (sec.style.display = 'block'));
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  hash ? (window.location.hash = hash) : 'undefined';
  appLoadingOverlay.classList.add('loading');
}

// Header Menu Toggle
headerMenuBtn.addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
});

allButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});

function renderMeals(meals, layout = currentLayout) {
  currentLayout = layout;

  const gridBtn = document.getElementById('grid-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  const activeLayoutClass = 'bg-white rounded-md shadow-sm';

  const generateMealCard = (meal, layoutType) => {
    if (layoutType === 'grid') {
      return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-meal-id="${meal.id}" data-meal-name="${meal.name}">
        <div class="relative h-48 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src="${meal.thumbnail}" alt="${meal.name}" loading="lazy"/>
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${
              meal.category
            }</span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${
              meal.area
            }</span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${
            meal.name
          }</h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.instructions.slice(
            0,
            100
          )}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${
              meal.category
            }</span>
            <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${
              meal.area
            }</span>
          </div>
        </div>
      </div>`;
    } else {
      return `
      <div class="recipe-card flex gap-4 bg-white rounded-xl shadow-sm p-4 hover:shadow-lg cursor-pointer"
        data-meal-id="${meal.id}" data-meal-name="${meal.name}">
        <img class="w-32 h-32 object-cover rounded-lg flex-shrink-0" src="${
          meal.thumbnail
        }" alt="${meal.name}" />
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-1">${meal.name}</h3>
          <p class="text-xs text-gray-600 mb-2 line-clamp-3">${meal.instructions.slice(
            0,
            150
          )}</p>
          <div class="flex gap-2 text-xs">
            <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${
              meal.category
            }</span>
            <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${
              meal.area
            }</span>
          </div>
        </div>
      </div>`;
    }
  };

  const renderCards = () => {
    if (!meals.length) {
      recipesGrid.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No recipes found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
        </div>`;
      return;
    }

    recipesGrid.classList.remove('grid-cols-2', 'grid-cols-4');
    if (currentLayout === 'grid') {
      recipesGrid.classList.add('grid-cols-4');
    } else {
      recipesGrid.classList.add('grid-cols-2');
    }

    recipesGrid.innerHTML = meals
      .map(meal => generateMealCard(meal, currentLayout))
      .join('');
  };

  recipesGrid.innerHTML = '<div class="loader"></div>';
  setTimeout(renderCards, 300);

  gridBtn.onclick = () => {
    currentLayout = 'grid';
    gridBtn.classList.add(...activeLayoutClass.split(' '));
    listBtn.classList.remove(...activeLayoutClass.split(' '));
    gridBtn
      .querySelector('i')
      .classList.replace('text-gray-500', 'text-gray-700');
    listBtn
      .querySelector('i')
      .classList.replace('text-gray-700', 'text-gray-500');
    renderCards();
  };

  listBtn.onclick = () => {
    currentLayout = 'list';
    listBtn.classList.add(...activeLayoutClass.split(' '));
    gridBtn.classList.remove(...activeLayoutClass.split(' '));
    listBtn
      .querySelector('i')
      .classList.replace('text-gray-500', 'text-gray-700');
    gridBtn
      .querySelector('i')
      .classList.replace('text-gray-700', 'text-gray-500');
    renderCards();
  };
}

recipesGrid.addEventListener('click', e => {
  const mealCard = e.target.closest('.recipe-card');
  if (!mealCard) return;

  const mealId = mealCard.dataset.mealId;
  const mealName = mealCard.dataset.mealName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  getMealDetails(mealId);
  window.location.href = `#meals?id=${mealId}&name=${encodeURIComponent(
    mealName
  )}`;
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

async function getMealDetails(mealId) {
  if (!mealId) {
    const hash = window.location.hash;

    if (hash.startsWith('#meals')) {
      const queryString = hash.split('?')[1];
      const params = new URLSearchParams(queryString);

      mealId = params.get('id');
    } else {
      console.error('No mealId provided and URL hash not found.');
      return;
    }
  }

  const getById = new GetById(mealId);

  function getYoutubeEmbedUrl(url) {
    if (!url || url.trim() === '') return null;

    const regExp =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return null;
  }

  try {
    appLoadingOverlay.classList.remove('loading');

    const meal = await getById.getMealById();
    const selectedMeal = Array.isArray(meal) ? meal[0] : meal;

    const ingredientsItems = selectedMeal.ingredients
      .map(ingredient => ingredient.ingredient || '')
      .filter(item => item.trim() !== '');

    console.log(ingredientsItems);

    const analyze = new Analyze(selectedMeal.name, ingredientsItems);

    let apiResponse, caloriesData, perServing, servings;
    try {
      apiResponse = await analyze.fetchCaloriesData();
      caloriesData = apiResponse.success ? apiResponse.data.totals : null;
      perServing = apiResponse.success ? apiResponse.data.perServing : null;
      servings = apiResponse.success ? apiResponse.data.servings : 4;
    } catch (error) {
      console.warn('Nutrition API failed, using default values:', error);
      caloriesData = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
      };
      perServing = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
      };
      servings = 4;
    }

    console.log(selectedMeal.name);
    console.log(`apiResponse`, apiResponse);
    console.log(`caloriesData`, caloriesData);
    console.log(`perServing`, perServing);

    const caloriesPerServing =
      perServing && perServing.calories ? perServing.calories : 'N/A';
    const proteinPerServing =
      perServing && perServing.protein ? perServing.protein : 0;
    const carbsPerServing =
      perServing && perServing.carbs ? perServing.carbs : 0;
    const fatPerServing = perServing && perServing.fat ? perServing.fat : 0;
    const fiberPerServing =
      perServing && perServing.fiber ? perServing.fiber : 0;
    const sugarPerServing =
      perServing && perServing.sugar ? perServing.sugar : 0;

    const nutritionAvailable =
      caloriesPerServing !== 'N/A' && caloriesPerServing !== 0;

    const proteinPercent = Math.min((proteinPerServing / 50) * 100, 100);
    const carbsPercent = Math.min((carbsPerServing / 275) * 100, 100);
    const fatPercent = Math.min((fatPerServing / 78) * 100, 100);
    const fiberPercent = Math.min((fiberPerServing / 28) * 100, 100);
    const sugarPercent = Math.min((sugarPerServing / 50) * 100, 100);

    mealDetailsSection.innerHTML = `
     <div class="max-w-7xl mx-auto">
          <button
            id="back-to-meals-btn"
            class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
          >
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Recipes</span>
          </button>

          <!-- Hero Section -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div class="relative h-80 md:h-96">
              <img
                src="${selectedMeal.thumbnail}"
                alt="${selectedMeal.name}"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
                    >${selectedMeal.category}</span
                  >
                  <span
                    class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
                    >${selectedMeal.area}</span
                  >
                  ${
                    selectedMeal.tags
                      .map(
                        tag =>
                          `<span class="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full mb-1 inline-block">${tag}</span>`
                      )
                      .join('') ||
                    '<span class="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full mb-1 inline-block">No tags available</span>'
                  }
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                  ${selectedMeal.name}
                </h1>
                <div class="flex items-center gap-6 text-white/90">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-clock"></i>
                    <span>${selectedMeal.duration || 30} min</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-utensils"></i>
                    <span id="hero-servings">${servings} servings</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-fire"></i>
                    <span id="hero-calories">${nutritionAvailable ? caloriesPerServing + ' cal/serving' : 'Nutrition data unavailable'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              role="button"
              tabindex="0"
              id="log-meal-btn"
              class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer"
              data-meal-id="${selectedMeal.id}"
            >
              <i class="fa-solid fa-clipboard-list"></i>
              <span>Log This Meal</span>
            </button>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Ingredients & Instructions -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Ingredients -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-list-check text-emerald-600"></i>
                  Ingredients
                  <span class="text-sm font-normal text-gray-500 ml-auto"
                    >${selectedMeal.ingredients.length} items</span
                  >
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${selectedMeal.ingredients
                    .map(ingredient => {
                      return `
                   <div
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                    />
                    <span class="text-gray-700">
                      <span class="font-medium text-gray-900">${
                        ingredient.measure || 'N/A'
                      }</span> ${ingredient.ingredient || 'N/A'}
                    </span>
                  </div>
                  `;
                    })
                    .join('')}
                </div>
              </div>

              <!-- Instructions -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                  Instructions
                </h2>
                  ${selectedMeal.instructions
                    .map((instruction, index) => {
                      return `
                     <div
                    class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                    >
                      ${index + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-2">
                      ${instruction}
                    </p>
                  </div>
                  `;
                    })
                    .join('')}
                
              </div>

              <!-- Video Section -->
              ${
                selectedMeal.youtube && getYoutubeEmbedUrl(selectedMeal.youtube)
                  ? `
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div
                  class="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                >
                  <iframe
                    src="${getYoutubeEmbedUrl(selectedMeal.youtube)}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  >
                  </iframe>
                </div>
              </div>
              `
                  : `
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div class="text-center p-8">
                    <i class="fa-solid fa-video-slash text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-500">No video tutorial available for this recipe</p>
                  </div>
                </div>
              </div>
              `
              }
            </div>

            <!-- Right Column - Nutrition -->
            <div class="space-y-6">
              <!-- Nutrition Facts -->
              <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                  Nutrition Facts
                </h2>
                <div id="nutrition-facts-container">
                  ${
                    nutritionAvailable
                      ? `
                  <p class="text-sm text-gray-500 mb-4">Per serving</p>

                  <div
                    class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <p class="text-sm text-gray-600">Calories per serving</p>
                    <p class="text-4xl font-bold text-emerald-600">${caloriesPerServing}</p>
                    <p class="text-xs text-gray-500 mt-1">Total: ${caloriesData ? caloriesData.calories : 'N/A'} cal</p>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-gray-700">Protein</span>
                      </div>
                      <span class="font-bold text-gray-900">${proteinPerServing}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full"
                        style="width: ${proteinPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700">Carbs</span>
                      </div>
                      <span class="font-bold text-gray-900">${carbsPerServing}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full"
                        style="width: ${carbsPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700">Fat</span>
                      </div>
                      <span class="font-bold text-gray-900">${fatPerServing}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-purple-500 h-2 rounded-full"
                        style="width: ${fatPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span class="text-gray-700">Fiber</span>
                      </div>
                      <span class="font-bold text-gray-900">${fiberPerServing}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-orange-500 h-2 rounded-full"
                        style="width: ${fiberPercent}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span class="text-gray-700">Sugar</span>
                      </div>
                      <span class="font-bold text-gray-900">${sugarPerServing}g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-pink-500 h-2 rounded-full"
                        style="width: ${sugarPercent}%"
                      ></div>
                    </div>
                  </div>

                  <div class="mt-6 pt-6 border-t border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-900 mb-3">
                      Additional Info
                    </h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Saturated Fat</span>
                        <span class="font-medium">${perServing ? perServing.saturatedFat : 0}g</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Cholesterol</span>
                        <span class="font-medium">${perServing ? perServing.cholesterol : 0}mg</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Sodium</span>
                        <span class="font-medium">${perServing ? perServing.sodium : 0}mg</span>
                      </div>
                    </div>
                  </div>
                  `
                      : `
                  <div class="text-center py-8">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i class="fa-solid fa-triangle-exclamation text-gray-400 text-2xl"></i>
                    </div>
                    <p class="text-gray-600 font-semibold mb-2">Nutrition Data Unavailable</p>
                    <p class="text-sm text-gray-500">Some ingredients couldn't be analyzed</p>
                  </div>
                  `
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
    `;

    searchFiltersSection.style.display = 'none';
    mealCategoriesSection.style.display = 'none';
    allRecipesSection.style.display = 'none';
    mealDetailsSection.style.display = 'block';

    mealDetailsSection.addEventListener('click', async e => {
      const logBtn = e.target.closest('#log-meal-btn');
      const backBtn = e.target.closest('#back-to-meals-btn');
      const logMealModal = document.getElementById('log-meal-modal');

      if (logBtn) {
        e.preventDefault();
        e.stopPropagation();

        logMealModal.classList.remove('loading');
        document.body.style.overflow = 'hidden';

        logMealModal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <img
            src="${selectedMeal.thumbnail}"
            alt="${selectedMeal.name}"
            class="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${selectedMeal.name}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Number of Servings
          </label>
          <div class="flex items-center gap-3">
            <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <i class="fa-solid fa-minus text-gray-600"></i>
            </button>
            <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2" />
            <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <i class="fa-solid fa-plus text-gray-600"></i>
            </button>
          </div>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600" id="modal-calories">${caloriesPerServing}</p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600" id="modal-protein">${proteinPerServing}g</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600" id="modal-carbs">${carbsPerServing}g</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600" id="modal-fat">${fatPerServing}g</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
          <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list me-2"></i>Log Meal
          </button>
        </div>
      </div>
    `;

        const confirmLogMeal = document.getElementById('confirm-log-meal');
        const cancelLogMeal = document.getElementById('cancel-log-meal');
        const decreaseBtn = document.getElementById('decrease-servings');
        const increaseBtn = document.getElementById('increase-servings');
        const servingsInput = document.getElementById('meal-servings');

        confirmLogMeal.addEventListener('click', () => {
          const userServings = parseFloat(servingsInput.value);

          const mealNutrition = {
            calories: Math.round(caloriesPerServing * userServings),
            protein: Math.round(proteinPerServing * userServings),
            carbs: Math.round(carbsPerServing * userServings),
            fat: Math.round(fatPerServing * userServings),
          };

          const mealLog = {
            type: 'meal',
            name: selectedMeal.name,
            mealId: selectedMeal.id,
            category: selectedMeal.category,
            thumbnail: selectedMeal.thumbnail,
            servings: userServings,
            nutrition: mealNutrition,
            loggedAt: new Date().toISOString(),
          };

          let foodLog = JSON.parse(localStorage.getItem('foodLog')) || {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: [],
          };

          foodLog.totalCalories += mealNutrition.calories;
          foodLog.totalProtein += mealNutrition.protein;
          foodLog.totalCarbs += mealNutrition.carbs;
          foodLog.totalFat += mealNutrition.fat;

          foodLog.meals.push(mealLog);

          localStorage.setItem('foodLog', JSON.stringify(foodLog));

          Swal.fire({
            icon: 'success',
            title: 'Meal logged successfully',
            confirmButtonText: 'OK',
          });
          logMealModal.classList.add('loading');
          document.body.style.overflow = 'auto';
          fetchAllMeals();
          fetchAreas();
          fetchCategories();
          displayFoodLog();
          setupQuickActions();
        });

        cancelLogMeal.addEventListener('click', () => {
          logMealModal.classList.add('loading');
          document.body.style.overflow = 'auto';
        });

        decreaseBtn.addEventListener('click', () => {
          servingsInput.value = Math.max(
            parseFloat(servingsInput.value) - 0.5,
            0.5
          );
        });

        increaseBtn.addEventListener('click', () => {
          servingsInput.value = Math.min(
            parseFloat(servingsInput.value) + 0.5,
            10
          );
        });
      }

      if (backBtn) {
        e.preventDefault();
        window.location.hash = '#meals';
        searchFiltersSection.style.display = 'block';
        mealCategoriesSection.style.display = 'block';
        allRecipesSection.style.display = 'block';
        mealDetailsSection.style.display = 'none';
        productsSection.style.display = 'none';
        foodLogSection.style.display = 'none';
        appLoadingOverlay.classList.add('loading');
        fetchAllMeals();
        fetchAreas();
        fetchCategories();
      }
    });

    appLoadingOverlay.classList.add('loading');
  } catch (error) {
    console.error('Error fetching meal details:', error);
    Swal.fire({
      title: 'Error!',
      text: error.message || 'An error occurred',
      icon: 'error',
      confirmButtonText: 'Cool',
    });
    appLoadingOverlay.classList.add('loading');
  } finally {
    appLoadingOverlay.classList.add('loading');
  }
}

if (window.location.hash.startsWith('#meals?id=')) {
  getMealDetails();
  searchFiltersSection.style.display = 'none';
  mealCategoriesSection.style.display = 'none';
  allRecipesSection.style.display = 'none';
  mealDetailsSection.style.display = 'block';

  productsSection.style.display = 'none';
  foodLogSection.style.display = 'none';
}
async function fetchAllMeals() {
  const search = new Search();
  try {
    allMeals = await search.searchMealsByName();
    renderMeals(allMeals);
    updateRecipesCount(allMeals.length);
  } catch (error) {
    console.error('Error fetching all meals:', error);
  }
}

function updateRecipesCount(count, type) {
  recipesCount.innerText = `Showing ${count || 0} ${type || 'all'} recipes`;
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchMealsByName();
  }, 300);
});

function getSearchTerm() {
  const searchTerm = searchInput.value.trim();
  return searchTerm;
}

async function searchMealsByName() {
  const term = getSearchTerm();
  if (!term) {
    fetchAllMeals();
    return;
  }

  try {
    const search = new Search(term);
    const meals = await search.searchMealsByName();
    renderMeals(meals, currentLayout);
    updateRecipesCount(meals.length);
  } catch (error) {
    console.error('Error fetching meals:', error);
  }
}

async function fetchAreas() {
  const search = new Search();
  try {
    const areas = await search.getAreas();
    const areasSection = document.getElementById('areas-section');

    const displayAreas = areas.map((area, index) => {
      return `
      <button
        class="${index === 0 ? activeAreaClass : inactiveAreaClass}"
        data-area="${area.name}"
      >
        ${area.name}
      </button>
    `;
    });

    areasSection.innerHTML = displayAreas.join('');

    setupAreaButtons();
  } catch (error) {
    console.error('Error fetching areas:', error);
  }
}

function setupAreaButtons() {
  const areaButtons = document.querySelectorAll('#areas-section button');

  areaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      areaButtons.forEach(b => {
        b.className = inactiveAreaClass;
      });

      btn.className = activeAreaClass;

      const selectedArea = btn.dataset.area;
      // console.log('Selected area:', selectedArea);

      filterMealsByArea(selectedArea);
    });
  });
}

async function filterMealsByArea(area) {
  if (area === 'All Cuisines') {
    fetchAllMeals();
    return;
  }
  const filter = new Filter('', area);
  try {
    const filteredMeals = await filter.filterMeals();
    renderMeals(filteredMeals, currentLayout);
    updateRecipesCount(filteredMeals.length, area);
  } catch (error) {
    console.error('Error filtering meals:', error);
  }
}

async function fetchCategories() {
  const fetchCategories = new Categories();
  const categories = await fetchCategories.getCategories();
  const categoriesSection = document.getElementById('categories-grid');

  const topCategories = categories.slice(0, 12);

  const categoryStyles = {
    Beef: {
      bg: 'from-red-500 to-rose-600',
      hoverBg: 'hover:from-red-600 hover:to-rose-700',
      cardBg: 'from-red-50 to-rose-50',
      border: 'border-red-200 hover:border-red-400',
      icon: 'fa-drumstick-bite',
    },
    Chicken: {
      bg: 'from-amber-500 to-orange-600',
      hoverBg: 'hover:from-amber-600 hover:to-orange-700',
      cardBg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200 hover:border-amber-400',
      icon: 'fa-drumstick-bite',
    },
    Dessert: {
      bg: 'from-pink-500 to-rose-600',
      hoverBg: 'hover:from-pink-600 hover:to-rose-700',
      cardBg: 'from-pink-50 to-rose-50',
      border: 'border-pink-200 hover:border-pink-400',
      icon: 'fa-cake-candles',
    },
    Lamb: {
      bg: 'from-orange-500 to-amber-600',
      hoverBg: 'hover:from-orange-600 hover:to-amber-700',
      cardBg: 'from-orange-50 to-amber-50',
      border: 'border-orange-200 hover:border-orange-400',
      icon: 'fa-drumstick-bite',
    },
    Pasta: {
      bg: 'from-yellow-500 to-amber-600',
      hoverBg: 'hover:from-yellow-600 hover:to-amber-700',
      cardBg: 'from-yellow-50 to-amber-50',
      border: 'border-yellow-200 hover:border-yellow-400',
      icon: 'fa-bowl-food',
    },
    Seafood: {
      bg: 'from-cyan-500 to-blue-600',
      hoverBg: 'hover:from-cyan-600 hover:to-blue-700',
      cardBg: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200 hover:border-cyan-400',
      icon: 'fa-fish',
    },
    Side: {
      bg: 'from-green-500 to-emerald-600',
      hoverBg: 'hover:from-green-600 hover:to-emerald-700',
      cardBg: 'from-green-50 to-emerald-50',
      border: 'border-green-200 hover:border-green-400',
      icon: 'fa-plate-wheat',
    },
    Starter: {
      bg: 'from-teal-500 to-cyan-600',
      hoverBg: 'hover:from-teal-600 hover:to-cyan-700',
      cardBg: 'from-teal-50 to-cyan-50',
      border: 'border-teal-200 hover:border-teal-400',
      icon: 'fa-utensils',
    },
    Vegan: {
      bg: 'from-emerald-500 to-green-600',
      hoverBg: 'hover:from-emerald-600 hover:to-green-700',
      cardBg: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      icon: 'fa-leaf',
    },
    Vegetarian: {
      bg: 'from-lime-500 to-green-600',
      hoverBg: 'hover:from-lime-600 hover:to-green-700',
      cardBg: 'from-lime-50 to-green-50',
      border: 'border-lime-200 hover:border-lime-400',
      icon: 'fa-seedling',
    },
    Miscellaneous: {
      bg: 'from-slate-500 to-gray-600',
      hoverBg: 'hover:from-slate-600 hover:to-gray-700',
      cardBg: 'from-slate-50 to-gray-50',
      border: 'border-slate-200 hover:border-slate-400',
      icon: 'fa-bowl-rice',
    },
    Breakfast: {
      bg: 'from-purple-500 to-pink-600',
      hoverBg: 'hover:from-purple-600 hover:to-pink-700',
      cardBg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200 hover:border-purple-400',
      icon: 'fa-mug-hot',
    },
    default: {
      bg: 'from-gray-500 to-slate-600',
      hoverBg: 'hover:from-gray-600 hover:to-slate-700',
      cardBg: 'from-gray-50 to-slate-50',
      border: 'border-gray-200 hover:border-gray-400',
      icon: 'fa-utensils',
    },
  };

  const displayCategories = topCategories.map(category => {
    const style = categoryStyles[category.name] || categoryStyles.default;
    return `
      <div class="category-card bg-gradient-to-br ${style.cardBg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group" data-category="${category.name}">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-gradient-to-br ${style.bg} ${style.hoverBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
            <i class="fa-solid ${style.icon} text-white text-sm transition-all"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
          </div>
        </div>
      </div>
    `;
  });

  categoriesSection.innerHTML = displayCategories.join('');
  setupCategoryButtons();
}

function setupCategoryButtons() {
  const categoryButtons = document.querySelectorAll(
    '#categories-grid .category-card'
  );

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.dataset.category;
      // console.log('Selected category:', selectedCategory);

      filterMealsByCategory(selectedCategory);
    });
  });
}

async function filterMealsByCategory(category) {
  if (category === 'All Categories') {
    fetchAllMeals();
    return;
  }
  const filter = new Filter(category);
  const filteredMeals = await filter.filterMeals();
  renderMeals(filteredMeals, currentLayout);
  updateRecipesCount(filteredMeals.length, category);
}

mealsRecipesBtn.addEventListener('click', e => {
  e.preventDefault();
  activateButton(
    mealsRecipesBtn,
    [searchFiltersSection, mealCategoriesSection, allRecipesSection],
    'meals'
  );
});

productScannerBtn.addEventListener('click', e => {
  e.preventDefault();
  activateButton(productScannerBtn, [productsSection], 'scanner');
});

foodLogBtn.addEventListener('click', e => {
  e.preventDefault();
  activateButton(foodLogBtn, [foodLogSection], 'foodlog');
});

// ==================

function displayFoodLog() {
  const foodLog = JSON.parse(localStorage.getItem('foodLog')) || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    meals: [],
  };

  const dateElement = document.getElementById('foodlog-date');
  const today = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  dateElement.textContent = today.toLocaleDateString('en-US', options);

  const dailyGoals = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
  };

  const percentages = {
    calories: Math.min(
      (foodLog.totalCalories / dailyGoals.calories) * 100,
      100
    ),
    protein: Math.min((foodLog.totalProtein / dailyGoals.protein) * 100, 100),
    carbs: Math.min((foodLog.totalCarbs / dailyGoals.carbs) * 100, 100),
    fat: Math.min((foodLog.totalFat / dailyGoals.fat) * 100, 100),
  };

  const todaySection = document.getElementById('foodlog-today-section');
  todaySection.innerHTML = `
    <h3 class="text-lg font-bold text-gray-900 mb-4">
      <i class="fa-solid fa-fire text-orange-500 mr-2"></i>
      Today's Nutrition
    </h3>

    <!-- Progress Bars -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Calories Progress -->
      <div class="bg-emerald-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Calories</span>
          <span class="text-sm text-gray-500">${foodLog.totalCalories} / ${
            dailyGoals.calories
          } kcal</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-emerald-500 h-2.5 rounded-full" style="width: ${
            percentages.calories
          }%"></div>
        </div>
      </div>
      
      <!-- Protein Progress -->
      <div class="bg-blue-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Protein</span>
          <span class="text-sm text-gray-500">${foodLog.totalProtein} / ${
            dailyGoals.protein
          } g</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${
            percentages.protein
          }%"></div>
        </div>
      </div>
      
      <!-- Carbs Progress -->
      <div class="bg-amber-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Carbs</span>
          <span class="text-sm text-gray-500">${foodLog.totalCarbs} / ${
            dailyGoals.carbs
          } g</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-amber-500 h-2.5 rounded-full" style="width: ${
            percentages.carbs
          }%"></div>
        </div>
      </div>
      
      <!-- Fat Progress -->
      <div class="bg-purple-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Fat</span>
          <span class="text-sm text-gray-500">${foodLog.totalFat} / ${
            dailyGoals.fat
          } g</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-purple-500 h-2.5 rounded-full" style="width: ${
            percentages.fat
          }%"></div>
        </div>
      </div>
    </div>

    <!-- Logged Items -->
    <div class="border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-700">
          Logged Items (${foodLog.meals.length})
        </h4>
        <button
          id="clear-foodlog"
          class="text-red-500 hover:text-red-600 text-sm font-medium"
          style="display: ${foodLog.meals.length > 0 ? 'block' : 'none'}"
        >
          <i class="fa-solid fa-trash mr-1"></i>Clear All
        </button>
      </div>

      <div id="logged-items-list" class="space-y-2">
        ${
          foodLog.meals.length === 0
            ? `
          <div class="text-center py-8 text-gray-500">
            <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
            <p class="font-medium">No meals logged today</p>
            <p class="text-sm">Add meals from the Meals page or scan products</p>
          </div>
        `
            : foodLog.meals
                .map((meal, index) => {
                  const loggedTime = new Date(meal.loggedAt);
                  const timeString = loggedTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return `
            <div class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
              <div class="flex items-center gap-4">
                <img
                  src="${meal.thumbnail || meal.image}"
                  alt="${meal.name}"
                  class="w-16 h-16 rounded-lg object-cover"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h5 class="font-semibold text-gray-900">${meal.name}</h5>
                    <button 
                      class="delete-meal-btn text-red-500 hover:text-red-600"
                      data-index="${index}"
                    >
                      <i class="fa-solid fa-times"></i>
                    </button>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">${
                      meal.category
                    }</span>
                    <span><i class="fa-solid fa-clock mr-1"></i>${timeString}</span>
                    <span><i class="fa-solid fa-utensils mr-1"></i>${
                      meal.servings
                    } serving${meal.servings !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="grid grid-cols-4 gap-2 text-xs">
                    <div class="text-center bg-white rounded-lg py-1">
                      <p class="font-bold text-emerald-600">${
                        meal.nutrition.calories
                      }</p>
                      <p class="text-gray-500">cal</p>
                    </div>
                    <div class="text-center bg-white rounded-lg py-1">
                      <p class="font-bold text-blue-600">${
                        meal.nutrition.protein
                      }g</p>
                      <p class="text-gray-500">protein</p>
                    </div>
                    <div class="text-center bg-white rounded-lg py-1">
                      <p class="font-bold text-amber-600">${
                        meal.nutrition.carbs
                      }g</p>
                      <p class="text-gray-500">carbs</p>
                    </div>
                    <div class="text-center bg-white rounded-lg py-1">
                      <p class="font-bold text-purple-600">${
                        meal.nutrition.fat
                      }g</p>
                      <p class="text-gray-500">fat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
                })
                .join('')
        }
      </div>
    </div>
  `;

  createWeeklyChart();

  const clearBtn = document.getElementById('clear-foodlog');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will clear all your logged meals for today!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, clear all!',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (result.isConfirmed) {
          localStorage.removeItem('foodLog');
          displayFoodLog();
          Swal.fire('Cleared!', 'Your food log has been cleared.', 'success');
        }
      });
    });
  }

  const deleteButtons = document.querySelectorAll('.delete-meal-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index);
      const meal = foodLog.meals[index];

      Swal.fire({
        title: 'Remove this meal?',
        text: meal.name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (result.isConfirmed) {
          foodLog.totalCalories -= meal.nutrition.calories;
          foodLog.totalProtein -= meal.nutrition.protein;
          foodLog.totalCarbs -= meal.nutrition.carbs;
          foodLog.totalFat -= meal.nutrition.fat;

          foodLog.meals.splice(index, 1);

          localStorage.setItem('foodLog', JSON.stringify(foodLog));

          displayFoodLog();

          Swal.fire(
            'Removed!',
            'Meal has been removed from your log.',
            'success'
          );
        }
      });
    });
  });
}

function createWeeklyChart() {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const dayData = JSON.parse(
      localStorage.getItem(`foodLog-${dateString}`)
    ) || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };

    last7Days.push({
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      shortDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayData.totalCalories,
      protein: dayData.totalProtein,
      carbs: dayData.totalCarbs,
      fat: dayData.totalFat,
    });
  }

  const currentFoodLog = JSON.parse(localStorage.getItem('foodLog')) || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };

  last7Days[6] = {
    date: today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    shortDate: today.toLocaleDateString('en-US', { weekday: 'short' }),
    calories: currentFoodLog.totalCalories,
    protein: currentFoodLog.totalProtein,
    carbs: currentFoodLog.totalCarbs,
    fat: currentFoodLog.totalFat,
  };

  const chartDiv = document.getElementById('weekly-chart');

  const trace1 = {
    x: last7Days.map(d => d.shortDate),
    y: last7Days.map(d => d.calories),
    name: 'Calories',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: '#10b981',
      width: 3,
    },
    marker: {
      size: 8,
      color: '#10b981',
    },
  };

  const trace2 = {
    x: last7Days.map(d => d.shortDate),
    y: last7Days.map(d => d.protein),
    name: 'Protein (g)',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: '#3b82f6',
      width: 3,
    },
    marker: {
      size: 8,
      color: '#3b82f6',
    },
  };

  const trace3 = {
    x: last7Days.map(d => d.shortDate),
    y: last7Days.map(d => d.carbs),
    name: 'Carbs (g)',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: '#f59e0b',
      width: 3,
    },
    marker: {
      size: 8,
      color: '#f59e0b',
    },
  };

  const trace4 = {
    x: last7Days.map(d => d.shortDate),
    y: last7Days.map(d => d.fat),
    name: 'Fat (g)',
    type: 'scatter',
    mode: 'lines+markers',
    line: {
      color: '#a855f7',
      width: 3,
    },
    marker: {
      size: 8,
      color: '#a855f7',
    },
  };

  const data = [trace1, trace2, trace3, trace4];

  const layout = {
    title: {
      text: 'Weekly Nutrition Trends',
      font: {
        size: 16,
        color: '#1f2937',
        weight: 'bold',
      },
    },
    xaxis: {
      title: 'Day',
      gridcolor: '#f3f4f6',
      showgrid: true,
    },
    yaxis: {
      title: 'Amount',
      gridcolor: '#f3f4f6',
      showgrid: true,
    },
    plot_bgcolor: '#f9fafb',
    paper_bgcolor: '#ffffff',
    hovermode: 'x unified',
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: -0.2,
      xanchor: 'center',
      x: 0.5,
    },
    margin: {
      l: 50,
      r: 30,
      t: 50,
      b: 80,
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  Plotly.newPlot(chartDiv, data, layout, config);
}

function setupQuickActions() {
  const quickLogButtons = document.querySelectorAll('.quick-log-btn');

  quickLogButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      switch (index) {
        case 0:
          window.location.hash = '#meals';
          searchFiltersSection.style.display = 'block';
          mealCategoriesSection.style.display = 'block';
          allRecipesSection.style.display = 'block';
          mealDetailsSection.style.display = 'none';
          productsSection.style.display = 'none';
          foodLogSection.style.display = 'none';
          break;

        case 1:
          window.location.hash = '#products';
          searchFiltersSection.style.display = 'none';
          mealCategoriesSection.style.display = 'none';
          allRecipesSection.style.display = 'none';
          mealDetailsSection.style.display = 'none';
          productsSection.style.display = 'block';
          foodLogSection.style.display = 'none';
          break;

        case 2:
          Swal.fire({
            title:
              '<i class="fa-solid fa-pencil text-purple-600 mr-2"></i>Custom Food Entry',
            html: `
              <div class="text-left space-y-4 p-2">
                <!-- Image Upload Section -->
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fa-solid fa-image text-purple-500 mr-1"></i> Food Image
                  </label>
                  <div class="flex items-center gap-3">
                    <div id="image-preview" class="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-purple-300">
                      <i class="fa-solid fa-utensils text-purple-400 text-3xl"></i>
                    </div>
                    <div class="flex-1">
                      <label for="custom-food-image" class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium text-sm">
                        <i class="fa-solid fa-upload"></i>
                        <span>Upload Image</span>
                      </label>
                      <input type="file" id="custom-food-image" accept="image/*" class="hidden">
                      <p class="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max 2MB)</p>
                    </div>
                  </div>
                </div>

                <!-- Food Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fa-solid fa-tag text-emerald-500 mr-1"></i> Food Name
                  </label>
                  <input 
                    id="custom-food-name" 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all" 
                    placeholder="e.g., Grilled Chicken Salad"
                  >
                </div>

                <!-- Servings -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fa-solid fa-utensils text-blue-500 mr-1"></i> Servings
                  </label>
                  <input 
                    id="custom-servings" 
                    type="number" 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all" 
                    placeholder="1"
                    value="1"
                    min="0.5"
                    step="0.5"
                  >
                </div>

                <!-- Nutrition Grid -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fa-solid fa-fire text-orange-500 mr-1"></i> Calories
                    </label>
                    <input 
                      id="custom-calories" 
                      type="number" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all" 
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fa-solid fa-drumstick-bite text-blue-500 mr-1"></i> Protein (g)
                    </label>
                    <input 
                      id="custom-protein" 
                      type="number" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all" 
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fa-solid fa-bread-slice text-amber-500 mr-1"></i> Carbs (g)
                    </label>
                    <input 
                      id="custom-carbs" 
                      type="number" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all" 
                      placeholder="0"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <i class="fa-solid fa-cheese text-purple-500 mr-1"></i> Fat (g)
                    </label>
                    <input 
                      id="custom-fat" 
                      type="number" 
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all" 
                      placeholder="0"
                    >
                  </div>
                </div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check mr-2"></i>Add Food',
            cancelButtonText: '<i class="fa-solid fa-times mr-2"></i>Cancel',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton:
                'bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl',
              cancelButton:
                'bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl',
            },
            width: '600px',
            didOpen: () => {
              const imageInput = document.getElementById('custom-food-image');
              const imagePreview = document.getElementById('image-preview');

              imageInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    Swal.showValidationMessage(
                      'Image size must be less than 2MB'
                    );
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = event => {
                    imagePreview.innerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover">`;
                  };
                  reader.readAsDataURL(file);
                }
              });
            },
            preConfirm: () => {
              const name = document.getElementById('custom-food-name').value;
              const servings =
                parseFloat(document.getElementById('custom-servings').value) ||
                1;
              const calories =
                parseInt(document.getElementById('custom-calories').value) || 0;
              const protein =
                parseInt(document.getElementById('custom-protein').value) || 0;
              const carbs =
                parseInt(document.getElementById('custom-carbs').value) || 0;
              const fat =
                parseInt(document.getElementById('custom-fat').value) || 0;
              const imageInput = document.getElementById('custom-food-image');
              const imagePreview = document
                .getElementById('image-preview')
                .querySelector('img');

              if (!name) {
                Swal.showValidationMessage('Please enter food name');
                return false;
              }

              const thumbnail = imagePreview
                ? imagePreview.src
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop';

              return {
                name,
                servings,
                calories,
                protein,
                carbs,
                fat,
                thumbnail,
              };
            },
          }).then(result => {
            if (result.isConfirmed) {
              const customFood = result.value;

              const customMeal = {
                type: 'custom',
                name: customFood.name,
                mealId: 'custom-' + Date.now(),
                category: 'Custom',
                thumbnail: customFood.thumbnail,
                servings: customFood.servings,
                nutrition: {
                  calories: customFood.calories,
                  protein: customFood.protein,
                  carbs: customFood.carbs,
                  fat: customFood.fat,
                },
                loggedAt: new Date().toISOString(),
              };

              let foodLog = JSON.parse(localStorage.getItem('foodLog')) || {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                meals: [],
              };

              foodLog.totalCalories += customMeal.nutrition.calories;
              foodLog.totalProtein += customMeal.nutrition.protein;
              foodLog.totalCarbs += customMeal.nutrition.carbs;
              foodLog.totalFat += customMeal.nutrition.fat;

              foodLog.meals.push(customMeal);

              localStorage.setItem('foodLog', JSON.stringify(foodLog));

              displayFoodLog();

              Swal.fire({
                icon: 'success',
                title: 'Added Successfully!',
                text: `${customFood.name} has been logged.`,
                confirmButtonText: 'Great!',
                customClass: {
                  confirmButton:
                    'bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl',
                },
              });
            }
          });
          break;
      }
    });
  });
}

// ===============

lookupBarcodeBtn.addEventListener('click', () =>
  barcodeSearch(barcodeInput.value)
);

barcodeInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    barcodeSearch(barcodeInput.value);
  }
});

async function barcodeSearch(barcodeNumber) {
  if (!barcodeNumber || barcodeNumber.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Please enter a barcode number first',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-xl',
      },
    });
    return;
  }

  try {
    const barcode = new Barcode(barcodeNumber);
    const data = await barcode.searchProductsByBarcode();

    const finalData =
      data &&
      data.name &&
      data.name !== 'Unknown Product' &&
      data.name !== 'Unknown'
        ? [data]
        : [];

    if (finalData.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Product Not Found',
        html: `
          <p class="text-gray-600 mb-2">Barcode: <strong>${barcodeNumber}</strong></p>
          <p class="text-sm text-gray-500">We couldn't find a product with this barcode</p>
          <p class="text-sm text-gray-500 mt-2">Please check:</p>
          <ul class="text-sm text-gray-500 list-disc list-inside mt-1">
            <li>The barcode number is correct</li>
            <li>The product exists in our database</li>
          </ul>
        `,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl',
        },
      });
      productsGrid.innerHTML = `
        <div class="flex flex-col items-center justify-center h-[calc(100vh-20rem)] w-full text-center col-span-2">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-barcode text-red-500 text-3xl"></i>
          </div>
          <p class="text-gray-700 text-xl font-semibold mb-2">Product Not Found</p>
          <p class="text-gray-500 mb-1">Barcode: ${barcodeNumber}</p>
          <p class="text-gray-400 text-sm">Try another barcode or search by name</p>
        </div>
      `;
      productsCount.textContent = 'No products found';
      return;
    }

    renderProducts(finalData);
  } catch (err) {
    console.error('Barcode search failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Search Error',
      text: 'An error occurred while searching for the product. Please try again.',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl',
      },
    });
  }
}

document.querySelectorAll('#nutri-score-filters button').forEach(btn => {
  btn.dataset.originalClass = btn.className;
});

nutriScoreFilters.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const activeClasses = {
    all: '!bg-emerald-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-emerald-300',
    a: '!bg-green-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-green-300',
    b: '!bg-lime-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-lime-300',
    c: '!bg-yellow-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-yellow-300',
    d: '!bg-orange-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-orange-300',
    e: '!bg-red-500 !text-white !shadow-lg !scale-105 !ring-2 !ring-red-300',
  };

  nutriScoreFilters.querySelectorAll('button').forEach(b => {
    b.className = b.dataset.originalClass;
  });

  const grade = btn.dataset.grade;
  btn.className = `${btn.dataset.originalClass} ${activeClasses[grade]}`;

  if (grade === 'all') {
    renderProducts(allProducts);
    productsCount.textContent = `Found ${allProducts.length} products with All Nutri-Score`;
  } else {
    const filtered = allProducts.filter(p => p.nutritionGrade === grade);
    renderProducts(filtered);
    productsCount.textContent = `Found ${
      filtered.length
    } products with Nutri-Score ${grade.toUpperCase()}`;
  }
});

async function productCategoriesBtn() {
  // const categories = [
  //   {
  //     name: 'Beverages',
  //     value: 'beverages',
  //     icon: 'fa-solid fa-coffee',
  //     colorFrom: 'from-blue-500',
  //     colorTo: 'to-blue-500',
  //   },
  //   {
  //     name: 'Breakfast',
  //     value: 'breakfast',
  //     icon: 'fa-solid fa-bowl-rice',
  //     colorFrom: 'from-yellow-500',
  //     colorTo: 'to-yellow-500',
  //   },
  //   {
  //     name: 'Desserts',
  //     value: 'desserts',
  //     icon: 'fa-solid fa-birthday-cake',
  //     colorFrom: 'from-pink-500',
  //     colorTo: 'to-pink-500',
  //   },
  //   {
  //     name: 'Dinner',
  //     value: 'dinner',
  //     icon: 'fa-solid fa-utensils',
  //     colorFrom: 'from-green-500',
  //     colorTo: 'to-green-500',
  //   },
  //   {
  //     name: 'Snacks',
  //     value: 'snacks',
  //     icon: 'fa-solid fa-cookie',
  //     colorFrom: 'from-orange-500',
  //     colorTo: 'to-orange-500',
  //   },
  //   {
  //     name: 'Fruits',
  //     value: 'fruits',
  //     icon: 'fa-solid fa-apple-whole',
  //     colorFrom: 'from-amber-500',
  //     colorTo: 'to-amber-500',
  //   },
  //   {
  //     name: 'Vegetables',
  //     value: 'vegetables',
  //     icon: 'fa-solid fa-carrot',
  //     colorFrom: 'from-orange-500',
  //     colorTo: 'to-green-500',
  //   },
  // ];

  const categoryStyles = [
    {
      colorFrom: 'from-green-500',
      colorTo: 'to-emerald-600',
      icon: 'fa-solid fa-seedling',
    },

    {
      colorFrom: 'from-lime-500',
      colorTo: 'to-green-700',
      icon: 'fa-solid fa-leaf',
    },

    {
      colorFrom: 'from-orange-500',
      colorTo: 'to-amber-600',
      icon: 'fa-solid fa-cookie-bite',
    },

    {
      colorFrom: 'from-pink-500',
      colorTo: 'to-rose-600',
      icon: 'fa-solid fa-candy-cane',
    },

    {
      colorFrom: 'from-blue-500',
      colorTo: 'to-cyan-600',
      icon: 'fa-solid fa-mug-hot',
    },

    {
      colorFrom: 'from-sky-400',
      colorTo: 'to-blue-600',
      icon: 'fa-solid fa-cheese',
    },

    {
      colorFrom: 'from-yellow-500',
      colorTo: 'to-orange-700',
      icon: 'fa-solid fa-wheat-awn',
    },

    {
      colorFrom: 'from-red-600',
      colorTo: 'to-rose-800',
      icon: 'fa-solid fa-drumstick-bite',
    },
  ];

  const categories = new ProductCategories();
  const data = await categories.getProductCategories();

  const slicedData = data.slice(0, 8);
  // console.log(slicedData);

  productCategories.innerHTML = slicedData
    .map((c, index) => {
      const style = categoryStyles[index];

      return `
      <button 
        class="product-category-btn flex-shrink-0 px-5 py-3 bg-gradient-to-r 
        ${style.colorFrom} ${style.colorTo}
        text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        data-category="${c.name}"
      >
        <i class="${style.icon}"></i> ${c.name}
      </button>
    `;
    })
    .join('');

  productCategories.addEventListener('click', async e => {
    const btn = e.target.closest('.product-category-btn');
    if (!btn) return;

    const allButtons = document.querySelectorAll('.product-category-btn');

    try {
      btn.classList.add('loading');

      allButtons.forEach(b => {
        if (b !== btn) b.classList.add('dimmed');
      });

      const category = btn.dataset.category;
      const productApi = new ProductCategories();

      const data = await productApi.getProductByCategory(category);

      const finalData = data.filter(
        p => p.name !== 'Unknown Product' && p.name !== 'Unknown'
      );

      allProducts = finalData;
      renderProducts(allProducts);
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      btn.classList.remove('loading');

      allButtons.forEach(b => b.classList.remove('dimmed'));
    }
  });
}

searchProductBtn.addEventListener('click', () =>
  productSearch(productSearchInput.value)
);

productSearchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    productSearch(productSearchInput.value);
  }
});

async function productSearch(val) {
  try {
    const product = new Product(val);
    const data = await product.searchProductsByName();
    const finalData = data.results.filter(
      p => p.name !== 'Unknown Product' && p.name !== 'Unknown'
    );
    allProducts = finalData;
    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch products. Please try again.',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl',
      },
    });
  }
}

function renderProducts(products) {
  try {
    productsGrid.innerHTML = `
      <div class="flex items-center justify-center h-[calc(100vh-20rem)] w-full col-span-2">
        <div class="loader"></div>
      </div>
    `;

    setTimeout(() => {
      productsCount.textContent = `found ${products.length} products ${
        productSearchInput.value ? `for: "${productSearchInput.value}"` : ''
      }`;

      if (products.length === 0) {
        productsCount.textContent = `No products found ${
          productSearchInput.value ? `for: "${productSearchInput.value}"` : ''
        }`;
        productsGrid.classList.remove('grid', 'grid-cols-2', 'gap-4');
        productsGrid.innerHTML = `
          <div class="flex flex-col items-center justify-center h-[calc(100vh-20rem)] w-full text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="fa-solid fa-box-open text-gray-400 text-2xl"></i>
            </div>
            <p class="text-gray-500 text-lg">No products found</p>
            <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
          </div>
        `;
        return;
      }

      productsGrid.classList.add('grid', 'grid-cols-2', 'gap-4');

      const html = products
        .slice(0, 12)
        .map(
          product => `
            <div
              class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-barcode="${product.barcode || 'N/A'}"
            >
              <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  src="${product.image || './src/images/placeholder.png'}"
                  alt="${product.name || 'Product Image'}"
                  loading="lazy"
                  onerror="this.src='./src/images/placeholder.png'"
                />

                <!-- Nutri-Score Badge -->
                ${
                  product.nutritionGrade
                    ? `
                <div class="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded uppercase ${
                  product.nutritionGrade === 'a'
                    ? 'bg-green-500'
                    : product.nutritionGrade === 'b'
                      ? 'bg-yellow-500'
                      : product.nutritionGrade === 'c'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }">
                  Nutri-Score ${product.nutritionGrade.toUpperCase()}
                </div>
                `
                    : ''
                }

                <!-- NOVA Badge -->
                ${
                  product.novaGroup
                    ? `
                <div class="absolute top-2 right-2 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                  product.novaGroup === '1'
                    ? 'bg-green-500'
                    : product.novaGroup === '2'
                      ? 'bg-yellow-500'
                      : product.novaGroup === '3'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }" title="NOVA ${product.novaGroup}">
                  ${product.novaGroup}
                </div>
                `
                    : ''
                }
              </div>

              <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
                  ${product.brand || 'Unknown Brand'}
                </p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  ${product.name || 'Product Name'}
                </h3>

                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span><i class="fa-solid fa-weight-scale mr-1"></i>${product.servingSize || '100g'}</span>
                  <span><i class="fa-solid fa-fire mr-1"></i>${product.nutrients?.calories || 'N/A'} kcal</span>
                </div>

                <!-- Mini Nutrition -->
                <div class="grid grid-cols-4 gap-1 text-center">
                  <div class="bg-emerald-50 rounded p-1.5">
                    <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein || '0'}g</p>
                    <p class="text-[10px] text-gray-500">Protein</p>
                  </div>
                  <div class="bg-blue-50 rounded p-1.5">
                    <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs || '0'}g</p>
                    <p class="text-[10px] text-gray-500">Carbs</p>
                  </div>
                  <div class="bg-purple-50 rounded p-1.5">
                    <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat || '0'}g</p>
                    <p class="text-[10px] text-gray-500">Fat</p>
                  </div>
                  <div class="bg-orange-50 rounded p-1.5">
                    <p class="text-xs font-bold text-orange-700">${product.nutrients?.sugar || '0'}g</p>
                    <p class="text-[10px] text-gray-500">Sugar</p>
                  </div>
                </div>
              </div>
            </div>
          `
        )
        .join('');

      productsGrid.innerHTML = html;

      document.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('click', () => {
          showProductDetails(products[index]);
        });
      });
    }, 500);
  } catch (error) {
    console.error('Render products error:', error);
    productsGrid.classList.remove('grid', 'grid-cols-2', 'gap-4');
    productsGrid.innerHTML = `
      <div class="flex flex-col items-center justify-center h-[calc(100vh-20rem)] w-full text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <p class="text-gray-700 text-lg font-semibold mb-2">Error Loading Products</p>
        <p class="text-gray-500 text-sm">${error.message}</p>
      </div>
    `;
  }
}

function showProductDetails(product) {
  if (!product || !product.nutrients) {
    console.error('Invalid product data:', product);
    return;
  }

  currentProduct = product;
  const nutriScore = getNutriScoreInfo(product.nutritionGrade);
  const nova = getNovaInfo(product.novaGroup);

  const nutrients = {
    calories: parseFloat(product.nutrients.calories) || 0,
    protein: parseFloat(product.nutrients.protein) || 0,
    carbs: parseFloat(product.nutrients.carbs) || 0,
    fat: parseFloat(product.nutrients.fat) || 0,
    sugar: parseFloat(product.nutrients.sugar) || 0,
    saturatedFat: parseFloat(product.nutrients.saturatedFat) || 0,
    fiber: parseFloat(product.nutrients.fiber) || 0,
    salt: parseFloat(product.nutrients.salt) || 0,
  };

  const proteinPercent = Math.min((nutrients.protein / 50) * 100, 100);
  const carbsPercent = Math.min((nutrients.carbs / 300) * 100, 100);
  const fatPercent = Math.min((nutrients.fat / 70) * 100, 100);
  const sugarPercent = Math.min((nutrients.sugar / 90) * 100, 100);

  const modal =
    document.getElementById('product-modal') ||
    document.getElementById('log-meal-modal');

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-start gap-6 mb-6">
          <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src="${product.image || './src/images/placeholder.png'}" 
              alt="${product.name}" 
              class="w-full h-full object-contain"
              onerror="this.src='./src/images/placeholder.png'"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm text-emerald-600 font-semibold mb-1">${product.brand || 'Unknown Brand'}</p>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name || 'Product Name'}</h2>
            <p class="text-sm text-gray-500 mb-3">${product.servingSize || '100g'}</p>
            <div class="flex items-center gap-3 flex-wrap">
              ${
                product.nutritionGrade
                  ? `
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nutriScore.light}">
                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${nutriScore.bg}">
                  ${product.nutritionGrade.toUpperCase()}
                </span>
                <div>
                  <p class="text-xs font-bold" style="color: ${nutriScore.bg}">Nutri-Score</p>
                  <p class="text-[10px] text-gray-600">${nutriScore.text}</p>
                </div>
              </div>
              `
                  : ''
              }
              ${
                product.novaGroup
                  ? `
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nova.light}">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${nova.bg}">
                  ${product.novaGroup}
                </span>
                <div>
                  <p class="text-xs font-bold" style="color: ${nova.bg}">NOVA</p>
                  <p class="text-[10px] text-gray-600">${nova.text}</p>
                </div>
              </div>
              `
                  : ''
              }
            </div>
          </div>
          <button class="close-product-modal text-gray-400 hover:text-gray-600">
            <i class="fas fa-xmark text-2xl"></i>
          </button>
        </div>

        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fas fa-chart-pie text-emerald-600"></i>
            Nutrition Facts
            <span class="text-sm font-normal text-gray-500">(per 100g)</span>
          </h3>
          <div class="text-center mb-4 pb-4 border-b border-emerald-200">
            <p class="text-4xl font-bold text-gray-900">${nutrients.calories}</p>
            <p class="text-sm text-gray-500">Calories</p>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPercent}%"></div>
              </div>
              <p class="text-lg font-bold text-emerald-600">${nutrients.protein}g</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPercent}%"></div>
              </div>
              <p class="text-lg font-bold text-blue-600">${nutrients.carbs}g</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPercent}%"></div>
              </div>
              <p class="text-lg font-bold text-purple-600">${nutrients.fat}g</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-orange-500 h-2 rounded-full" style="width: ${sugarPercent}%"></div>
              </div>
              <p class="text-lg font-bold text-orange-600">${nutrients.sugar}g</p>
              <p class="text-xs text-gray-500">Sugar</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${nutrients.saturatedFat}g</p>
              <p class="text-xs text-gray-500">Saturated Fat</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${nutrients.fiber}g</p>
              <p class="text-xs text-gray-500">Fiber</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${nutrients.salt}g</p>
              <p class="text-xs text-gray-500">Salt</p>
            </div>
          </div>
        </div>

        ${
          product.ingredients
            ? `
        <div class="bg-gray-50 rounded-xl p-5 mb-6">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fas fa-list text-gray-600"></i>
            Ingredients
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">${product.ingredients}</p>
        </div>
        `
            : ''
        }

        <div class="flex gap-3">
          <button id="log-product-btn" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            <i class="fas fa-plus mr-2"></i> Log This Food
          </button>
          <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden', 'loading');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  modal.querySelectorAll('.close-product-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  });

  const logBtn = document.getElementById('log-product-btn');
  if (logBtn) {
    logBtn.addEventListener('click', () => {
      showLogModal();
    });
  }
}

function showLogModal() {
  if (!currentProduct) {
    console.error('No current product selected');
    return;
  }

  const logModal = document.getElementById('log-meal-modal');
  const nutrients = currentProduct.nutrients || {};

  logModal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <div class="flex items-center gap-4 mb-6">
        <img 
          src="${currentProduct.image || './src/images/placeholder.png'}" 
          alt="${currentProduct.name}" 
          class="w-16 h-16 rounded-xl object-cover"
          onerror="this.src='./src/images/placeholder.png'"
        />
        <div>
          <h3 class="text-xl font-bold text-gray-900">Log This Product</h3>
          <p class="text-gray-500 text-sm">${currentProduct.name}</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Quantity (100g units)</label>
        <div class="flex items-center gap-3">
          <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <i class="fa-solid fa-minus text-gray-600"></i>
          </button>
          <input type="number" id="product-quantity" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2" />
          <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <i class="fa-solid fa-plus text-gray-600"></i>
          </button>
        </div>
      </div>

      <div class="bg-emerald-50 rounded-xl p-4 mb-6">
        <p class="text-sm text-gray-600 mb-2">Estimated nutrition:</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div>
            <p class="text-lg font-bold text-emerald-600" id="modal-calories">${nutrients.calories || 0}</p>
            <p class="text-xs text-gray-500">Calories</p>
          </div>
          <div>
            <p class="text-lg font-bold text-blue-600" id="modal-protein">${nutrients.protein || 0}g</p>
            <p class="text-xs text-gray-500">Protein</p>
          </div>
          <div>
            <p class="text-lg font-bold text-amber-600" id="modal-carbs">${nutrients.carbs || 0}g</p>
            <p class="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p class="text-lg font-bold text-purple-600" id="modal-fat">${nutrients.fat || 0}g</p>
            <p class="text-xs text-gray-500">Fat</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button id="cancel-log" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Cancel</button>
        <button id="confirm-log" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
          <i class="fa-solid fa-clipboard-list me-2"></i>Log Product
        </button>
      </div>
    </div>
  `;

  logModal.classList.remove('loading', 'hidden');
  logModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const quantityInput = document.getElementById('product-quantity');
  const decreaseBtn = document.getElementById('decrease-servings');
  const increaseBtn = document.getElementById('increase-servings');

  const updateNutrition = () => {
    const qty = parseFloat(quantityInput.value) || 1;
    document.getElementById('modal-calories').textContent = Math.round(
      (nutrients.calories || 0) * qty
    );
    document.getElementById('modal-protein').textContent =
      ((nutrients.protein || 0) * qty).toFixed(1) + 'g';
    document.getElementById('modal-carbs').textContent =
      ((nutrients.carbs || 0) * qty).toFixed(1) + 'g';
    document.getElementById('modal-fat').textContent =
      ((nutrients.fat || 0) * qty).toFixed(1) + 'g';
  };

  quantityInput.addEventListener('input', updateNutrition);

  decreaseBtn.addEventListener('click', () => {
    quantityInput.value = Math.max(
      parseFloat(quantityInput.value) - 0.5,
      0.5
    ).toFixed(1);
    updateNutrition();
  });

  increaseBtn.addEventListener('click', () => {
    quantityInput.value = Math.min(
      parseFloat(quantityInput.value) + 0.5,
      10
    ).toFixed(1);
    updateNutrition();
  });

  document.getElementById('cancel-log').addEventListener('click', () => {
    logModal.classList.add('loading', 'hidden');
    logModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  document.getElementById('confirm-log').addEventListener('click', () => {
    const qty = parseFloat(quantityInput.value) || 1;

    const productLog = {
      type: 'product',
      name: currentProduct.name,
      barcode: currentProduct.barcode,
      brand: currentProduct.brand,
      category: 'Product',
      image: currentProduct.image,
      servings: qty,
      nutrition: {
        calories: Math.round((nutrients.calories || 0) * qty),
        protein: Math.round((nutrients.protein || 0) * qty),
        carbs: Math.round((nutrients.carbs || 0) * qty),
        fat: Math.round((nutrients.fat || 0) * qty),
      },
      loggedAt: new Date().toISOString(),
    };

    let foodLog = JSON.parse(localStorage.getItem('foodLog')) || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: [],
    };

    foodLog.totalCalories += productLog.nutrition.calories;
    foodLog.totalProtein += productLog.nutrition.protein;
    foodLog.totalCarbs += productLog.nutrition.carbs;
    foodLog.totalFat += productLog.nutrition.fat;
    foodLog.meals.push(productLog);

    localStorage.setItem('foodLog', JSON.stringify(foodLog));

    Swal.fire({
      icon: 'success',
      title: 'Product logged successfully',
      timer: 1500,
      showConfirmButton: false,
    });

    logModal.classList.add('loading', 'hidden');
    logModal.style.display = 'none';

    const productModal =
      document.getElementById('product-modal') ||
      document.getElementById('log-meal-modal');
    productModal.classList.add('hidden');
    productModal.style.display = 'none';

    document.body.style.overflow = 'auto';

    if (typeof displayFoodLog === 'function') displayFoodLog();
  });
}

function getNutriScoreInfo(grade) {
  const colors = {
    a: { bg: '#038141', light: '#03814120', text: 'Excellent' },
    b: { bg: '#85bb2f', light: '#85bb2f20', text: 'Good' },
    c: { bg: '#fecb02', light: '#fecb0220', text: 'Fair' },
    d: { bg: '#ee8100', light: '#ee810020', text: 'Poor' },
    e: { bg: '#e63e11', light: '#e63e1120', text: 'Very Poor' },
  };
  return colors[grade?.toLowerCase()] || colors['d'];
}

function getNovaInfo(group) {
  const groupStr = String(group);
  const colors = {
    1: { bg: '#038141', light: '#03814120', text: 'Unprocessed' },
    2: { bg: '#85bb2f', light: '#85bb2f20', text: 'Processed' },
    3: { bg: '#ee8100', light: '#ee810020', text: 'Processed' },
    4: { bg: '#e63e11', light: '#e63e1120', text: 'Ultra-processed' },
  };
  return colors[groupStr] || colors['4'];
}

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  fetchAllMeals();
  fetchAreas();
  fetchCategories();
  displayFoodLog();
  setupQuickActions();
  productSearch();
  productCategoriesBtn();

  if (!window.location.hash) {
    window.location.replace('#meals');
    appLoadingOverlay.classList.add('loading');
  }

  if (window.location.hash === '#meals') {
    activateButton(
      mealsRecipesBtn,
      [searchFiltersSection, mealCategoriesSection, allRecipesSection],
      'meals'
    );
  } else if (window.location.hash === '#scanner') {
    activateButton(productScannerBtn, [productsSection], 'scanner');
    appLoadingOverlay.classList.add('loading');
  } else if (window.location.hash === '#foodlog') {
    activateButton(foodLogBtn, [foodLogSection], 'foodlog');
    appLoadingOverlay.classList.add('loading');
  }
});
