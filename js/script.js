// NASA API key
const API_KEY = "4mTOcCDF7tsvdHjlN96wfAhLVax7SGuPjnYpCvc5";

// --- APOD DATA CACHE ---
// This array will store the most recent 9 days of APOD data fetched from the API.
let cachedWindow = [];

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

// Utility: Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url) {
  // This regular expression matches different YouTube URL formats and extracts the video ID
  // Examples: youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID, youtube.com/embed/VIDEO_ID, youtube.com/v/VIDEO_ID
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Utility: Get YouTube thumbnail URL for a video ID
function getYouTubeThumbnail(videoId) {
  // Use hqdefault for high quality thumbnail (480x360)
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Utility: Convert YouTube URL to embed URL with autoplay
function getYouTubeEmbedUrl(url, autoplay = false) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return url;
  
  const autoplayParam = autoplay ? '?autoplay=1' : '';
  return `https://www.youtube.com/embed/${videoId}${autoplayParam}`;
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
  try {
    console.log('Initializing NASA Space Explorer...');
    
    // Set Google Font globally
    document.body.style.fontFamily = "'Barlow', 'Helvetica Neue', Arial, sans-serif";

    // Modal close events
    const modal = document.getElementById('imageModal');
    const modalClose = document.querySelector('.btn-close');
    if (modalClose) {
      modalClose.onclick = function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('imageModal'));
        if (modal) modal.hide();
      };
    }
    if (modal) {
      modal.onclick = function(event) {
        if (event.target === modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) modalInstance.hide();
        }
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

    // On page load, fetch most recent 9-day window
    async function loadRecentGallery() {
      showLoader();
      try {
        // Get today's date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const endDate = `${yyyy}-${mm}-${dd}`;
        const startDateObj = new Date(endDate);
        startDateObj.setDate(startDateObj.getDate() - 8);
        const startDate = startDateObj.toISOString().split('T')[0];
        // Fetch and cache the window
        await fetchAPODWindow(startDate, endDate);
        // Render the gallery with the "All" filter by default
        applyFilter('all');
      } catch (e) {
        document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load space images. Please try again later.</div>';
        console.error('Error loading gallery:', e);
      } finally {
        hideLoader();
      }
    }
    loadRecentGallery();

    // Button click: fetch 9-day window from selected start date
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
        await fetchAPODWindow(startDate, endDate);
        applyFilter(currentFilter);
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
    
    console.log('NASA Space Explorer initialized successfully!');
  } catch (error) {
    console.error('Critical error during initialization:', error);
    // Show a basic error message if everything fails
    document.body.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Error loading NASA Space Explorer. Please refresh the page.</div>';
  }
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

function applyFilter(filter) {
  // All filtering is done on the cachedWindow array
  if (!cachedWindow || cachedWindow.length === 0) {
    // Special case: if user wants videos but none in range, offer to fetch recent videos
    if (filter === 'video' || filter === 'videos') {
      const gallery = document.getElementById('gallery');
      gallery.innerHTML = `<div class="placeholder">No videos found in this range.<br><button id='findRecentVideosBtn' class='btn btn-primary mt-3'>Find Recent Videos</button></div>`;
      // Add event listener for the button
      const btn = document.getElementById('findRecentVideosBtn');
      if (btn) btn.onclick = fetchRecentVideos;
      return;
    }
    renderGallery([]);
    return;
  }
  // Map of filter functions
  const filterMap = {
    all: data => data,
    image: data => data.filter(item => item.media_type === 'image'),
    images: data => data.filter(item => item.media_type === 'image'),
    video: data => data.filter(item => item.media_type === 'video'),
    videos: data => data.filter(item => item.media_type === 'video'),
  };
  const filterFn = filterMap[filter] || filterMap.all;
  const filteredData = filterFn(cachedWindow);
  // If user wants videos but none in cache, offer to fetch recent videos
  if ((filter === 'video' || filter === 'videos') && filteredData.length === 0) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = `<div class="placeholder">No videos found in this range.<br><button id='findRecentVideosBtn' class='btn btn-primary mt-3'>Find Recent Videos</button></div>`;
    const btn = document.getElementById('findRecentVideosBtn');
    if (btn) btn.onclick = fetchRecentVideos;
    return;
  }
  renderGallery(filteredData);
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
        // Create container for YouTube thumbnail with play overlay
        media = document.createElement('div');
        media.style.position = 'relative';
        media.style.height = '220px';
        media.style.overflow = 'hidden';
        media.style.borderRadius = '12px 12px 0 0';
        media.style.cursor = 'pointer';
        
        // Get YouTube video ID and create thumbnail
        const videoId = getYouTubeVideoId(item.url);
        if (videoId) {
          const thumbnail = document.createElement('img');
          thumbnail.src = getYouTubeThumbnail(videoId);
          thumbnail.alt = `${item.title} - Video Thumbnail`;
          thumbnail.style.width = '100%';
          thumbnail.style.height = '100%';
          thumbnail.style.objectFit = 'cover';
          thumbnail.style.display = 'block';
          
          // Add error handling for failed thumbnail loads
          thumbnail.onerror = function() {
            // Fallback to a gradient background if thumbnail fails
            media.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
            thumbnail.style.display = 'none';
          };
          
          media.appendChild(thumbnail);
        } else {
          // Fallback for invalid YouTube URLs
          media.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        }
        
        // Create play button overlay
        const playOverlay = document.createElement('div');
        playOverlay.style.position = 'absolute';
        playOverlay.style.top = '0';
        playOverlay.style.left = '0';
        playOverlay.style.width = '100%';
        playOverlay.style.height = '100%';
        playOverlay.style.display = 'flex';
        playOverlay.style.alignItems = 'center';
        playOverlay.style.justifyContent = 'center';
        playOverlay.style.background = 'rgba(0, 0, 0, 0.4)';
        playOverlay.style.transition = 'background 0.3s ease';
        
        const playIcon = document.createElement('div');
        playIcon.innerHTML = '▶';
        playIcon.style.fontSize = '48px';
        playIcon.style.color = '#fff';
        playIcon.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        playIcon.style.transform = 'translateX(4px)'; // Slight offset for visual balance
        
        playOverlay.appendChild(playIcon);
        media.appendChild(playOverlay);
        
        // Add hover effect
        media.addEventListener('mouseenter', () => {
          playOverlay.style.background = 'rgba(0, 0, 0, 0.6)';
          playIcon.style.transform = 'translateX(4px) scale(1.1)';
        });
        
        media.addEventListener('mouseleave', () => {
          playOverlay.style.background = 'rgba(0, 0, 0, 0.4)';
          playIcon.style.transform = 'translateX(4px) scale(1)';
        });
        
      } else {
        // Non-YouTube videos: show generic video placeholder
        media = document.createElement('div');
        media.style.display = 'block';
        media.style.textAlign = 'center';
        media.style.padding = '80px 20px';
        media.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        media.style.color = '#fff';
        media.style.borderRadius = '12px 12px 0 0';
        media.style.height = '220px';
        media.style.display = 'flex';
        media.style.flexDirection = 'column';
        media.style.alignItems = 'center';
        media.style.justifyContent = 'center';
        
        const videoIcon = document.createElement('div');
        videoIcon.innerHTML = '🎥';
        videoIcon.style.fontSize = '32px';
        videoIcon.style.marginBottom = '10px';
        
        const videoText = document.createElement('div');
        videoText.textContent = 'External Video';
        videoText.style.fontSize = '14px';
        videoText.style.opacity = '0.8';
        
        media.appendChild(videoIcon);
        media.appendChild(videoText);
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

// Update modal show/hide logic
function showBootstrapModal(item) {
  const modalElement = document.getElementById('imageModal');
  const modalLabel = document.getElementById('imageModalLabel');
  const modalImage = document.getElementById('modalImage');
  const modalVideoContainer = document.getElementById('modalVideoContainer');
  const modalVideo = document.getElementById('modalVideo');
  const modalDescription = document.getElementById('modalDescription');

  modalLabel.textContent = item.title;
  modalDescription.textContent = item.explanation;

  if (item.media_type === 'image') {
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalImage.style.display = 'block';
    modalVideoContainer.style.display = 'none';
    modalVideo.src = '';
  } else if (item.media_type === 'video') {
    modalVideo.src = getYouTubeEmbedUrl(item.url, true);
    modalImage.style.display = 'none';
    modalVideoContainer.style.display = 'block';
  }

  // Use Bootstrap's Modal API to show the modal
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();

  // When the modal is hidden, clear the video src to stop playback
  modalElement.addEventListener('hidden.bs.modal', () => {
    modalVideo.src = '';
  }, { once: true });
}

// Utility: Fetch a 9-day window of APOD data in a single API call, with error handling and caching
async function fetchAPODWindow(startDate, endDate) {
  // Show the loader while fetching
  showLoader();
  try {
    // Build the API URL for a date range, with thumbs for videos
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
    const response = await fetch(url);
    if (response.status === 429) {
      // Rate limit hit: show a user-friendly message
      document.getElementById('gallery').innerHTML = '<div class="placeholder">You have reached the NASA API rate limit. Please wait a few minutes and try again.</div>';
      return [];
    }
    if (!response.ok) {
      // Other network error
      document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load images. Please try again later.</div>';
      return [];
    }
    const data = await response.json();
    // Cache the result for filtering
    cachedWindow = Array.isArray(data) ? data.reverse() : [];
    return cachedWindow;
  } catch (e) {
    document.getElementById('gallery').innerHTML = '<div class="placeholder">Network error. Please try again later.</div>';
    return [];
  } finally {
    hideLoader();
  }
}

// --- FIND RECENT VIDEOS FEATURE ---
// This function fetches the most recent 60 days of APODs and shows only videos
async function fetchRecentVideos() {
  showLoader();
  try {
    // Calculate date range for last 60 days
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 59); // 60 days
    const startDate = startDateObj.toISOString().split('T')[0];
    // One API call for the whole window
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
    const response = await fetch(url);
    if (response.status === 429) {
      document.getElementById('gallery').innerHTML = '<div class="placeholder">You have reached the NASA API rate limit. Please wait a few minutes and try again.</div>';
      return;
    }
    if (!response.ok) {
      document.getElementById('gallery').innerHTML = '<div class="placeholder">Failed to load videos. Please try again later.</div>';
      return;
    }
    const data = await response.json();
    // Filter for videos only, newest first
    const videos = Array.isArray(data) ? data.filter(item => item.media_type === 'video').reverse() : [];
    cachedWindow = videos;
    renderGallery(videos);
  } catch (e) {
    document.getElementById('gallery').innerHTML = '<div class="placeholder">Network error. Please try again later.</div>';
  } finally {
    hideLoader();
  }
}

// Utility: Validate date range (maxDays inclusive)
function isValidDateRange(start, end, maxDays = 9) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < maxDays;
}
