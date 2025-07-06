// Event Details Page JavaScript

// DOM Elements
const eventLoading = document.getElementById('event-loading');
const eventDetailsContainer = document.getElementById('event-details-container');
const eventImage = document.getElementById('event-image');
const eventMonth = document.getElementById('event-month');
const eventDay = document.getElementById('event-day');
const eventCategory = document.getElementById('event-category');
const eventTitle = document.getElementById('event-title');
const eventDatetime = document.getElementById('event-datetime');
const eventLocation = document.getElementById('event-location');
const eventPrice = document.getElementById('event-price');
const eventOrganizer = document.getElementById('event-organizer');
const eventDescription = document.getElementById('event-description');
const generalPrice = document.getElementById('general-price');
const vipPrice = document.getElementById('vip-price');
const quantityInput = document.getElementById('quantity');
const decreaseQuantityBtn = document.getElementById('decrease-quantity');
const increaseQuantityBtn = document.getElementById('increase-quantity');
const purchaseBtn = document.getElementById('purchase-btn');
const walletRequired = document.getElementById('wallet-required');
const connectWalletPurchaseBtn = document.getElementById('connect-wallet-purchase');

// Event data cache
let eventData = null;
let eventId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeEventDetailsPage);

// Initialize the event details page
function initializeEventDetailsPage() {
  // Get event ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  eventId = urlParams.get('id');

  if (!eventId) {
    showError('Event ID not found in URL');
    return;
  }

  // Add event listeners
  setupEventListeners();

  // Check wallet connection
  checkWalletConnection();

  // Load event details
  loadEventDetails(eventId);
}

// Set up event listeners
function setupEventListeners() {
  // Quantity buttons
  decreaseQuantityBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  increaseQuantityBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
      quantityInput.value = currentValue + 1;
    }
  });

  // Purchase button
  purchaseBtn.addEventListener('click', purchaseTicket);

  // Connect wallet button
  if (connectWalletPurchaseBtn) {
    connectWalletPurchaseBtn.addEventListener('click', async () => {
      if (window.app && window.app.connectWallet) {
        try {
          await window.app.connectWallet();
          // After connecting, check wallet connection status again
          setTimeout(checkWalletConnection, 500);
        } catch (error) {
          console.error("Error connecting wallet:", error);
          window.app.showAlert("Failed to connect wallet. Please try again.", "danger");
        }
      } else {
        console.error("Wallet connection function not available");
        window.app.showAlert("Wallet connection not available. Please make sure MetaMask is installed.", "warning");
      }
    });
  }
}

// Check wallet connection
function checkWalletConnection() {
  if (window.ethereum && window.ethereum.selectedAddress) {
    // Wallet is connected
    purchaseBtn.classList.remove('d-none');
    walletRequired.classList.add('d-none');
  } else {
    // Wallet is not connected
    purchaseBtn.classList.add('d-none');
    walletRequired.classList.remove('d-none');
  }
}

// Load event details
async function loadEventDetails(id) {
  try {
    // Show loading state
    eventLoading.style.display = 'block';
    eventDetailsContainer.classList.add('d-none');

    // In a real implementation, we would fetch event data from the blockchain
    // For now, we'll use mock data based on the event ID

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get mock event data
    eventData = getMockEventData(id);

    if (!eventData) {
      showError('Event not found');
      return;
    }

    // Update UI with event data
    updateEventUI(eventData);

    // Hide loading, show content
    eventLoading.style.display = 'none';
    eventDetailsContainer.classList.remove('d-none');

  } catch (error) {
    console.error('Error loading event details:', error);
    showError('Error loading event details. Please try again.');
  }
}

// Update UI with event data
function updateEventUI(event) {
  // Set page title
  document.title = `${event.title} - BlockTix`;

  // Update event image
  eventImage.src = event.image || 'images/event-placeholder.jpg';
  eventImage.alt = event.title;

  // Update event date
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();
  eventMonth.textContent = month;
  eventDay.textContent = day;

  // Update event category
  eventCategory.textContent = event.category;

  // Update event details
  eventTitle.textContent = event.title;
  eventDatetime.textContent = formatDate(event.date);
  eventLocation.textContent = event.location;
  eventPrice.textContent = `${event.price} ETH`;
  eventOrganizer.textContent = event.organizer;

  // Update event description
  eventDescription.innerHTML = event.description;

  // Update ticket prices
  generalPrice.textContent = `${event.price} ETH`;
  vipPrice.textContent = `${(parseFloat(event.price) * 3).toFixed(2)} ETH`;

  // Generate venue map
  if (window.imageHelper && window.imageHelper.generateMapPlaceholder) {
    const venueMapContainer = document.getElementById('venue-map');
    if (venueMapContainer) {
      window.imageHelper.generateMapPlaceholder(venueMapContainer, event.location);
    }
  }
}

// Purchase ticket
async function purchaseTicket() {
  try {
    // Check if wallet is connected
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      window.app.showAlert('Please connect your wallet to purchase tickets', 'warning');
      return;
    }

    // Get ticket type
    const isVIP = document.getElementById('vipAccess').checked;
    const ticketType = isVIP ? 'VIP Access' : 'General Admission';

    // Get quantity
    const quantity = parseInt(quantityInput.value);

    // Calculate price
    const basePrice = parseFloat(eventData.price);
    const ticketPrice = isVIP ? basePrice * 3 : basePrice;
    const totalPrice = ticketPrice * quantity;

    // Show confirmation
    const confirmed = confirm(`You are about to purchase ${quantity} ${ticketType} ticket(s) for ${eventData.title} at ${totalPrice.toFixed(2)} ETH. Continue?`);

    if (!confirmed) {
      return;
    }

    // Show processing message
    window.app.showAlert('Processing your purchase...', 'info');

    // In a real implementation, we would call the smart contract to purchase tickets
    // For now, we'll simulate a successful purchase by storing in localStorage

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock tickets and store them
    const userAddress = window.ethereum.selectedAddress;

    // Get existing mock tickets or initialize empty array
    let mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

    // Generate tickets
    for (let i = 0; i < quantity; i++) {
      // Generate a unique token ID (timestamp + random number)
      const tokenId = Date.now().toString() + Math.floor(Math.random() * 1000);

      // Create ticket metadata
      const ticketMetadata = {
        id: tokenId,
        name: eventData.title,
        description: `${ticketType} ticket for ${eventData.title}`,
        image: eventData.image,
        owner: userAddress,
        purchaseDate: new Date().toISOString(),
        purchasePrice: isVIP ? (basePrice * 3).toString() : basePrice.toString(),
        attributes: [
          {
            trait_type: 'Event Date',
            value: eventData.date
          },
          {
            trait_type: 'Location',
            value: eventData.location
          },
          {
            trait_type: 'Ticket Type',
            value: ticketType
          },
          {
            trait_type: 'Price',
            value: isVIP ? `${(basePrice * 3).toFixed(2)} ETH` : `${basePrice} ETH`
          }
        ]
      };

      // Add to mock tickets array
      mockTickets.push(ticketMetadata);
    }

    // Save to localStorage
    localStorage.setItem('mockTickets', JSON.stringify(mockTickets));

    // Show success message
    window.app.showAlert(`Successfully purchased ${quantity} ticket(s) for ${eventData.title}!`, 'success');

    // Redirect to my tickets page after a delay
    setTimeout(() => {
      window.location.href = 'my-tickets.html';
    }, 3000);

  } catch (error) {
    console.error('Error purchasing ticket:', error);
    window.app.showAlert('Error purchasing ticket. Please try again.', 'danger');
  }
}

// Get mock event data based on ID
function getMockEventData(id) {
  const events = {
    '1': {
      id: 1,
      title: 'Summer Music Festival',
      date: '2023-06-15T19:00:00',
      location: 'Central Park, New York',
      price: '0.05',
      image: 'images/event-1.jpg',
      category: 'Concerts',
      organizer: 'BlockTix Events',
      description: '<p>Join us for an unforgettable summer music festival featuring top artists from around the world. Experience amazing performances across multiple stages in the heart of Central Park.</p><p>This year\'s lineup includes Grammy-winning artists and emerging talents that will make this an event to remember. Food vendors, art installations, and interactive experiences will be available throughout the venue.</p>'
    },
    '2': {
      id: 2,
      title: 'Blockchain Conference 2023',
      date: '2023-07-22T09:00:00',
      location: 'Tech Center, San Francisco',
      price: '0.08',
      image: 'images/event-2.jpg',
      category: 'Conferences',
      organizer: 'Blockchain Foundation',
      description: '<p>The premier blockchain event of the year, bringing together industry leaders, developers, and enthusiasts to discuss the future of blockchain technology.</p><p>Featured topics include DeFi innovations, NFT marketplaces, Layer 2 scaling solutions, and regulatory developments. Network with the brightest minds in the space and gain insights that will help you navigate the evolving blockchain landscape.</p>'
    },
    '3': {
      id: 3,
      title: 'Championship Finals',
      date: '2023-08-10T15:00:00',
      location: 'Sports Arena, Los Angeles',
      price: '0.12',
      image: 'images/event-3.jpg',
      category: 'Sports',
      organizer: 'National Sports League',
      description: '<p>Witness history in the making as the top two teams battle for the championship title. This highly anticipated match will feature the best players in the league competing at the highest level.</p><p>The event includes pre-game entertainment, halftime show, and post-game celebrations. Don\'t miss your chance to be part of this unforgettable sporting event.</p>'
    },
    '4': {
      id: 4,
      title: 'Jazz Night',
      date: '2023-09-05T20:00:00',
      location: 'Blue Note, Chicago',
      price: '0.03',
      image: 'images/event-placeholder.jpg',
      category: 'Concerts',
      organizer: 'Chicago Music Society',
      description: '<p>An intimate evening of jazz featuring acclaimed musicians in the historic Blue Note venue. Experience the rich sounds and improvisational magic of live jazz in an atmosphere that honors the tradition of this uniquely American art form.</p><p>The performance will showcase both classic jazz standards and original compositions, creating a perfect blend of nostalgia and innovation.</p>'
    },
    '5': {
      id: 5,
      title: 'Tech Summit 2023',
      date: '2023-10-15T10:00:00',
      location: 'Convention Center, Seattle',
      price: '0.07',
      image: 'images/event-placeholder.jpg',
      category: 'Conferences',
      organizer: 'Tech Innovation Group',
      description: '<p>The Tech Summit brings together technology leaders, innovators, and entrepreneurs to explore cutting-edge developments across AI, cloud computing, cybersecurity, and more.</p><p>Featuring keynote speeches, panel discussions, workshops, and networking opportunities, this summit is essential for anyone looking to stay ahead in the rapidly evolving tech landscape.</p>'
    },
    '6': {
      id: 6,
      title: 'City Marathon',
      date: '2023-11-20T08:00:00',
      location: 'Downtown, Boston',
      price: '0.04',
      image: 'images/event-placeholder.jpg',
      category: 'Sports',
      organizer: 'Boston Athletics Association',
      description: '<p>Challenge yourself in one of the most prestigious marathons in the world. The 26.2-mile course takes runners through Boston\'s historic neighborhoods, cheered on by thousands of spectators.</p><p>The event includes a pre-race expo, post-race celebration, and commemorative medals for all finishers. Participants of all levels are welcome to join this celebration of human endurance and community spirit.</p>'
    }
  };

  return events[id] || null;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show error message
function showError(message) {
  eventLoading.style.display = 'none';
  eventDetailsContainer.innerHTML = `
    <div class="alert alert-danger text-center" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>${message}
      <div class="mt-3">
        <a href="events.html" class="btn btn-outline-primary">
          <i class="fas fa-arrow-left me-2"></i>Back to Events
        </a>
      </div>
    </div>
  `;
  eventDetailsContainer.classList.remove('d-none');
}
