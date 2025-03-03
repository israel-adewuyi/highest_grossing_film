// Global variables
let filmsData = [];
let filteredData = [];
let activeFilters = {
  years: new Set(),
  countries: new Set(),
  directors: new Set(),
};

// DOM Elements
const filmsContainer = document.getElementById("filmsContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const yearFilters = document.getElementById("yearFilters");
const countryFilters = document.getElementById("countryFilters");
const directorFilters = document.getElementById("directorFilters");
const resetFiltersBtn = document.getElementById("resetFilters");
const totalFilmsElement = document.getElementById("totalFilms");
const avgBoxOfficeElement = document.getElementById("avgBoxOffice");
const yearRangeElement = document.getElementById("yearRange");

// Load films data
async function loadFilmsData() {
  try {
    const response = await fetch("films.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    filmsData = await response.json();

    // Normalize data to handle string box office values and ensure numbers
    filmsData = filmsData.map((film) => ({
      ...film,
      release_year: film.release_year || 0,
      box_office:
        parseFloat(String(film.box_office || "0").replace(/[$,]/g, "")) || 0,
    }));
    filteredData = [...filmsData];

    initializeFilters();
    updateStats();
    displayFilms();
    setupEventListeners();
  } catch (error) {
    console.error("Error:", error);
    filmsContainer.innerHTML = '<p class="error">Error loading films data.</p>';
  }
}

// Initialize filter options
function initializeFilters() {
  const years = [...new Set(filmsData.map((film) => film.release_year))].sort(
    (a, b) => b - a
  );
  const countries = [
    ...new Set(filmsData.map((film) => film.country).filter(Boolean)),
  ].sort();
  const directors = [
    ...new Set(filmsData.map((film) => film.directors).filter(Boolean)),
  ].sort();

  yearFilters.innerHTML = years
    .map(
      (year) => `<label><input type="checkbox" value="${year}">${year}</label>`
    )
    .join("");
  countryFilters.innerHTML = countries
    .map(
      (country) =>
        `<label><input type="checkbox" value="${country}">${country}</label>`
    )
    .join("");
  directorFilters.innerHTML = directors
    .map(
      (director) =>
        `<label><input type="checkbox" value="${director}">${director}</label>`
    )
    .join("");
}

// Display films
function displayFilms() {
  filmsContainer.innerHTML = filteredData
    .map(
      (film) => `
        <div class="film-card">
            ${
              film.image_url
                ? `<img src="${film.image_url}" alt="${
                    film.title || "No Title"
                  }" class="film-image" onerror="this.style.display='none'">`
                : `<div class="film-image-placeholder">No Image</div>`
            }
            <h2>${film.title || "Unknown Title"}</h2>
            <p>Year: ${film.release_year || "N/A"}</p>
            <p>Director: ${film.directors || "Unknown"}</p>
            <p>Country: ${film.country || "Unknown"}</p>
            <p>Box Office: $${(film.box_office || 0).toLocaleString(
              "en-US"
            )}</p>
            ${
              film.film_url
                ? `<a href="${film.film_url}" target="_blank">More Info</a>`
                : ""
            }
        </div>
    `
    )
    .join("");
}

// Update statistics
function updateStats() {
  totalFilmsElement.textContent = `Total Films: ${filteredData.length}`;
  const avgBoxOffice = filteredData.length
    ? filteredData.reduce((sum, film) => sum + (film.box_office || 0), 0) /
      filteredData.length
    : 0;
  avgBoxOfficeElement.textContent = `Avg Box Office: $${Math.round(
    avgBoxOffice
  ).toLocaleString("en-US")}`;
  const years = filteredData
    .map((f) => f.release_year)
    .filter((y) => y !== undefined && y !== 0);
  yearRangeElement.textContent = years.length
    ? `Year Range: ${Math.min(...years)} - ${Math.max(...years)}`
    : "Year Range: N/A";
}

// Apply filters and sorting
function applyFilters() {
  filteredData = filmsData.filter((film) => {
    const yearMatch =
      !activeFilters.years.size || activeFilters.years.has(film.release_year);
    const countryMatch =
      !activeFilters.countries.size ||
      (film.country && activeFilters.countries.has(film.country));
    const directorMatch =
      !activeFilters.directors.size ||
      (film.directors && activeFilters.directors.has(film.directors));
    const searchMatch =
      !searchInput.value ||
      (film.title || "")
        .toLowerCase()
        .includes(searchInput.value.toLowerCase());
    return yearMatch && countryMatch && directorMatch && searchMatch;
  });

  const sortBy = sortSelect.value;
  filteredData.sort((a, b) => {
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "year") return (b.release_year || 0) - (a.release_year || 0);
    if (sortBy === "boxOffice")
      return (b.box_office || 0) - (a.box_office || 0);
    return 0;
  });

  updateStats();
  displayFilms();
}

// Event listeners
function setupEventListeners() {
  searchInput.addEventListener("input", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  resetFiltersBtn.addEventListener("click", () => {
    activeFilters.years.clear();
    activeFilters.countries.clear();
    activeFilters.directors.clear();
    searchInput.value = "";
    document
      .querySelectorAll(".filter-options input")
      .forEach((input) => (input.checked = false));
    applyFilters();
  });

  [yearFilters, countryFilters, directorFilters].forEach((filter) => {
    filter.addEventListener("change", (e) => {
      const { value, checked } = e.target;
      const filterSet =
        filter === yearFilters
          ? activeFilters.years
          : filter === countryFilters
          ? activeFilters.countries
          : activeFilters.directors;
      if (checked) filterSet.add(value);
      else filterSet.delete(value);
      applyFilters();
    });
  });
}

// Start the application
loadFilmsData();
