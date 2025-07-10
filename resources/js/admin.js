// Optimized admin.js with duplicates removed and migrated to Leaflet.js
document.addEventListener("DOMContentLoaded", function () {
  const pageLinks = document.querySelectorAll(".pagelinks");
  const wrappers = document.querySelectorAll(".wrappers");
  const navTabs = document.querySelectorAll(".nav-tabs li");
  const isLoggedIn = document.querySelector(".logout-wrapper") !== null;

  // ... (most of the file remains the same) ...
  // Hide all wrappers initially
  wrappers.forEach((wrapper) => (wrapper.style.display = "none"));

  // Set initial view based on login status
  if (isLoggedIn) {
    const myAccountWrapper = document.querySelector(".my-account-wrapper");
    if (myAccountWrapper) myAccountWrapper.style.display = "block";
    navTabs.forEach((li) => li.classList.remove("active"));
    const myAccountNav = document.querySelector(
      '.nav-tabs a[href="#my-account"]'
    );
    if (myAccountNav) myAccountNav.closest("li").classList.add("active");
  } else {
    const loginWrapper = document.querySelector(".login-wrapper");
    if (loginWrapper) loginWrapper.style.display = "block";
    navTabs.forEach((li) => li.classList.remove("active"));
    const loginNav = document.querySelector('.nav-tabs a[href="#login"]');
    if (loginNav) loginNav.closest("li").classList.add("active");
  }

  // Page navigation
  pageLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href").substring(1);
      if (this.classList.contains("logout")) return;

      requestAnimationFrame(() => {
        wrappers.forEach((wrapper) => {
          wrapper.style.display = "none";
        });

        const targetWrapper = document.querySelector(`.${target}-wrapper`);
        if (targetWrapper) {
          targetWrapper.style.display = "block";
          // Initialize maps on tab click
          if (target === "race-calendar") loadRaces();
          if (target === "radius-search") initRadiusSearchMap();
          if (target === "directions") initDirectionsMap();
          if (target === "polygon-drawing") initPolygonDrawingMap();
        }

        navTabs.forEach((li) => li.classList.remove("active"));
        this.closest("li")?.classList.add("active");
      });
    });
  });

  // Toggle password visibility
  const eyeIcons = document.querySelectorAll(".eyeIcon");
  eyeIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      this.classList.toggle("eyeShow", isHidden);
      this.classList.toggle("eyeHide", !isHidden);
    });
  });

  // Logout handler
  const logoutLink = document.querySelector(".logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        window.location.href = "admin/logout.php";
      }
    });
  }

  // Initialize the main map once the DOM is loaded
  initMap();
});

// Register form handler
document
  .getElementById("registerform")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const alertBox = form.querySelector(".alert-danger");
    const controlLabel = alertBox.querySelector(".control-label");

    formData.append("register_ajax", "1");

    const showError = (message) => {
      alertBox.style.display = "block";
      controlLabel.textContent = message;
    };

    try {
      const response = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (result.trim() === "success") {
        document.getElementById("registerSuccessPopup").style.display = "flex";
        alertBox.style.display = "none";
      } else {
        showError(result);
      }
    } catch (err) {
      console.error("Registration error:", err);
      showError("Network error occurred. Please try again.");
    }
  });

// Login form handler
document
  .getElementById("loginform")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const alertBox = form.querySelector(".alert-danger");
    const controlLabel = alertBox.querySelector(".control-label");

    formData.append("login_ajax", "1");

    const showError = (message) => {
      alertBox.style.display = "block";
      controlLabel.textContent = message;
    };

    try {
      const response = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (result.trim() === "success") {
        document.querySelectorAll(".wrappers").forEach((div) => {
          div.style.display = "none";
        });
        document.querySelector(".my-account-wrapper").style.display = "block";

        document
          .querySelectorAll(".nav-tabs li")
          .forEach((li) => li.classList.remove("active"));
        const myAccountNav = document.querySelector(
          '.nav-tabs a[href="#my-account"]'
        );
        if (myAccountNav) {
          myAccountNav.closest("li").classList.add("active");
        }

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError(result);
      }
    } catch (err) {
      console.error("Login error:", err);
      showError("Network error occurred. Please try again.");
    }
  });

// Race form handler
document
  .getElementById("raceForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
      const res = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      alert(json.message || "Saved.");
      closeRacePopup();
      if (typeof loadRaces === "function") loadRaces();
    } catch (err) {
      console.error("Race save error:", err);
      alert("Error saving race. Please try again.");
    }
  });

// Load races
async function loadRaces() {
  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_races: 1 }),
    });
    const races = await response.json();
    const tbody = document.getElementById("raceTableBody");
    tbody.innerHTML = "";

    races.forEach((race) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${race.title}</td>
        <td>${race.date}</td>
        <td>${race.location}</td>
        <td><img src="resources/img/flags/${race.country}.png" alt="${race.country}" style="height: 20px;"> ${race.country}</td>
      `;

      tr.dataset.raceData = JSON.stringify(race);
      tr.style.cursor = "pointer";
      tr.addEventListener("click", function () {
        const raceData = JSON.parse(this.dataset.raceData);
        openRacePopup(raceData);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load races error:", err);
  }
}

// Race popup functions
function openRacePopup(race = null) {
  document.getElementById("racePopup").style.display = "flex";
  const form = document.getElementById("raceForm");

  if (race) {
    // Edit mode
    document.getElementById("popupTitle").textContent = "Edit Race";
    document.getElementById("race_id").value = race.id || race.race_id || "";

    Object.keys(race).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = race[key] || "";
      }
    });

    if (race.country) {
      updateFlagPreview();
    }
  } else {
    // Add mode
    form.reset();
    document.getElementById("popupTitle").textContent = "Add New Race";
    document.getElementById("race_id").value = "";
  }

  // Leaflet map handling
  setTimeout(() => {
    if (map) {
      map.invalidateSize(); // Important: ensures map renders correctly in a popup

      if (marker) {
        marker.remove(); // Remove previous marker
      }

      if (race && race.latitude && race.longitude) {
        const lat = parseFloat(race.latitude);
        const lng = parseFloat(race.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const position = [lat, lng];
          map.setView(position, 12);

          marker = L.marker(position).addTo(map);
          marker
            .bindPopup(
              `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #e10600;">${
                race.title || "Race"
              }</h3>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${
                race.location || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${
                race.date || "N/A"
              }</p>
            </div>
          `
            )
            .openPopup();
        } else {
          setDefaultMapLocation();
        }
      } else {
        setDefaultMapLocation();
      }
    }
  }, 100); // Small delay to ensure popup is visible
}

function closeRacePopup() {
  document.getElementById("racePopup").style.display = "none";
}

async function deleteRace() {
  const raceId = document.getElementById("race_id").value;
  if (!raceId) {
    alert("No race selected for deletion.");
    return;
  }

  if (confirm("Are you sure you want to delete this race?")) {
    try {
      const response = await fetch("management.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `delete_race=1&race_id=${raceId}`,
      });
      const result = await response.text();
      alert(result);
      closeRacePopup();
      loadRaces();
    } catch (err) {
      console.error("Delete race error:", err);
      alert("Error deleting race.");
    }
  }
}

function updateFlagPreview() {
  const select = document.getElementById("country");
  const flag = document.getElementById("flagImage");
  if (select && flag) {
    flag.src = `resources/img/flags/${select.value}.png`;
  }
}

// --- Leaflet.js Map Functionality ---
let map;
let marker;
let geocoder;

function initMap() {
  if (document.getElementById("map")) {
    map = L.map("map").setView([20, 0], 2); // Default view (zoomed out)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Geocoder search control
    geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: "Search for a location...",
      collapsed: false,
    })
      .on("markgeocode", function (e) {
        const { center, name } = e.geocode;
        map.setView(center, 12);
        updateMarker(center, name);
      })
      .addTo(map);

    // Handle map click
    map.on("click", function (e) {
      updateMarker(e.latlng, "Selected Location");
    });
  }
}

function updateMarker(latlng, title) {
  if (marker) {
    marker.remove();
  }
  marker = L.marker(latlng).addTo(map).bindPopup(title).openPopup();

  document.getElementById("latitude").value = latlng.lat.toFixed(6);
  document.getElementById("longitude").value = latlng.lng.toFixed(6);
}

function setDefaultMapLocation() {
  if (map) {
    map.setView([20, 0], 2);
    if (marker) {
      marker.remove();
    }
  }
}

function updateMapLocation() {
  const countrySelect = document.getElementById("country");
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const countryName = selectedOption.textContent.replace(/^[^\w]+ /, "");
  const zoom = zoomLevels[countryName] || 6;

  // Use the geocoder to find the location
  geocoder.geocode(countryName, (results) => {
    if (results && results.length > 0) {
      const { center, name } = results[0];
      map.flyTo(center, zoom); // Smooth animation
      updateMarker(center, name);
    } else {
      console.error("Geocode error: Location not found for", countryName);
    }
  });
}

let radiusMap,
  radiusCircle,
  searchMarkers = [],
  visibleMarkers = L.layerGroup();

/**
 * Populates the continent filter dropdown based on race data.
 * @param {Array} races - The array of race objects from the server.
 */
function populateContinentFilter(races) {
  const filterSelect = document.getElementById("continent-filter");
  if (!filterSelect) return;

  // Get unique, known continents from the race data and sort them
  const continents = [
    ...new Set(
      races.map((race) => race.continent).filter((c) => c && c !== "Unknown")
    ),
  ];
  continents.sort();

  // Clear existing options and add the default "All" option
  filterSelect.innerHTML = '<option value="all">All Continents</option>';

  // Add a new option for each unique continent
  continents.forEach((continent) => {
    const option = document.createElement("option");
    option.value = continent;
    option.textContent = continent;
    filterSelect.appendChild(option);
  });

  // Enable the filter now that it's populated
  filterSelect.disabled = false;
}

async function initRadiusSearchMap() {
  if (radiusMap) {
    radiusMap.invalidateSize();
    return;
  }
  radiusMap = L.map("radius-map").setView([48.8566, 2.3522], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    radiusMap
  );

  // Fetch race data from the database to populate the search markers
  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_races: 1 }),
    });
    const races = await response.json();
    searchMarkers = []; // Clear previous markers

    // Populate the continent filter dropdown with the fetched data
    populateContinentFilter(races);

    races.forEach((race) => {
      const lat = parseFloat(race.latitude);
      const lon = parseFloat(race.longitude);
      // Ensure the race has valid coordinates before creating a marker
      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon], {
          // Add continent data to the marker's options for later filtering
          title: race.title,
          continent: race.continent,
        }).bindPopup(race.title);
        searchMarkers.push(marker);
      }
    });
  } catch (err) {
    console.error("Failed to load race locations for radius search:", err);
    document.getElementById("radius-search-results-count").textContent =
      "Error loading race data.";
  }

  visibleMarkers.addTo(radiusMap);

  document
    .getElementById("radius-search-btn")
    .addEventListener("click", performRadiusSearch);
  document
    .getElementById("continent-filter")
    .addEventListener("change", performRadiusSearch);

  radiusMap.on("click", (e) => {
    if (radiusCircle) {
      // If circle exists, update its position to the clicked location
      radiusCircle.setLatLng(e.latlng);
    } else {
      // Otherwise, create the circle
      radiusCircle = L.circle(e.latlng, {
        radius: 0,
        color: "#e10600",
        fillOpacity: 0.1,
        draggable: true,
      }).addTo(radiusMap);

      // When dragging ends, update the map center and re-run the search
      radiusCircle.on("dragend", function (e) {
        radiusMap.panTo(e.target.getLatLng());
        performRadiusSearch();
      });
    }

    performRadiusSearch();
  });

  performRadiusSearch(); // Initial search
}

function performRadiusSearch() {
  const centerPoint = radiusCircle
    ? radiusCircle.getLatLng()
    : radiusMap.getCenter();
  const radiusKm = parseFloat(document.getElementById("radius-km").value);
  const radiusMeters = isNaN(radiusKm) ? 0 : radiusKm * 1000;

  // Get the selected continent value from the dropdown
  const selectedContinent = document.getElementById("continent-filter").value;

  if (radiusCircle) {
    // If circle exists, update its radius
    radiusCircle.setRadius(radiusMeters);
  }

  if (radiusMeters > 0) {
    radiusMap.fitBounds(radiusCircle.getBounds());
  }

  visibleMarkers.clearLayers();
  const resultsList = document.getElementById("radius-search-results-list");
  resultsList.innerHTML = ""; // Clear previous results
  let foundLocations = [];

  searchMarkers.forEach((marker) => {
    // Check if the marker's continent matches the filter
    const isCorrectContinent =
      selectedContinent === "all" ||
      marker.options.continent === selectedContinent;

    // Check if marker is within the circle's radius AND matches the continent filter
    if (
      centerPoint.distanceTo(marker.getLatLng()) <= radiusMeters &&
      isCorrectContinent
    ) {
      marker.addTo(visibleMarkers);
      foundLocations.push(marker.options.title);
    }
  });

  const countElement = document.getElementById("radius-search-results-count");
  if (countElement) {
    countElement.textContent = `Found ${foundLocations.length} locations matching your criteria.`;
  }

  // Populate the results list below the map
  if (foundLocations.length > 0) {
    const ul = document.createElement("ul");
    foundLocations.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      ul.appendChild(li);
    });
    resultsList.appendChild(ul);
  } else {
    resultsList.innerHTML =
      "<p>No locations found within the specified criteria.</p>";
  }
}

// --- REVISED: Directions Map ---
let directionsMap, routingControl;

function initDirectionsMap() {
  if (directionsMap) {
    directionsMap.invalidateSize();
    return;
  }
  directionsMap = L.map("directions-map").setView([51.505, -0.09], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    directionsMap
  );

  // FIX: Initialize the routing control and add it to the map IMMEDIATELY.
  // This ensures it's "live" and can correctly manage its components like the itinerary container.
  routingControl = L.Routing.control({
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim(),
    itineraryContainer: document.getElementById(
      "directions-itinerary-container"
    ),
    waypoints: [], // Start with empty waypoints
  }).addTo(directionsMap); // <-- FIX: Add to map on creation

  // Clear the initial empty waypoints text if it appears
  routingControl.setWaypoints([]);

  document
    .getElementById("get-directions-from-user-btn")
    .addEventListener("click", getDirectionsFromUser);
  document
    .getElementById("get-directions-between-races-btn")
    .addEventListener("click", getDirectionsBetweenRaces);
  document
    .getElementById("clear-directions-selection-btn")
    .addEventListener("click", () => {
      document
        .querySelectorAll("#directions-race-list input:checked")
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
      // Also clear the route from the map
      routingControl.setWaypoints([]);
    });

  loadRacesForDirectionsSidebar();
}

async function loadRacesForDirectionsSidebar() {
  const list = document.getElementById("directions-race-list");
  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_races: 1 }),
    });
    const races = await response.json();
    list.innerHTML = ""; // Clear loading message
    races.forEach((race) => {
      if (race.latitude && race.longitude) {
        const li = document.createElement("li");
        li.innerHTML = `
          <label>
            <input type="checkbox" class="direction-race-checkbox" 
                   data-lat="${race.latitude}" 
                   data-lng="${race.longitude}" 
                   data-title="${race.title}">
            ${race.title}
          </label>
        `;
        list.appendChild(li);
      }
    });
  } catch (err) {
    list.innerHTML = "<li>Error loading races.</li>";
    console.error("Directions sidebar error:", err);
  }
}

function getSelectedWaypoints() {
  const waypoints = [];
  const checkedRaces = document.querySelectorAll(
    "#directions-race-list input:checked"
  );

  checkedRaces.forEach((checkbox) => {
    const lat = parseFloat(checkbox.dataset.lat);
    const lng = parseFloat(checkbox.dataset.lng);
    const title = checkbox.dataset.title;
    if (!isNaN(lat) && !isNaN(lng)) {
      waypoints.push(L.Routing.waypoint(L.latLng(lat, lng), title));
    }
  });

  return waypoints;
}

function getDirectionsFromUser() {
  const waypoints = getSelectedWaypoints();
  if (waypoints.length === 0) {
    alert("Please select at least one destination race.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = L.latLng(
        position.coords.latitude,
        position.coords.longitude
      );
      const allWaypoints = [
        L.Routing.waypoint(userLocation, "Your Location"),
        ...waypoints,
      ];

      // FIX: Just set the waypoints. The control is already on the map.
      routingControl.setWaypoints(allWaypoints);
    },
    () => {
      alert(
        "Unable to retrieve your location. Please enable location services."
      );
    }
  );
}

function getDirectionsBetweenRaces() {
  const waypoints = getSelectedWaypoints();
  if (waypoints.length < 2) {
    alert(
      "Please select at least two destination races to create a route between them."
    );
    return;
  }
  // FIX: Just set the waypoints. The control is already on the map.
  routingControl.setWaypoints(waypoints);
}

// --- MODIFIED: Polygon Drawing Map ---
let polygonMap,
  drawnItems,
  drawControl,
  selectedPolygonRace = null;

function initPolygonDrawingMap() {
  if (polygonMap) {
    polygonMap.invalidateSize();
    return;
  }
  polygonMap = L.map("polygon-map").setView([51.505, -0.09], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    polygonMap
  );

  drawnItems = new L.FeatureGroup();
  polygonMap.addLayer(drawnItems);

  drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: {
        allowIntersection: false,
        shapeOptions: { color: document.getElementById("polygon-color").value },
      },
      polyline: false,
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false,
    },
  });
  polygonMap.addControl(drawControl);

  polygonMap.on(L.Draw.Event.CREATED, function (e) {
    if (drawnItems.getLayers().length > 0) {
      alert(
        "Only one polygon can be added per race. Please edit the existing one."
      );
      return;
    }
    const layer = e.layer;
    const color = document.getElementById("polygon-color").value;
    layer.setStyle({ color: color, weight: 2.5, opacity: 1, fillOpacity: 0.3 });
    drawnItems.addLayer(layer);
    document.getElementById("save-polygon-btn").disabled = false;
  });

  polygonMap.on(
    "draw:edited",
    () => (document.getElementById("save-polygon-btn").disabled = false)
  );
  polygonMap.on(
    "draw:deleted",
    () => (document.getElementById("save-polygon-btn").disabled = false)
  );

  document
    .getElementById("save-polygon-btn")
    .addEventListener("click", savePolygon);
  document.getElementById("polygon-color").addEventListener("change", (e) => {
    const newColor = e.target.value;
    drawnItems.eachLayer((layer) => layer.setStyle({ color: newColor }));
    document.getElementById("save-polygon-btn").disabled = false;
  });

  loadRacesForPolygonSidebar();
}

async function loadRacesForPolygonSidebar() {
  const list = document.getElementById("polygon-race-list");
  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_races: 1 }),
    });
    const races = await response.json();
    list.innerHTML = ""; // Clear loading message
    races.forEach((race) => {
      const li = document.createElement("li");
      li.textContent = race.title;
      li.dataset.race = JSON.stringify(race);
      li.onclick = () => {
        list
          .querySelectorAll("li")
          .forEach((item) => item.classList.remove("active"));
        li.classList.add("active");
        selectedPolygonRace = race;
        loadPolygonForRace(race);
      };
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = "<li>Error loading races.</li>";
    console.error("Polygon sidebar error:", err);
  }
}

async function loadPolygonForRace(race) {
  drawnItems.clearLayers(); // Clear previous polygon
  document.getElementById("save-polygon-btn").disabled = true;

  if (race.latitude && race.longitude) {
    polygonMap.flyTo([race.latitude, race.longitude], 14);
  }

  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_polygon: 1, race_id: race.id }),
    });
    const data = await response.json();

    if (data && data.polygon_data) {
      const geoJsonLayer = L.geoJSON(JSON.parse(data.polygon_data), {
        style: {
          color: data.color || "#e10600",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.3,
        },
      });
      // Add the loaded GeoJSON layer's sub-layers to drawnItems
      geoJsonLayer.eachLayer((layer) => drawnItems.addLayer(layer));
      document.getElementById("polygon-color").value = data.color;
    }
  } catch (err) {
    console.error("Error loading polygon:", err);
    alert("Could not load polygon data for this race.");
  }
}

async function savePolygon() {
  if (!selectedPolygonRace) {
    alert("Please select a race from the list first.");
    return;
  }

  const layers = drawnItems.getLayers();
  if (layers.length === 0) {
    alert("There is no polygon to save. Please draw one first.");
    // Here you could add logic to delete the polygon from the DB if needed
    return;
  }

  const geoJSON = drawnItems.toGeoJSON();
  const polygonData = JSON.stringify(geoJSON);
  const color = document.getElementById("polygon-color").value;

  try {
    const response = await fetch("management.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        save_polygon: 1,
        race_id: selectedPolygonRace.id,
        polygon_data: polygonData,
        color: color,
      }),
    });
    const result = await response.json();
    if (result.success) {
      alert("Polygon saved successfully!");
      document.getElementById("save-polygon-btn").disabled = true;
    } else {
      alert("Failed to save polygon: " + result.message);
    }
  } catch (err) {
    console.error("Save polygon error:", err);
    alert("An unexpected error occurred while saving the polygon.");
  }
}

// --- Subscription and other functions remain the same ---

// Global popup functions for registration success
function goToSubscription() {
  document.getElementById("registerSuccessPopup").style.display = "none";
  // Navigate to subscription page logic here
  document.querySelector(".subscription-wrapper").style.display = "block";
}

function closePopup() {
  document.getElementById("registerSuccessPopup").style.display = "none";
}

const zoomLevels = {
  Azerbaijan: 7,
  Australia: 4,
  Austria: 7,
  Bahrain: 10,
  Belgium: 8,
  Brazil: 4,
  Canada: 4,
  China: 5,
  Hungary: 6,
  Indonesia: 5,
  Italy: 6,
  Japan: 6,
  Mexico: 5,
  Monaco: 13,
  Netherlands: 7,
  New_Zealand: 5,
  Qatar: 10,
  Singapore: 12,
  South_Korea: 7,
  Spain: 6,
  United_Arab_Emirates: 9,
  United_Kingdom: 6,
  United_States: 4,
};

let selectedPlan = null;
let isYearly = false;

// Initialize subscription interface
document.addEventListener("DOMContentLoaded", function () {
  updatePriceDisplay();
  setupBillingToggle();
});

// Billing toggle functionality
function setupBillingToggle() {
  const toggle = document.getElementById("billingToggle");
  const monthlyLabel = document.getElementById("monthlyLabel");
  const yearlyLabel = document.getElementById("yearlyLabel");

  toggle.addEventListener("click", function () {
    isYearly = !isYearly;

    toggle.classList.toggle("active", isYearly);
    monthlyLabel.classList.toggle("active", !isYearly);
    yearlyLabel.classList.toggle("active", isYearly);

    updatePriceDisplay();

    if (selectedPlan) {
      updateSelectedPlanInfo();
    }
  });
}

// Update price display based on billing cycle
function updatePriceDisplay() {
  const cards = document.querySelectorAll(".subscription-card");

  cards.forEach((card) => {
    const priceElement = card.querySelector(".plan-price");
    const periodElement = card.querySelector(".plan-period");
    if (periodElement) {
      periodElement.textContent = isYearly
        ? periodElement.getAttribute("data-yearly") || "per year"
        : periodElement.getAttribute("data-monthly") || "per month";
    }
  });
}

function selectPlan(planType) {
  document.querySelectorAll(".subscription-card").forEach((card) => {
    card.classList.remove("selected");
  });

  const selectedCard = document.querySelector(
    `.subscription-card[data-type="${planType}"]`
  );
  if (!selectedCard) {
    console.warn("No subscription card found for type:", planType);
    return;
  }

  selectedCard.classList.add("selected");

  const billingToggle = document.getElementById("billingToggle");
  const isYearly = billingToggle?.classList.contains("active");

  const price = isYearly
    ? selectedCard.getAttribute("data-yearly")
    : selectedCard.getAttribute("data-monthly");

  document.getElementById("selectedPlanName").textContent =
    planType.charAt(0).toUpperCase() + planType.slice(1);
  document.getElementById("selectedPlanPrice").textContent = `$${price}`;
  document.getElementById("mainSubscribeBtn").disabled = false;

  document.getElementById("mainSubscribeBtn").onclick = function () {
    fetch("management.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        update_subscription: 1,
        type: planType,
        billing_cycle: isYearly ? "yearly" : "monthly",
      }),
    })
      .then((res) => res.text())
      .then((result) => {
        if (result === "success") {
          alert("Subscription updated!");
          location.reload();
        } else {
          alert(result);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Something went wrong.");
      });
  };
}

function updateSelectedPlanInfo() {
  const infoDiv = document.getElementById("selectedPlanInfo");
  const nameSpan = document.getElementById("selectedPlanName");
  const priceSpan = document.getElementById("selectedPlanPrice");

  if (selectedPlan) {
    const planNames = {
      basic: "Free",
      pro: "F1 TV Pro",
      ultimate: "F1 TV Ultimate",
    };

    const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
    const period = isYearly ? "year" : "month";

    nameSpan.textContent = planNames[selectedPlan.type];
    priceSpan.textContent = price === 0 ? "Free" : `$${price}/${period}`;

    infoDiv.classList.add("show");
  } else {
    infoDiv.classList.remove("show");
  }
}

function updateSubscribeButton() {
  const btn = document.getElementById("mainSubscribeBtn");

  if (selectedPlan) {
    btn.disabled = false;

    if (selectedPlan.type === "basic") {
      btn.textContent = "Continue with Free Plan";
    } else {
      const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
      const period = isYearly ? "year" : "month";
      btn.textContent = `Subscribe for $${price}/${period}`;
    }

    btn.onclick = function () {
      handleSubscription();
    };
  } else {
    btn.disabled = true;
    btn.textContent = "Select a Plan to Continue";
    btn.onclick = null;
  }
}

function handleSubscription() {
  if (!selectedPlan) {
    alert("Please select a plan first.");
    return;
  }

  const planNames = {
    basic: "Free",
    pro: "F1 TV Pro",
    ultimate: "F1 TV Ultimate",
  };

  const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
  const period = isYearly ? "yearly" : "monthly";
  const planName = planNames[selectedPlan.type];

  if (selectedPlan.type === "basic") {
    alert(
      `You've selected the ${planName} plan. Your account will continue with free access.`
    );
  } else {
    const confirmMessage =
      `Proceeding with ${planName} subscription:\n\n` +
      `Plan: ${planName}\n` +
      `Billing: ${period}\n` +
      `Price: $${price}/${isYearly ? "year" : "month"}\n\n` +
      `Continue to payment?`;

    if (confirm(confirmMessage)) {
      alert(
        "Redirecting to secure payment...\n\n(In a real application, this would process the payment)"
      );
      console.log("Subscription data:", {
        plan: selectedPlan.type,
        price: price,
        billing: period,
        yearly: isYearly,
      });
    }
  }
}

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    document.activeElement.classList.contains("subscription-card")
  ) {
    const planType = document.activeElement.getAttribute("data-type");
    selectPlan(planType);
  }
});

document.querySelectorAll(".subscription-card").forEach((card) => {
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `Select ${card.querySelector(".plan-name").textContent} plan`
  );
});

document
  .getElementById("cancelBtn")
  ?.addEventListener("click", async function () {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      const response = await fetch("management.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ cancel_subscription: 1 }),
      });

      const result = await response.text();

      if (result.trim() === "success") {
        alert("Subscription successfully cancelled.");
        location.reload();
      } else {
        alert("Failed to cancel: " + result);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("An error occurred. Try again.");
    }
  });

document.getElementById("upgradeBtn")?.addEventListener("click", function () {
  const subscriptionTab = document.querySelector(".pagelinks.subscription");

  if (subscriptionTab) {
    subscriptionTab.click();
    document
      .querySelectorAll(".nav-tabs li")
      .forEach((li) => li.classList.remove("active"));
    subscriptionTab.closest("li").classList.add("active");
  }
});

async function loadLogs() {
  const logContainer = document.getElementById("logContent");
  if (!logContainer) return;

  try {
    const res = await fetch("admin/get_logs.php");
    const text = await res.text();
    logContainer.textContent = text;
    logContainer.scrollTop = logContainer.scrollHeight;
  } catch (err) {
    logContainer.textContent = "⚠️ Failed to load logs.";
    console.error("Log fetch error:", err);
  }
}

document
  .querySelector(".pagelinks.order-history")
  ?.addEventListener("click", loadLogs);
document.getElementById("refreshLogsBtn")?.addEventListener("click", loadLogs);

document
  .getElementById("openProfileEditorBtn")
  ?.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("profileEditorOverlay").style.display = "flex";
  });

function closeProfileEditor() {
  document.getElementById("profileEditorOverlay").style.display = "none";
}

document
  .getElementById("profileEditorForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();

      if (result === "success") {
        alert("Profile updated successfully!");
      } else {
        document.querySelector(".alert-danger .control-label").textContent =
          result;
        document.querySelector(".alert-danger").style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      document.querySelector(".alert-danger .control-label").textContent =
        "Unexpected error occurred.";
      document.querySelector(".alert-danger").style.display = "block";
    }
  });

document
  .getElementById("openResetPassword")
  ?.addEventListener("click", function () {
    document.querySelector(".profile-editor-wrapper").style.display = "none";
    document.querySelector(".forgetPassword-wrapper").style.display = "block";
  });

document.querySelector(".backtologin")?.addEventListener("click", function (e) {
  e.preventDefault();
  document.querySelector(".forgetPassword-wrapper").style.display = "none";
  document.querySelector(".login-wrapper").style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("forgetPasswordForm");

  form?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      if (result.trim() === "success") {
        alert("Password successfully reset!");
        closeForgotPassword();
      } else {
        alert(result);
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const forgotLink = document.getElementById("openForgotPasswordFromProfile");
  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("profileEditorOverlay").style.display = "none";
      document.getElementById("forgotPasswordOverlay").style.display = "block";
    });
  }

  const backToLoginBtn = document.querySelector(".backtologin");
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      backToLoginFromForgot();
    });
  }
});

function closeForgotPassword() {
  backToLoginFromForgot();
}

function backToLoginFromForgot() {
  document.getElementById("forgotPasswordOverlay").style.display = "none";
  document.querySelector(".login-wrapper").style.display = "block";
  const loginTab = document.querySelector("a.pagelinks.login")?.parentElement;
  const registerTab = document.querySelector(
    "a.pagelinks.register"
  )?.parentElement;
  if (loginTab) loginTab.classList.add("active");
  if (registerTab) registerTab.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const resetForm = document.getElementById("forgetPasswordForm");
  const newPassword = document.getElementById("new-password");
  const confirmPassword = document.getElementById("confirm-password");

  resetForm?.addEventListener("submit", function (e) {
    newPassword.classList.remove("input-error");
    confirmPassword.classList.remove("input-error");

    if (newPassword.value !== confirmPassword.value) {
      e.preventDefault();
      confirmPassword.classList.add("input-error");
      alert("Passwords do not match. Please confirm your password.");
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // --- Global State ---
  let allRaces = [];
  let directionsMap, directionsControl;
  let isDirectionsMapInitialized = false;

  // --- Race Data Loading ---
  async function loadAllRaces() {
    if (allRaces.length > 0) return; // Don't reload if already fetched
    try {
      const response = await fetch(window.location.href, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "get_races=true",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      allRaces = await response.json();

      // Populate all relevant sidebars once data is loaded
      populateDirectionsSidebar();
      // populatePolygonSidebar(); // Placeholder for other tools
    } catch (error) {
      console.error("Failed to load race data:", error);
      document.getElementById("directions-race-list").innerHTML =
        "<li>Error loading races.</li>";
      // document.getElementById('polygon-race-list').innerHTML = '<li>Error loading races.</li>';
    }
  }

  // --- Tab Navigation ---
  const navLinks = document.querySelectorAll(".nav-tabs .pagelinks");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);

      // Handle active tab style
      navLinks.forEach((l) => l.parentElement.classList.remove("active"));
      this.parentElement.classList.add("active");

      // Show/hide content wrappers
      document.querySelectorAll(".wrappers").forEach((wrapper) => {
        wrapper.style.display = "none";
      });
      document.querySelector(`.${targetId}-wrapper`).style.display = "block";

      // Initialize map if it's a map tab and not already initialized
      if (targetId === "directions" && !isDirectionsMapInitialized) {
        initDirectionsMap();
        isDirectionsMapInitialized = true;
      }
      // Add similar checks for other map tabs like 'radius-search', 'polygon-drawing'
    });
  });

  // --- Directions Tab Functionality ---

  function initDirectionsMap() {
    directionsMap = L.map("directions-map").setView([20, 0], 2); // Global view
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(directionsMap);

    // The key part: initialize the routing control
    initDirectionsControl();

    // Load race data to populate the sidebar
    loadAllRaces();

    // Attach event listeners for buttons
    document
      .getElementById("get-directions-from-user-btn")
      .addEventListener("click", getDirectionsFromUser);
    document
      .getElementById("get-directions-between-races-btn")
      .addEventListener("click", getDirectionsBetweenRaces);
    document
      .getElementById("clear-directions-selection-btn")
      .addEventListener("click", clearDirections);
  }

  function initDirectionsControl() {
    const itineraryContainer = document.getElementById(
      "directions-results-list"
    );

    directionsControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: false,
      geocoder: L.Control.Geocoder.nominatim(),
      show: false,
      addWaypoints: false,
    }).addTo(directionsMap);

    // Custom event handler for when a route is found
    directionsControl.on("routesfound", function (e) {
      itineraryContainer.innerHTML = ""; // Clear placeholder/previous results
      const route = e.routes[0];

      const summaryDiv = document.createElement("div");
      summaryDiv.className = "route-summary";
      summaryDiv.innerHTML = `
              <strong>Route Summary</strong><br>
              Total distance: ${(route.summary.totalDistance / 1000).toFixed(
                2
              )} km<br>
              Total time: ${Math.round(route.summary.totalTime / 60)} minutes
          `;
      itineraryContainer.appendChild(summaryDiv);

      const instructions = route.instructions;
      const instructionList = document.createElement("ol");
      instructions.forEach(function (instr) {
        const li = document.createElement("li");
        li.innerHTML = `${
          instr.text
        } <span style="color:#555; font-size:0.9em;">(${(
          instr.distance / 1000
        ).toFixed(2)} km)</span>`;
        instructionList.appendChild(li);
      });
      itineraryContainer.appendChild(instructionList);
    });

    // Custom handler for errors
    directionsControl.on("routingerror", function (e) {
      itineraryContainer.innerHTML = `<p style="color: red;">Error: ${e.error.message}</p>`;
    });
  }

  function populateDirectionsSidebar() {
    const list = document.getElementById("directions-race-list");
    list.innerHTML = ""; // Clear "Loading..."
    if (allRaces.length === 0) {
      list.innerHTML = "<li>No races found.</li>";
      return;
    }

    allRaces.forEach((race) => {
      if (race.latitude && race.longitude) {
        // Only add races with coordinates
        const li = document.createElement("li");
        li.textContent = race.title;
        li.dataset.raceId = race.id;
        li.dataset.lat = race.latitude;
        li.dataset.lng = race.longitude;
        li.addEventListener("click", () => {
          li.classList.toggle("selected");
        });
        list.appendChild(li);
      }
    });
  }

  function getSelectedRaces() {
    return Array.from(
      document.querySelectorAll("#directions-race-list li.selected")
    );
  }

  function getDirectionsFromUser() {
    const selectedRaces = getSelectedRaces();
    if (selectedRaces.length !== 1) {
      alert("Please select exactly one destination race from the list.");
      return;
    }
    const destinationRace = selectedRaces[0];
    const destLat = parseFloat(destinationRace.dataset.lat);
    const destLng = parseFloat(destinationRace.dataset.lng);

    if (isNaN(destLat) || isNaN(destLng)) {
      alert("The selected race has invalid coordinates.");
      return;
    }

    const destinationPoint = L.latLng(destLat, destLng);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const startPoint = L.latLng(
          position.coords.latitude,
          position.coords.longitude
        );
        directionsControl.setWaypoints([startPoint, destinationPoint]);
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  }

  // *** MODIFIED FUNCTION ***
  function getDirectionsBetweenRaces() {
    const selectedRaces = getSelectedRaces();
    if (selectedRaces.length < 2) {
      alert("Please select at least two races to route between them.");
      return;
    }

    // *** FIX: Explicitly create L.Routing.waypoint objects and parse coordinates ***
    // This is more robust for multi-stop routes.
    const waypoints = selectedRaces.map((raceEl) => {
      const lat = parseFloat(raceEl.dataset.lat);
      const lng = parseFloat(raceEl.dataset.lng);

      // We create a named waypoint, which is better practice.
      return L.Routing.waypoint(L.latLng(lat, lng), raceEl.textContent);
    });

    // Filter out any potential waypoints with invalid coordinates (NaN)
    const validWaypoints = waypoints.filter(
      (wp) => wp.latLng && !isNaN(wp.latLng.lat) && !isNaN(wp.latLng.lng)
    );

    if (validWaypoints.length < 2) {
      alert(
        "Not enough valid races selected to create a route. Please check their coordinates."
      );
      return;
    }

    directionsControl.setWaypoints(validWaypoints);
  }

  function clearDirections() {
    // Clear waypoints from the control
    directionsControl.setWaypoints([]);

    // Deselect all items in the list
    getSelectedRaces().forEach((li) => li.classList.remove("selected"));

    // Clear the results list
    document.getElementById("directions-results-list").innerHTML =
      "<p>Perform a search to see the route itinerary here.</p>";
  }

  // --- Other Initializations (if any) ---
  // Placeholder for other logic from admin.js that might be needed
});
