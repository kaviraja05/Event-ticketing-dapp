// Events page functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  initializeEventsPage();
  
  // Set up event listeners
  setupEventListeners();
});

// Initialize the events page
function initializeEventsPage() {
  // Check if wallet is connected
  checkWalletConnection();
  
  // Load events from blockchain or mock data
  loadEvents();
}

// Set up event listeners for the page
function setupEventListeners() {
  // Filter buttons
  document.getElementById('filter-all').addEventListener('click', function() {
    filterEvents('all');
    setActiveFilter(this);
  });
  
  document.getElementById('filter-concerts').addEventListener('click', function() {
    filterEvents('concerts');
    setActiveFilter(this);
  });
  
  document.getElementById('filter-conferences').addEventListener('click', function() {
    filterEvents('conferences');
    setActiveFilter(this);
  });
  
  document.getElementById('filter-sports').addEventListener('click', function() {
    filterEvents('sports');
    setActiveFilter(this);
  });
  
  // Search functionality
  const searchInput = document.getElementById('event-search');
  searchInput.addEventListener('input', function() {
    searchEvents(this.value);
  });
}

// Set active class on filter button
function setActiveFilter(button) {
  // Remove active class from all buttons
  document.querySelectorAll('.btn-group .btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  button.classList.add('active');
}

// Filter events by category
function filterEvents(category) {
  const eventCards = document.querySelectorAll('#events-container > div');
  
  eventCards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Search events by title
function searchEvents(query) {
  query = query.toLowerCase();
  const eventCards = document.querySelectorAll('#events-container > div');
  
  eventCards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const location = card.querySelector('.card-text').textContent.toLowerCase();
    
    if (title.includes(query) || location.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Load events from blockchain or mock data
async function loadEvents() {
  try {
    // Check if we have a connected wallet and contract
    if (window.contract) {
      // Here you would fetch events from your smart contract
      // For now, we'll use the static events already in the HTML
      console.log("Connected to contract, would fetch events here");
      
      // Example of how you might fetch events from contract:
      // const eventCount = await window.contract.getEventCount();
      // for (let i = 0; i < eventCount; i++) {
      //   const event = await window.contract.getEvent(i);
      //   addEventToPage(event);
      // }
    } else {
      console.log("No contract connection, using static events");
      // We're using the static events in the HTML for now
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

// Add an event to the page (for dynamic loading)
function addEventToPage(event) {
  // This would be used when dynamically loading events from the blockchain
  // Create a new event card and add it to the container
  const eventsContainer = document.getElementById('events-container');
  
  // Example structure (you would populate this with actual event data)
  const eventCard = document.createElement('div');
  eventCard.className = 'col-lg-4 col-md-6 mb-4';
  eventCard.setAttribute('data-category', event.category);
  
  // Format date
  const eventDate = new Date(event.date * 1000); // Convert from Unix timestamp
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();
  
  eventCard.innerHTML = `
    <div class="card event-card">
      <div class="event-date">
        <span class="month">${month}</span>
        <span class="day">${day}</span>
      </div>
      <img src="${event.imageUrl || 'images/event-placeholder.jpg'}" class="card-img-top" alt="${event.name}">
      <div class="card-body">
        <h5 class="card-title">${event.name}</h5>
        <p class="card-text">
          <i class="fas fa-map-marker-alt me-2"></i>${event.location}
        </p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="price">${ethers.utils.formatEther(event.price)} ETH</span>
          <a href="event-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    </div>
  `;
  
  eventsContainer.appendChild(eventCard);
}

// Check wallet connection status
function checkWalletConnection() {
  const connectWalletBtn = document.getElementById('connect-wallet');
  const networkBadge = document.getElementById('network-badge');
  const networkName = document.getElementById('network-name');
  
  // If we already have a connection from the main app.js
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortenAddress(window.ethereum.selectedAddress)}`;
    connectWalletBtn.classList.remove('btn-outline-light');
    connectWalletBtn.classList.add('btn-light');
    
    // Update network badge
    if (window.currentNetwork) {
      networkName.textContent = networks[window.currentNetwork].name;
      networkBadge.querySelector('.dot').classList.add('connected');
    }
  }
}

// Helper function to shorten address
function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}
