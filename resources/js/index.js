// Close overlay when clicking outside or pressing Escape
document.addEventListener("click", function (e) {
  const overlay = document.querySelector(".overlay-menu");
  const toggleButton = document.querySelector(".nav-toggle");

  if (
    document.body.classList.contains("menu-open") &&
    !overlay.contains(e.target) &&
    !toggleButton.contains(e.target)
  ) {
    document.body.classList.remove("menu-open");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
    document.body.classList.remove("menu-open");
  }
});

let currentPreviewMap = null;

function showMapPreview(cardElement, lat, lng) {
  const container = cardElement.querySelector(".map-preview-container");
  const mapDiv = container.querySelector(".map-preview");
  container.style.display = "block";

  // Clear any old map content
  mapDiv.innerHTML = "";

  // ✅ Create new Leaflet map preview
  currentPreviewMap = L.map(mapDiv).setView([lat, lng], 10);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(currentPreviewMap);

  // Add marker
  L.marker([lat, lng]).addTo(currentPreviewMap);
}

function hideMapPreview(cardElement) {
  const container = cardElement.querySelector(".map-preview-container");
  container.style.display = "none";

  // Properly destroy Leaflet map
  const mapDiv = container.querySelector(".map-preview");
  if (mapDiv._leaflet_id) {
    mapDiv._leaflet_id = null;
  }
  mapDiv.innerHTML = "";
}

let mapViewEnabled = false;
let mapsInitialized = false;

function toggleAllViews() {
  const button = document.getElementById("toggleViewBtn");
  const cards = document.querySelectorAll(".race-card");

  mapViewEnabled = !mapViewEnabled;

  cards.forEach((card) => {
    const details = card.querySelector(".race-details");
    const mapContainer = card.querySelector(".map-preview-container");
    const mapDiv = card.querySelector(".map-preview");

    if (mapViewEnabled) {
      details.style.display = "none";
      mapContainer.style.display = "block";

      // Initialize map only once per card
      if (!mapDiv.dataset.initialized) {
        const lat = parseFloat(card.dataset.lat);
        const lng = parseFloat(card.dataset.lng);

        // Create Leaflet map
        const map = L.map(mapDiv).setView([lat, lng], 10);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Add marker
        L.marker([lat, lng]).addTo(map);

        mapDiv.dataset.initialized = "true";
      }
    } else {
      details.style.display = "block";
      mapContainer.style.display = "none";
    }
  });

  button.textContent = mapViewEnabled ? "Show Race Details" : "Show Map View";
}
