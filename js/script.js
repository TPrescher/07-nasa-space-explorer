// NASA API key
const API_KEY = "4mTOcCDF7tsvdHjlN96wfAhLVax7SGuPjnYpCvc5";

// NASA color palette (for reference)
// --nasa-primary: #105bd8;
// --nasa-primary-dark: #0b3d91;
// --nasa-gray: #e1e4e5;
// --nasa-white: #fff;
// --nasa-black: #222;

// Space facts for random display
const spaceFacts = [
  "Did you know? The Sun accounts for 99.86% of the mass in our solar system!",
  "Did you know? A day on Venus is longer than its year.",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second!",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has 95 known moons as of 2025.",
  "Did you know? The Milky Way galaxy will collide with Andromeda in about 4.5 billion years.",
  "Did you know? Space is completely silent—there's no air for sound to travel.",
  "Did you know? The largest volcano in the solar system is on Mars: Olympus Mons.",
  "Did you know? Saturn could float in water because it's mostly made of gas.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? The Hubble Space Telescope has traveled over 4 billion miles in orbit!"
];
let factIndex = 0;
let factInterval = null;

// Utility: Fetch APOD data for a given date, with error handling
function fetchAPOD(date) {
  // Build the API URL
  let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  if (date) url += `&date=${date}`;
  // Fetch the data from NASA's API
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      // If the API returns an error, return null
      if (data.code || data.error) return null;
      return data;
    })
    .catch(() => null); // On network error, return null
}

// Utility: Get an array of consecutive dates (YYYY-MM-DD), going backward
function getConsecutiveDates(endDate, count = 9) {
  const dates = [];
  let date = new Date(endDate);
  for (let i = 0; i < count; i++) {
    dates.unshift(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() - 1);
  }
  return dates;
}

// Show a random space fact in #space-fact
function showRandomFact() {
  const factDiv = document.getElementById('space-fact');
  if (factDiv) {
    const idx = Math.floor(Math.random() * spaceFacts.length);
    factDiv.textContent = spaceFacts[idx];
  }
}

// Show the animated planet loader
function showLoader() {
  const loader = document.getElementById("planet-loader");
  if (loader) loader.style.display = "flex";
}

// Hide the animated planet loader
function hideLoader() {
  const loader = document.getElementById("planet-loader");
  if (loader) loader.style.display = "none";
}

// --- THEME & FACT BANNER ---
function updateFactBanner() {
  const factDiv = document.getElementById('space-fact');
  if (factDiv) {
    factDiv.textContent = spaceFacts[factIndex];
  }
}

function startFactCycle() {
  updateFactBanner();
  if (factInterval) clearInterval(factInterval);
  factInterval = setInterval(() => {
    factIndex = (factIndex + 1) % spaceFacts.length;
    updateFactBanner();
  }, 10000);
}

function setTheme(mode) {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  if (mode === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    if (toggle) {
      toggle.classList.remove('btn-outline-dark');
      toggle.classList.add('btn-outline-light');
      toggle.textContent = 'Light';
    }
  } else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    if (toggle) {
      toggle.classList.remove('btn-outline-light');
      toggle.classList.add('btn-outline-dark');
      toggle.textContent = 'Dark';
    }
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.onclick = function() {
      if (document.body.classList.contains('dark-mode')) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    };
  }
}

// --- SET END DATE TO TODAY ---
// Removed redundant setEndDateToToday function. Logic is handled in setupDateInputsWithNote.

// Utility: Set up date pickers for a 9-day range, end date always today or start+8
function setupDateInputsWithNote(startInput, endInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  // Set min/max for both inputs
  startInput.max = todayStr;
  endInput.max = todayStr;
  // Default: last 9 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 8);
  startInput.value = lastWeek.toISOString().split('T')[0];
  endInput.value = todayStr;
  endInput.readOnly = true;
  // When start changes, update end
  startInput.addEventListener('change', () => {
    const startDate = new Date(startInput.value);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 8);
    const endStr = endDate > today ? todayStr : endDate.toISOString().split('T')[0];
    endInput.value = endStr;
  });
  // Add a user note below the filters if not present
  let note = document.getElementById('date-note');
  if (!note) {
    note = document.createElement('div');
    note.id = 'date-note';
    note.className = 'text-center text-secondary mb-3';
    note.style.fontSize = '1em';
    note.textContent = 'Select a start date. You’ll see 9 days of images up to today.';
    const filters = document.querySelector('.filters');
    if (filters && filters.parentNode) {
      filters.parentNode.insertBefore(note, filters.nextSibling);
    }
  }
}

// --- MAIN INIT ---
function init() {
  // Set Google Font globally
  document.body.style.fontFamily = "'Barlow', 'Helvetica Neue', Arial, sans-serif";

  // Modal close events
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.onclick = hideModal;
  if (modal) {
    modal.onclick = function(event) {
      if (event.target === modal) hideModal();
    };
  }

  // Date input setup (if using dateRange.js)
  if (typeof setupDateInputs === 'function') {
    setupDateInputs(
      document.getElementById('startDate'),
      document.getElementById('endDate')
    );
  }
  // Use improved date picker setup
  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');
  if (startInput && endInput) {
    setupDateInputsWithNote(startInput, endInput);
  }

  // On page load, fetch most recent APOD, then 9 valid entries
  async function loadRecentGallery() {
    showLoader();
    try {
      const latest = await fetchAPOD();
      const data = await fetchValidAPODs(latest.date, 9, 20);
      renderGallery(data);
    } catch (e) {
      document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load images.</div>';
    }
    hideLoader();
  }
  loadRecentGallery();

  // Button click: fetch 9 valid entries from selected end date
  const button = document.querySelector('.filters button');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  if (button && endDateInput && startDateInput) {
    button.onclick = async function() {
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      if (!startDate || !endDate) return;
      if (!isValidDateRange(startDate, endDate, 9)) {
        alert("Please select a date range of 9 days or less.");
        return;
      }
      showLoader();
      try {
        const data = await fetchValidAPODs(endDate, 9, 20);
        renderGallery(data);
      } catch (e) {
        document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load images.</div>';
      }
      hideLoader();
    };
  }

  // Start in dark mode
  setTheme('dark');
  // Start cycling facts
  startFactCycle();
  // Setup theme toggle
  setupThemeToggle();
  // No need to call setEndDateToToday (handled above)
}

document.addEventListener('DOMContentLoaded', init);

// --- GALLERY & MODAL RENDERING ---
function renderGallery(dataArray) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  dataArray.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item col-12 col-sm-6 col-md-4 col-lg-3 p-0';
    card.style.background = '';
    card.style.border = '';
    card.style.cursor = 'pointer';
    card.style.transition = '';
    card.onmouseover = () => card.style.transform = 'scale(1.04)';
    card.onmouseout = () => card.style.transform = 'scale(1)';
    // Media: image or video preview
    let media;
    if (item.media_type === 'image') {
      media = document.createElement('img');
      media.src = item.url;
      media.alt = item.title;
      media.style.width = '100%';
      media.style.height = '220px';
      media.style.objectFit = 'cover';
      media.style.borderRadius = '12px 12px 0 0';
      media.style.display = 'block';
    } else if (item.media_type === 'video') {
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        media = document.createElement('div');
        media.style.position = 'relative';
        media.style.height = '220px';
        media.style.background = '#000';
        const playIcon = document.createElement('span');
        playIcon.textContent = '▶';
        playIcon.style.position = 'absolute';
        playIcon.style.top = '50%';
        playIcon.style.left = '50%';
        playIcon.style.transform = 'translate(-50%, -50%)';
        playIcon.style.fontSize = '48px';
        playIcon.style.color = '#fff';
        media.appendChild(playIcon);
      } else {
        media = document.createElement('a');
        media.href = item.url;
        media.textContent = 'View Video';
        media.target = '_blank';
        media.style.display = 'block';
        media.style.textAlign = 'center';
        media.style.padding = '80px 0';
        media.style.background = '#222';
        media.style.color = '#fff';
        media.style.borderRadius = '12px 12px 0 0';
      }
    }
    // Title and date
    const title = document.createElement('h3');
    title.textContent = item.title;
    title.className = 'px-3 pt-3 mb-1 fw-bold';
    title.style.fontFamily = "'Barlow', 'Helvetica Neue', Arial, sans-serif";
    title.style.color = '';
    const date = document.createElement('p');
    date.textContent = item.date;
    date.className = 'px-3 mb-2';
    date.style.fontWeight = 'bold';
    date.style.color = '';
    // Add elements to card
    card.appendChild(media);
    card.appendChild(title);
    card.appendChild(date);
    // Click opens modal
    card.addEventListener('click', function() {
      showModal(item);
    });
    gallery.appendChild(card);
  });
}

function showModal(item) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalContent) return;
  modalContent.innerHTML = '';
  // Title
  const title = document.createElement('h2');
  title.textContent = item.title;
  title.className = 'fw-bold mb-2';
  title.style.fontFamily = "'Barlow', 'Helvetica Neue', Arial, sans-serif";
  // Date
  const date = document.createElement('p');
  date.textContent = item.date;
  date.className = 'mb-2';
  date.style.fontWeight = 'bold';
  // Media
  let media;
  if (item.media_type === 'image') {
    media = document.createElement('img');
    media.src = item.hdurl || item.url;
    media.alt = item.title;
    media.style.width = '100%';
    media.style.maxHeight = '60vh';
    media.style.objectFit = 'contain';
    media.style.background = '#222';
    media.style.borderRadius = '8px';
  } else if (item.media_type === 'video') {
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      media = document.createElement('iframe');
      media.src = item.url;
      media.width = '100%';
      media.height = '400';
      media.allowFullscreen = true;
      media.style.border = 'none';
      media.style.background = '#000';
      media.style.borderRadius = '8px';
    } else {
      media = document.createElement('a');
      media.href = item.url;
      media.textContent = 'View Video';
      media.target = '_blank';
      media.style.display = 'block';
      media.style.textAlign = 'center';
      media.style.padding = '80px 0';
      media.style.background = '#222';
      media.style.color = '#fff';
      media.style.borderRadius = '8px';
    }
  }
  // Explanation
  const explanation = document.createElement('p');
  explanation.textContent = item.explanation;
  explanation.className = 'mt-3';
  // Add to modal
  modalContent.appendChild(title);
  modalContent.appendChild(date);
  modalContent.appendChild(media);
  modalContent.appendChild(explanation);
  modal.style.display = 'block';
}

function hideModal() {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  if (modal) modal.style.display = 'none';
  if (modalContent) modalContent.innerHTML = '';
}

// Utility: Fetch up to 'count' valid APOD entries (image or video), going backward from a given end date
async function fetchValidAPODs(endDate, count = 9, maxTries = 20) {
  const results = [];
  let tries = 0;
  let date = new Date(endDate);
  while (results.length < count && tries < maxTries) {
    const dateStr = date.toISOString().split('T')[0];
    const apod = await fetchAPOD(dateStr);
    if (apod && (apod.media_type === 'image' || apod.media_type === 'video')) {
      results.unshift(apod); // Add to start to keep chronological order
    }
    date.setDate(date.getDate() - 1);
    tries++;
  }
  return results;
}

// Utility: Validate date range (maxDays inclusive)
function isValidDateRange(start, end, maxDays = 9) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < maxDays;
}
