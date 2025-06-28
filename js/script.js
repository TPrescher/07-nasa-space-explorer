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

// Global variables to store the current gallery data and active filter
let currentGalleryData = [];
let currentFilter = 'all'; // Default filter is 'all'

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

// Show the NASA logo loader
function showLoader() {
  const loader = document.getElementById("loadingBanner");
  if (loader) loader.style.display = "flex";
}

// Hide the NASA logo loader
function hideLoader() {
  const loader = document.getElementById("loadingBanner");
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
      // If the latest APOD fetch fails, we can't proceed.
      if (!latest || !latest.date) {
        throw new Error('Could not fetch the latest APOD data.');
      }
      // Fetch the initial data for the gallery
      const data = await fetchValidAPODs(latest.date, 9, 20);
      // Store the fetched data so filters can use it
      currentGalleryData = data;
      // Render the gallery with the "All" filter by default
      applyFilter('all');
    } catch (e) {
      // Display a user-friendly error message in the gallery
      document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load space images. Please try again later.</div>';
      console.error(e); // Log the actual error for debugging
    } finally {
      hideLoader(); // Always hide loader, even if an error occurs
    }
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
        currentGalleryData = data; // Store fetched data
        applyFilter(currentFilter); // Render with the current filter
      } catch (e) {
        // Display a user-friendly error message in the gallery
        document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load images. Please try again.</div>';
        console.error(e); // Log the actual error for debugging
      } finally {
        hideLoader(); // Always hide loader, even if an error occurs
      }
    };
  }

  // Start in dark mode
  setTheme('dark');
  // Start cycling facts
  startFactCycle();
  // Setup theme toggle
  setupThemeToggle();
  // Setup filter buttons
  setupFilterButtons();
  // No need to call setEndDateToToday (handled above)
}

document.addEventListener('DOMContentLoaded', init);

// --- FILTER LOGIC ---
function setupFilterButtons() {
  const filterButtons = document.querySelector('.filters-container .btn-group');
  if (filterButtons) {
    filterButtons.addEventListener('click', (e) => {
      if (e.target.matches('button')) {
        // Remove active class from all buttons
        filterButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        e.target.classList.add('active');
        // Get the filter from the button's ID
        const filter = e.target.id.replace('filter', '').toLowerCase();
        // Update the global currentFilter variable
        currentFilter = filter;
        // Apply the filter to the gallery
        applyFilter(currentFilter);
      }
    });
  }
}

async function applyFilter(filter) {
  // Check if we have data to filter
  if (!currentGalleryData || currentGalleryData.length === 0) {
    console.log('No data to filter');
    renderGallery([]);
    return;
  }

  console.log(`Applying filter: ${filter}`);
  console.log('Current gallery data:', currentGalleryData.map(item => ({ title: item.title, media_type: item.media_type })));

  // A map of functions for each filter type. This makes adding new filters easy.
  const filterMap = {
    // The 'all' filter simply returns all the data we've fetched.
    all: data => {
      console.log('All filter: returning all data');
      return data;
    },
    // The 'image' filter returns only items that are images.
    image: data => {
      const images = data.filter(item => item.media_type === 'image');
      console.log(`Image filter: found ${images.length} images`);
      return images;
    },
    // Support both 'image' and 'images' for flexibility
    images: data => {
      const images = data.filter(item => item.media_type === 'image');
      console.log(`Images filter: found ${images.length} images`);
      return images;
    },
    // The 'video' filter is special. It ensures we show up to 9 videos,
    // even if it means fetching more from the past.
    video: async data => {
      console.log('Video filter: starting');
      // First, find any videos in the currently loaded data.
      let videos = data.filter(item => item.media_type === 'video');
      console.log(`Video filter: found ${videos.length} videos in current data`);
      
      // If we already have 9 or more videos, we can just show them.
      if (videos.length >= 9) {
        console.log('Video filter: returning first 9 videos');
        return videos.slice(0, 9); // Return the first 9 videos.
      }

      // If we have fewer than 9, we need to fetch more to try and fill the gallery.
      const endDateInput = document.getElementById('endDate');
      const endDate = endDateInput ? endDateInput.value : new Date().toISOString().split('T')[0];
      console.log(`Video filter: fetching more videos from ${endDate}`);
      
      // This function will fetch *only* videos until it has 9, or has tried for 180 days.
      const moreVideos = await fetchValidAPODs(endDate, 9, 180, 'video');
      console.log(`Video filter: fetched ${moreVideos.length} additional videos`);

      // Combine the videos we already had with the new ones, ensuring no duplicates.
      const combined = [...videos, ...moreVideos];
      const uniqueVideos = Array.from(new Map(combined.map(v => [v.url, v])).values());
      console.log(`Video filter: returning ${uniqueVideos.length} unique videos`);

      return uniqueVideos.slice(0, 9); // Return up to 9 unique videos.
    },
    // Support both 'video' and 'videos' for flexibility
    videos: async data => {
      console.log('Videos filter: starting');
      // First, find any videos in the currently loaded data.
      let videos = data.filter(item => item.media_type === 'video');
      console.log(`Videos filter: found ${videos.length} videos in current data`);
      
      // If we already have 9 or more videos, we can just show them.
      if (videos.length >= 9) {
        console.log('Videos filter: returning first 9 videos');
        return videos.slice(0, 9); // Return the first 9 videos.
      }

      // If we have fewer than 9, we need to fetch more to try and fill the gallery.
      const endDateInput = document.getElementById('endDate');
      const endDate = endDateInput ? endDateInput.value : new Date().toISOString().split('T')[0];
      console.log(`Videos filter: fetching more videos from ${endDate}`);
      
      // This function will fetch *only* videos until it has 9, or has tried for 180 days.
      const moreVideos = await fetchValidAPODs(endDate, 9, 180, 'video');
      console.log(`Videos filter: fetched ${moreVideos.length} additional videos`);

      // Combine the videos we already had with the new ones, ensuring no duplicates.
      const combined = [...videos, ...moreVideos];
      const uniqueVideos = Array.from(new Map(combined.map(v => [v.url, v])).values());
      console.log(`Videos filter: returning ${uniqueVideos.length} unique videos`);

      return uniqueVideos.slice(0, 9); // Return up to 9 unique videos.
    },
  };

  // Get the correct filter function from our map, or default to 'all'.
  const filterFn = filterMap[filter] || filterMap.all;

  try {
    // Because the 'video' and 'videos' filters can fetch new data, they are async operations.
    // We show a loader while they work.
    if (filter === 'video' || filter === 'videos') {
      showLoader();
      const filteredData = await filterFn(currentGalleryData);
      console.log(`${filter} filter result:`, filteredData.map(item => ({ title: item.title, media_type: item.media_type })));
      hideLoader();
      renderGallery(filteredData);
    } else {
      // For 'all', 'image', and 'images', the filtering is instant, so no loader is needed.
      const filteredData = filterFn(currentGalleryData);
      console.log(`${filter} filter result:`, filteredData.map(item => ({ title: item.title, media_type: item.media_type })));
      renderGallery(filteredData);
    }
  } catch (error) {
    console.error('Error applying filter:', error);
    hideLoader();
  }
}

// --- GALLERY & MODAL RENDERING ---
function renderGallery(dataArray) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  if (!dataArray || dataArray.length === 0) {
    // Show a friendly message if no images/videos are available
    gallery.innerHTML = '<div class="placeholder">No space photos found for this date range. Try another date!</div>';
    return;
  }
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
    // Click opens Bootstrap modal
    card.addEventListener('click', function() {
      showBootstrapModal(item);
    });
    gallery.appendChild(card);
  });
}

// Show Bootstrap 5 modal with NASA styling
function showBootstrapModal(item) {
  // Get references to modal elements
  const modalLabel = document.getElementById('imageModalLabel');
  const modalImage = document.getElementById('modalImage');
  const modalVideoContainer = document.getElementById('modalVideoContainer');
  const modalVideo = document.getElementById('modalVideo');
  const modalDescription = document.getElementById('modalDescription');

  // Set common content
  modalLabel.textContent = item.title;
  modalDescription.textContent = item.explanation;

  // Check media type to show image or video
  if (item.media_type === 'image') {
    // Configure for image
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalImage.style.display = 'block';
    modalVideoContainer.style.display = 'none';
  } else if (item.media_type === 'video') {
    // Configure for video
    modalVideo.src = item.url;
    modalImage.style.display = 'none';
    modalVideoContainer.style.display = 'block';
  }

  // Show modal using Bootstrap's JS API
  const imageModal = document.getElementById('imageModal');
  const modal = bootstrap.Modal.getOrCreateInstance(imageModal);

  // Add event listener to stop video when modal is hidden
  imageModal.addEventListener('hidden.bs.modal', () => {
    modalVideo.src = '';
  }, { once: true }); // Use 'once' to avoid adding multiple listeners

  modal.show();
}

// Utility: Fetch up to 'count' valid APOD entries (image or video), going backward from a given end date
async function fetchValidAPODs(endDate, count = 9, maxTries = 20, mediaType = 'any') {
  const results = [];
  let tries = 0;
  let date = new Date(endDate);
  while (results.length < count && tries < maxTries) {
    const dateStr = date.toISOString().split('T')[0];
    const apod = await fetchAPOD(dateStr);
    if (apod && (mediaType === 'any' || apod.media_type === mediaType)) {
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
