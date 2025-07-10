<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>F1 Schedule</title>
    <link rel="stylesheet" href="resources/css/index.css" />
    <link rel="icon" href="resources/img/f1logo.svg" type="image/x-icon" />

    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</head>

<body>
    <header>
        <section class="nav-global">
            <nav class="global-nav" aria-label="Global Navigation Menu">
                <ul aria-label="Brand Links" class="g-brand-links">
                    <li>
                        <a href="https://www.fia.com/" target="_blank">
                            <img alt="FIA" width="37" height="25"
                                src="https://media.formula1.com/image/upload/f_auto,c_limit,w_55,q_auto/etc/designs/fom-website/images/fia_logo" />
                        </a>
                    </li>
                    <li>
                        <a href="https://www.fiaformula2.com/" target="_blank">
                            <span>F1™</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.fiaformula2.com/" target="_blank">
                            <span>F2™</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.fiaformula3.com/" target="_blank">
                            <span>F3™</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.f1academy.com/" target="_blank">
                            <span>F1 ACADEMY™</span>
                        </a>
                    </li>
                </ul>

                <ul aria-label="Commercial Links" class="g-commercial-links">
                    <li>
                        <a class="commercial-link" href="https://www.f1authentics.com/" target="_blank">Authentics</a>
                    </li>
                    <li>
                        <a class="commercial-link" href="https://f1store.formula1.com/" target="_blank">Store</a>
                    </li>
                    <li>
                        <a class="commercial-link" href="https://tickets.formula1.com" target="_blank">Tickets</a>
                    </li>
                    <li>
                        <a class="commercial-link" href="https://tickets.formula1.com/en/h-formula1-hospitality"
                            target="_blank">Hospitality</a>
                    </li>
                    <li>
                        <a class="commercial-link" href="https://f1experiences.com/" target="_blank">Experiences</a>
                    </li>
                    <li>
                        <a class="commercial-link" href="https://f1tv.formula1.com" target="_blank">
                            <img alt="F1® TV" width="75" height="12"
                                src="https://media.formula1.com/image/upload/f_auto,c_limit,w_112,q_auto/nwp-navigation/f1-tv-logo" />
                        </a>
                    </li>
                </ul>

                <div class="g-auth-buttons">
                    <a class="btn signin-btn" href="management.php">
                        <span class="icon-user"></span>
                        <span>Sign In</span>
                    </a>
                    <a class="btn subscribe-btn" href="/subscribe-to-f1-tv">
                        <span>Subscribe</span>
                    </a>
                </div>
                <!-- Hamburger menu for mobile -->
                <button class="hamburger-menu" aria-label="Open menu"
                    onclick="document.body.classList.add('menu-open');">
                    ☰
                </button>
            </nav>
        </section>
        <section class="nav-main">
            <nav class="main-nav" aria-label="Main Navigation Menu">
                <div class="logo">
                    <img src="https://media.formula1.com/image/upload/f_auto,c_limit,w_285,q_auto/f_auto/q_auto/fom-website/etc/designs/fom-website/images/F1_75_Logo"
                        alt="F1 Logo" />
                </div>

                <ul class="nav-links">
                    <li><a href="main/index.html">latest</a></li>
                    <li><a href="/video">Video</a></li>
                    <li><a href="/f1-unlocked">F1 Unlocked</a></li>
                    <li><a href="/schedule">Schedule</a></li>
                    <li><a href="/results">Results</a></li>
                    <li><a href="/drivers">Drivers</a></li>
                    <li><a href="/teams">Teams</a></li>
                    <li><a href="/gaming">Gaming</a></li>
                    <li><a href="/live-timing">Live Timing</a></li>
                </ul>
            </nav>
        </section>
        <div class="overlay-menu">
            <div class="overlay-menu-content">
                <button class="close-overlay" aria-label="Close menu"
                    onclick="document.body.classList.remove('menu-open')">&times;</button>
                <div class="logo">
                    <img src="https://media.formula1.com/image/upload/f_auto,c_limit,w_285,q_auto/f_auto/q_auto/fom-website/etc/designs/fom-website/images/F1_75_Logo"
                        alt="F1 Logo" />
                </div>

                <div class="overlay-global-nav">
                    <h3>Formula 1 Family</h3>
                    <ul class="brand-links">
                        <li>
                            <a href="/">
                                <img src="resources/img/1024px-F1.png" alt="F1®" style="height:24px;" />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.fiaformula2.com/" target="_blank">
                                <img src="resources/img/f2_logo.png" alt="F2™" style="height:24px;" />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.fiaformula3.com/" target="_blank">
                                <img src="resources/img/f3_logo.png" alt="F3™" style="height:24px;" />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.f1academy.com/" target="_blank">
                                <img src="resources/img/f1academy.png" alt="F1 ACADEMY™" style="height:24px;" />
                            </a>
                        </li>
                    </ul>

                    <h3>Services</h3>
                    <ul class="commercial-links">
                        <li>
                            <a href="https://f1store.formula1.com/en/" target="_blank">Store</a>
                        </li>
                        <li>
                            <a href="https://tickets.formula1.com" target="_blank">Tickets</a>
                        </li>
                        <li>
                            <a href="https://tickets.formula1.com/en/h-formula1-hospitality"
                                target="_blank">Hospitality</a>
                        </li>
                        <li>
                            <a href="https://www.f1authentics.com/" target="_blank">Authentics</a>
                        </li>
                        <li>
                            <a href="https://f1experiences.com/" target="_blank">Experiences</a>
                        </li>
                    </ul>
                </div>

                <div class="overlay-main-nav">
                    <h3>Navigation</h3>
                    <ul class="nav-links">
                        <li>Latest</li>
                        <li>Video</li>
                        <li>F1 Unlocked</li>
                        <li>Schedule</li>
                        <li>Results</li>
                        <li>Drivers</li>
                        <li>Teams</li>
                        <li>Gaming</li>
                        <li>Live Timing</li>
                    </ul>
                </div>

                <div class="profile-links">
                    <div class="sign-in-link">
                        <a href="management.php">Sign In</a>
                    </div>
                    <div class="subscribe-link">
                        <a href="/subscribe-to-f1-tv">Subscribe to F1 TV</a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <section class="f1-header">
            <div class="f1-header-bar" style="padding: 8px 0">
                <hr style="border: none; border-top: 20px solid #e10600; margin: 0 0 4px 0;" />
            </div>
            <div class="f1-header-content">
                <div class="f1-header-title">
                    <h1>F1 Schedule 2026</h1>
                    <p>2026 FIA FORMULA ONE WORLD CHAMPIONSHIP™ RACE CALENDAR</p>
                </div>
            </div>
        </section>
        <section class="race-grid" id="raceGrid">
            <div class="race-container">
                <?php
            require_once 'admin/connection.php';
            $result = $pdo->query("SELECT * FROM races ORDER BY date ASC");
            $round = 1;

            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
              echo '<label class="race-flip">';
              echo '<input type="checkbox" class="race-toggle" />';
            
              echo '<div class="race-card" data-lat="' . $row['latitude'] . '" data-lng="' . $row['longitude'] . '">';
              echo '<div class="front">';
            
              // Header
              echo '<div class="race-header">';
              echo '<div class="race-round">Round ' . $round++ . '</div>';
              echo '<div class="race-date">📅 ' . date("d M Y", strtotime($row['date'])) . '</div>';
              echo '</div>';
            
              // Location and Title
              echo '<div class="race-title">' . $row['title'] . '</div>';
              echo '<div class="race-location-title">';
              echo '<img class="race-flag" style="height: 24px;" src="resources/img/flags/' . $row['country'] . '.png" alt="Flag">';
              echo '<span class="race-title">' . $row['location'] . '</span>';
              echo '</div>';
            
              echo '<div class="race-full-title">' . $row['full_title'] . '</div>';
            
              echo '</div>'; // end .front
            
              // Back side (Leaflet map)
              echo '<div class="back">';
              echo '<div class="map-preview-container">';
              echo '<div class="map-preview" style="width: 100%; height: 140px;"></div>';
              echo '</div>';
              echo '</div>'; // end .back
            
              echo '</div>'; // end .race-card
              echo '</label>';
            }      
          ?>
            </div>
        </section>

        <!-- Leaflet JavaScript -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

        <script src="/resources/js/index.js"></script>

        <script>
            // Initialize Leaflet maps for flip cards
            document.addEventListener('DOMContentLoaded', function () {
                const raceCards = document.querySelectorAll('.race-card');

                raceCards.forEach(card => {
                    const toggle = card.parentElement.querySelector('.race-toggle');

                    toggle.addEventListener('change', function () {
                        if (this.checked) {
                            // Card is flipped to back - initialize map
                            setTimeout(() => {
                                const mapDiv = card.querySelector('.map-preview');
                                const lat = parseFloat(card.dataset.lat);
                                const lng = parseFloat(card.dataset.lng);

                                if (!mapDiv.dataset.initialized) {
                                    const map = L.map(mapDiv).setView([lat, lng], 14);

                                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                        attribution: '© OpenStreetMap contributors'
                                    }).addTo(map);

                                    L.marker([lat, lng]).addTo(map);

                                    mapDiv.dataset.initialized = 'true';
                                }
                            }, 100); // Small delay to ensure flip animation completes
                        }
                    });
                });
            });
        </script>
    </main>
</body>

</html>