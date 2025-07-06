// Marketplace page functionality

// Define networks for network detection
const networks = {
  hardhat: {
    name: "Hardhat Local",
    chainId: "0x7A69" // 31337 in hex
  },
  sepolia: {
    name: "Sepolia Testnet",
    chainId: "0xaa36a7" // 11155111 in hex
  },
  mainnet: {
    name: "Ethereum Mainnet",
    chainId: "0x1" // 1 in hex
  },
  goerli: {
    name: "Goerli Testnet",
    chainId: "0x5" // 5 in hex
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  initializeMarketplacePage();

  // Set up event listeners
  setupEventListeners();
});

// Initialize the marketplace page
function initializeMarketplacePage() {
  // Clean up any duplicate tickets on page load
  if (typeof window.clearDuplicateTickets === 'function') {
    console.log("Running automatic duplicate ticket cleanup on marketplace page load");
    window.clearDuplicateTickets();
  }

  // Check if wallet is connected
  checkWalletConnection();

  // Automatically try to connect wallet without prompting
  autoConnectWallet();
}

// Automatically connect wallet if possible without prompting
async function autoConnectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Check if we already have access to accounts without prompting
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        console.log("Auto-connecting to existing account:", account);

        // Process the connected account without showing alert
        window.manualWalletConnect = false;
        handleConnectedAccount(account);
      }
    } catch (error) {
      console.error("Error auto-connecting wallet:", error);
    }
  }
}

// Set up event listeners for the page
function setupEventListeners() {
  // Connect wallet button in the main content area
  const connectWalletMainBtn = document.getElementById('connect-wallet-main');
  if (connectWalletMainBtn) {
    connectWalletMainBtn.addEventListener('click', connectWallet);
  }

  // Connect wallet button in the navbar
  const connectWalletBtn = document.getElementById('connect-wallet');
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', connectWallet);
  }

  // Connect wallet button in the sell section
  const connectWalletSellBtn = document.getElementById('connect-wallet-sell');
  if (connectWalletSellBtn) {
    connectWalletSellBtn.addEventListener('click', async function() {
      console.log("Sell section connect wallet button clicked");

      try {
        // First connect the wallet
        const connected = await connectWallet();

        if (connected) {
          console.log("Wallet connected, now showing sell form and loading tickets");

          // Directly update the UI
          const sellWalletRequired = document.getElementById('sell-wallet-required');
          const sellTicketForm = document.getElementById('sell-ticket-form');

          if (sellWalletRequired && sellTicketForm) {
            // Hide the wallet required message
            sellWalletRequired.classList.add('d-none');

            // Show the sell form
            sellTicketForm.classList.remove('d-none');

            // Add some test tickets if there are none
            const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
            const currentAddress = window.ethereum.selectedAddress;

            // Filter tickets owned by current user
            const userTickets = mockTickets.filter(ticket =>
              ticket.owner && ticket.owner.toLowerCase() === currentAddress.toLowerCase()
            );

            if (userTickets.length === 0) {
              console.log("No tickets found for this user, adding some test tickets");
              if (typeof addMockTicketsToWallet === 'function') {
                addMockTicketsToWallet();
              }
            }

            // Load the tickets into the dropdown
            console.log("Loading tickets into dropdown");
            await loadUserTicketsForSale();
          }
        }
      } catch (error) {
        console.error("Error connecting wallet and loading tickets:", error);
        alert("Error connecting wallet and loading tickets: " + error.message);
      }
    });
  }

  // Filter buttons
  document.getElementById('filter-all').addEventListener('click', function() {
    filterListings('all');
    setActiveFilter(this);
  });

  document.getElementById('filter-concerts').addEventListener('click', function() {
    filterListings('concerts');
    setActiveFilter(this);
  });

  document.getElementById('filter-conferences').addEventListener('click', function() {
    filterListings('conferences');
    setActiveFilter(this);
  });

  document.getElementById('filter-sports').addEventListener('click', function() {
    filterListings('sports');
    setActiveFilter(this);
  });

  // Search functionality
  const searchInput = document.getElementById('listing-search');
  searchInput.addEventListener('input', function() {
    searchListings(this.value);
  });

  // Sell ticket form
  const sellTicketForm = document.getElementById('sell-ticket-form');
  if (sellTicketForm) {
    sellTicketForm.addEventListener('submit', function(e) {
      e.preventDefault();
      sellTicket();
    });
  }
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

// Filter listings by category
function filterListings(category) {
  const listingCards = document.querySelectorAll('#listings-container > div.col-lg-4');

  if (listingCards.length === 0) {
    return; // No listings to filter
  }

  listingCards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Search listings by title
function searchListings(query) {
  query = query.toLowerCase();
  const listingCards = document.querySelectorAll('#listings-container > div.col-lg-4');

  if (listingCards.length === 0) {
    return; // No listings to search
  }

  listingCards.forEach(card => {
    const title = card.querySelector('.listing-title').textContent.toLowerCase();
    const location = card.querySelector('.listing-location').textContent.toLowerCase();

    if (title.includes(query) || location.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Check wallet connection status
async function checkWalletConnection() {
  console.log("Checking wallet connection status...");

  const connectWalletBtn = document.getElementById('connect-wallet');
  const networkBadge = document.getElementById('network-badge');
  const networkName = document.getElementById('network-name');
  const walletRequired = document.getElementById('wallet-required');
  const marketplaceContainer = document.getElementById('marketplace-container');
  const sellWalletRequired = document.getElementById('sell-wallet-required');
  const sellTicketForm = document.getElementById('sell-ticket-form');

  console.log("Sell form elements:", {
    sellWalletRequired: !!sellWalletRequired,
    sellTicketForm: !!sellTicketForm
  });

  // Always show the marketplace container and load listings
  // This allows users to browse listings without connecting a wallet
  if (walletRequired) walletRequired.classList.add('d-none');
  if (marketplaceContainer) marketplaceContainer.classList.remove('d-none');

  // Load marketplace listings regardless of wallet connection
  loadMarketplaceListings();

  // If we already have a connection from the main app.js
  if (window.ethereum && window.ethereum.selectedAddress) {
    console.log("Wallet already connected:", window.ethereum.selectedAddress);

    // Update connect button
    if (connectWalletBtn) {
      connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortenAddress(window.ethereum.selectedAddress)}`;
      connectWalletBtn.classList.remove('btn-outline-light');
      connectWalletBtn.classList.add('btn-light');
    }

    // Update network badge
    if (window.currentNetwork && networkName && networkBadge) {
      networkName.textContent = networks[window.currentNetwork].name;
      const dot = networkBadge.querySelector('.dot');
      if (dot) dot.classList.add('connected');
    }

    // Show sell form, hide wallet required message
    if (sellWalletRequired && sellTicketForm) {
      console.log("Showing sell form, hiding wallet required message");
      sellWalletRequired.classList.add('d-none');
      sellTicketForm.classList.remove('d-none');

      // Load user's tickets for the sell form
      console.log("Loading user tickets for the sell form");
      await loadUserTicketsForSale();
    } else {
      console.log("Sell form elements not found");
    }
  } else {
    console.log("Wallet not connected, but still showing marketplace listings");

    // Hide sell form, show wallet required message
    if (sellWalletRequired && sellTicketForm) {
      console.log("Hiding sell form, showing wallet required message");
      sellWalletRequired.classList.remove('d-none');
      sellTicketForm.classList.add('d-none');
    }
  }
}

// Connect wallet function
async function connectWallet() {
  console.log("Connect wallet button clicked");

  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      console.log("MetaMask is installed, checking for existing accounts first...");

      try {
        // First check if we already have access to accounts without prompting
        const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (existingAccounts && existingAccounts.length > 0) {
          // We already have access to accounts, no need to prompt
          const account = existingAccounts[0];
          console.log("Account already connected:", account);

          // Process the connected account
          handleConnectedAccount(account);
          return true;
        }

        // If no existing accounts, request access
        console.log("No existing accounts, requesting access...");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          console.log("Account connected:", account);

          // Process the connected account
          return handleConnectedAccount(account);
        } else {
          console.error("No accounts returned from MetaMask");
          alert("No accounts found. Please make sure you have accounts in MetaMask and try again.");
          return false;
        }
      } catch (requestError) {
        console.error("Error requesting accounts:", requestError);

        // Check if user rejected the request
        if (requestError.code === 4001) {
          alert("You rejected the connection request. Please approve the connection in MetaMask to continue.");
        } else {
          alert(`Error connecting to MetaMask: ${requestError.message || "Unknown error"}`);
        }

        return false;
      }
    } else {
      console.error("MetaMask is not installed");
      alert('MetaMask is not installed. Please install it to use this dApp: https://metamask.io/download.html');
      return false;
    }
  } catch (error) {
    console.error('Unexpected error connecting wallet:', error);
    alert(`Unexpected error connecting wallet: ${error.message || "Unknown error"}`);
    return false;
  }
}

// Handle connected account
async function handleConnectedAccount(account) {
  try {
    // Update UI
    const connectWalletBtn = document.getElementById('connect-wallet');
    if (connectWalletBtn) {
      connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortenAddress(account)}`;
      connectWalletBtn.classList.remove('btn-outline-light');
      connectWalletBtn.classList.add('btn-light');
    } else {
      console.warn("Connect wallet button not found in navbar");
    }

    // Show marketplace container, hide wallet required message
    const walletRequired = document.getElementById('wallet-required');
    const marketplaceContainer = document.getElementById('marketplace-container');

    if (walletRequired) walletRequired.classList.add('d-none');
    if (marketplaceContainer) marketplaceContainer.classList.remove('d-none');

    // Update sell section UI
    const sellWalletRequired = document.getElementById('sell-wallet-required');
    const sellTicketForm = document.getElementById('sell-ticket-form');

    if (sellWalletRequired && sellTicketForm) {
      sellWalletRequired.classList.add('d-none');
      sellTicketForm.classList.remove('d-none');
    }

    // Update network info
    try {
      await updateNetworkInfo();
    } catch (networkError) {
      console.error("Error updating network info:", networkError);
    }

    // Reload marketplace listings to ensure they're up to date
    try {
      await loadMarketplaceListings();
    } catch (listingsError) {
      console.error("Error loading marketplace listings:", listingsError);
    }

    // Load user's tickets for the sell form
    try {
      await loadUserTicketsForSale();
    } catch (ticketsError) {
      console.error("Error loading user tickets:", ticketsError);
    }

    // Show success message
    console.log("Wallet connected successfully:", account);

    // Don't show alert for automatic connections
    if (window.manualWalletConnect) {
      alert("Wallet connected successfully!");
      window.manualWalletConnect = false;
    }

    return true;
  } catch (error) {
    console.error("Error handling connected account:", error);
    return false;
  }
}

// Update network information
async function updateNetworkInfo() {
  if (window.ethereum) {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const networkBadge = document.getElementById('network-badge');
    const networkName = document.getElementById('network-name');

    // Find the current network
    let currentNetworkName = 'Unknown Network';
    for (const [key, network] of Object.entries(networks)) {
      if (network.chainId === chainId) {
        currentNetworkName = network.name;
        window.currentNetwork = key;
        break;
      }
    }

    // Update the UI
    networkName.textContent = currentNetworkName;
    networkBadge.querySelector('.dot').classList.add('connected');
  }
}

// Load marketplace listings from the blockchain
async function loadMarketplaceListings() {
  try {
    // Clear existing listings
    const listingsContainer = document.getElementById('listings-container');
    const noListings = document.getElementById('no-listings');

    console.log("Loading marketplace listings...");

    // Try to load from blockchain if connected
    if (window.ethereum && window.ethereum.selectedAddress && window.contract) {
      // Here you would fetch listings from your smart contract
      console.log("Connected to contract, would fetch listings here");

      // Example of how you might fetch listings from contract:
      // const listingCount = await window.contract.getListingCount();
      //
      // if (listingCount > 0) {
      //   noListings.classList.add('d-none');
      //
      //   for (let i = 0; i < listingCount; i++) {
      //     const listing = await window.contract.getListing(i);
      //
      //     // Add listing to the page
      //     addListingToPage(listing);
      //   }
      // }
    } else {
      console.log("No contract connection, using localStorage only");
    }

    // Always load from localStorage as fallback or for demo
    addMockListings();

  } catch (error) {
    console.error("Error loading listings:", error);

    // Even if there's an error, try to load from localStorage
    try {
      addMockListings();
    } catch (fallbackError) {
      console.error("Error loading fallback listings:", fallbackError);
    }
  }
}

// Load user's tickets for the sell form
async function loadUserTicketsForSale() {
  try {
    const ticketSelect = document.getElementById('ticket-select');
    console.log("Loading user tickets for sale...");
    console.log("Ticket select element found:", !!ticketSelect);

    // Check if we have a connected wallet
    if (window.ethereum && window.ethereum.selectedAddress) {
      console.log("Wallet connected:", window.ethereum.selectedAddress);

      // Always add mock tickets for demonstration, regardless of contract connection
      addMockTicketsToSelect();

      // If we also have a contract, we would fetch from blockchain too
      if (window.contract) {
        console.log("Connected to contract, would fetch user tickets here");
        // Contract-specific code would go here
      }
    } else {
      console.log("No wallet connection detected");
    }
  } catch (error) {
    console.error("Error loading user tickets:", error);
  }
}

// Add mock listings for demonstration
function addMockListings() {
  const listingsContainer = document.getElementById('listings-container');
  const noListings = document.getElementById('no-listings');

  // Clear any existing listings
  listingsContainer.querySelectorAll('.col-lg-4').forEach(el => el.remove());

  // Clean up any duplicate tickets first to ensure marketplace listings reference valid tickets
  if (typeof window.clearDuplicateTickets === 'function') {
    console.log("Running duplicate ticket cleanup before loading marketplace listings");
    window.clearDuplicateTickets();
  }

  // Get listings from localStorage (after potential cleanup)
  const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');

  // Track seen listing IDs to prevent duplicates
  const seenListingIds = new Set();

  // Filter out any duplicate listings
  const uniqueListings = marketplaceListings.filter(listing => {
    if (!listing.id) return false;

    if (seenListingIds.has(listing.id)) {
      console.log(`Skipping duplicate listing ID: ${listing.id}`);
      return false;
    }

    seenListingIds.add(listing.id);
    return true;
  });

  // If we found duplicates, save the cleaned list back to localStorage
  if (uniqueListings.length !== marketplaceListings.length) {
    console.log(`Removed ${marketplaceListings.length - uniqueListings.length} duplicate listings`);
    localStorage.setItem('marketplaceListings', JSON.stringify(uniqueListings));
  }

  // Debug: Log the listings to console
  console.log("Marketplace listings after filtering duplicates:", uniqueListings.length);

  if (uniqueListings.length === 0) {
    // Show the "no listings" message
    noListings.classList.remove('d-none');
    console.log("No listings found in localStorage");
  } else {
    // Hide the "no listings" message
    noListings.classList.add('d-none');
    console.log(`Found ${uniqueListings.length} listings in localStorage`);

    // Add listings to the page
    uniqueListings.forEach(listing => {
      try {
        // Check if the listing has all required properties
        if (!listing.id || !listing.ticketData) {
          console.error("Invalid listing format:", listing);
          return;
        }

        // Extract date from ticket attributes if available
        let eventDate = "Unknown Date";
        let eventLocation = "Unknown Location";

        if (listing.ticketData.attributes && Array.isArray(listing.ticketData.attributes)) {
          // Extract date
          const dateAttr = listing.ticketData.attributes.find(attr => attr.trait_type === 'Event Date');
          if (dateAttr && dateAttr.value) {
            eventDate = dateAttr.value;
          }

          // Extract location
          const locationAttr = listing.ticketData.attributes.find(attr => attr.trait_type === 'Location');
          if (locationAttr && locationAttr.value) {
            eventLocation = locationAttr.value;
          }
        } else {
          // Fallback to direct properties
          if (listing.ticketData.date) {
            eventDate = listing.ticketData.date;
          }

          if (listing.ticketData.location) {
            eventLocation = listing.ticketData.location;
          }
        }

        // Create a listing object in the format expected by addListingToPage
        const formattedListing = {
          id: listing.id,
          title: listing.ticketData.name || "Unknown Event",
          date: eventDate,
          location: eventLocation,
          price: `${listing.price} ETH`,
          image: listing.ticketData.image || 'images/event-placeholder.jpg',
          category: getCategoryFromEventName(listing.ticketData.name || ""),
          ticketId: listing.ticketId,
          seller: listing.seller
        };

        addListingToPage(formattedListing);
        console.log("Added listing to page:", formattedListing);
      } catch (error) {
        console.error("Error processing listing:", error, listing);
      }
    });
  }
}

// Helper function to determine category from event name
function getCategoryFromEventName(name) {
  name = name.toLowerCase();
  if (name.includes('music') || name.includes('concert') || name.includes('festival') || name.includes('jazz')) {
    return 'concerts';
  } else if (name.includes('conference') || name.includes('summit') || name.includes('tech')) {
    return 'conferences';
  } else if (name.includes('sport') || name.includes('game') || name.includes('match') || name.includes('championship') || name.includes('marathon')) {
    return 'sports';
  }
  return 'other';
}

// Add a listing to the page
function addListingToPage(listing) {
  // Get the template
  const template = document.getElementById('listing-template');
  const listingElement = document.importNode(template.content, true);

  // Create the container
  const container = document.createElement('div');
  container.className = 'col-lg-4 col-md-6 mb-4';
  container.setAttribute('data-category', listing.category);

  // Set the listing data
  listingElement.querySelector('.listing-title').textContent = listing.title;
  listingElement.querySelector('.listing-date').textContent = listing.date;
  listingElement.querySelector('.listing-location').textContent = listing.location;
  listingElement.querySelector('.listing-price').textContent = listing.price;
  listingElement.querySelector('.listing-image').src = listing.image;
  listingElement.querySelector('.listing-image').alt = listing.title;

  // Add event listener to buy button
  listingElement.querySelector('.buy-ticket-btn').addEventListener('click', function() {
    buyTicket(listing.id);
  });

  // Add the listing to the container
  container.appendChild(listingElement);
  document.getElementById('listings-container').appendChild(container);
}

// Add mock tickets to the select dropdown
function addMockTicketsToSelect() {
  console.log("Adding mock tickets to select dropdown...");

  const ticketSelect = document.getElementById('ticket-select');
  console.log("Ticket select element:", ticketSelect);

  if (!ticketSelect) {
    console.error("Ticket select element not found!");
    return;
  }

  // Clear any existing options except the first one
  console.log("Current options length:", ticketSelect.options.length);
  while (ticketSelect.options.length > 1) {
    ticketSelect.remove(1);
  }

  // Get current user address
  const currentUserAddress = window.ethereum?.selectedAddress;
  console.log("Current user address:", currentUserAddress);

  if (!currentUserAddress) {
    // If no user connected, add a disabled option
    console.log("No user address, adding 'connect wallet' option");
    const noTicketsOption = document.createElement('option');
    noTicketsOption.disabled = true;
    noTicketsOption.textContent = 'Please connect your wallet';
    ticketSelect.appendChild(noTicketsOption);
    return;
  }

  // Get tickets from localStorage (after potential cleanup)
  const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
  console.log("All mock tickets:", mockTickets.length);

  // Track seen ticket IDs to prevent duplicates
  const seenTicketIds = new Set();

  // Filter tickets owned by current user
  const userTickets = mockTickets.filter(ticket => {
    if (!ticket.id || !ticket.owner) {
      console.log("Skipping invalid ticket:", ticket);
      return false;
    }

    // Skip if we've already seen this ticket ID
    if (seenTicketIds.has(ticket.id)) {
      console.log(`Skipping duplicate ticket ID: ${ticket.id}`);
      return false;
    }

    // Check if this ticket belongs to the current user
    const isOwner = ticket.owner.toLowerCase() === currentUserAddress.toLowerCase();

    // If it belongs to the user, add it to seen tickets
    if (isOwner) {
      seenTicketIds.add(ticket.id);
    }

    return isOwner;
  });

  console.log("User tickets after filtering duplicates:", userTickets.length);

  // Get existing listings
  const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
  console.log("Marketplace listings:", marketplaceListings);

  // Filter out tickets that are already listed
  const availableTickets = userTickets.filter(ticket =>
    !marketplaceListings.some(listing => listing.ticketId === ticket.id)
  );
  console.log("Available tickets for sale:", availableTickets);

  if (availableTickets.length === 0) {
    // If no tickets, add a disabled option
    console.log("No available tickets, adding 'no tickets' option");
    const noTicketsOption = document.createElement('option');
    noTicketsOption.disabled = true;
    noTicketsOption.textContent = 'No tickets available to sell';
    ticketSelect.appendChild(noTicketsOption);
  } else {
    // Add tickets to the select dropdown
    console.log("Adding", availableTickets.length, "tickets to dropdown");
    availableTickets.forEach(ticket => {
      const option = document.createElement('option');
      option.value = ticket.id;

      // Get date from attributes
      const dateAttr = ticket.attributes?.find(attr => attr.trait_type === 'Event Date');
      const date = dateAttr ? dateAttr.value : 'Unknown date';

      option.textContent = `${ticket.name} - ${date}`;
      ticketSelect.appendChild(option);
      console.log("Added ticket to dropdown:", ticket.name, ticket.id);
    });
  }
}

// Buy a ticket from the marketplace
async function buyTicket(listingId) {
  try {
    // Check if wallet is connected
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      alert('Please connect your wallet to buy tickets.');
      return;
    }

    // Get the buyer's address
    const buyerAddress = window.ethereum.selectedAddress;

    let purchaseSuccessful = false;

    // Try to purchase on blockchain first
    try {
      // This would be the actual blockchain call in a real implementation
      if (window.contract) {
        console.log("Connected to contract, would buy ticket here:", listingId);

        // Simulate blockchain delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate blockchain error to fall back to localStorage
        throw new Error("Blockchain purchase not implemented");
      } else {
        throw new Error("No contract connection");
      }
    } catch (blockchainError) {
      console.warn("Blockchain purchase failed, using localStorage:", blockchainError);

      // Get listings from localStorage
      const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');

      // Find the listing
      const listingIndex = marketplaceListings.findIndex(listing => listing.id === listingId);
      if (listingIndex === -1) {
        throw new Error("Listing not found");
      }

      const listing = marketplaceListings[listingIndex];

      // Get the price
      const price = parseFloat(listing.price);

      // Confirm purchase
      const confirmed = confirm(`You are about to purchase a ticket for ${listing.ticketData.name} at ${price} ETH. Continue?`);
      if (!confirmed) {
        return;
      }

      // Get all tickets
      const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

      // Find the ticket
      const ticketIndex = mockTickets.findIndex(ticket => ticket.id === listing.ticketId);
      if (ticketIndex === -1) {
        throw new Error("Ticket not found");
      }

      // Update the owner
      mockTickets[ticketIndex].owner = buyerAddress;

      // Save back to localStorage
      localStorage.setItem('mockTickets', JSON.stringify(mockTickets));

      // Remove the listing
      marketplaceListings.splice(listingIndex, 1);

      // Save back to localStorage
      localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings));

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      purchaseSuccessful = true;
    }

    if (purchaseSuccessful) {
      // Show success message
      alert('Ticket purchased successfully!');

      // Reload the page to update the listings
      window.location.reload();
    }

  } catch (error) {
    console.error("Error buying ticket:", error);
    alert(`Error buying ticket: ${error.message || "Unknown error"}`);
  }
}

// Sell a ticket on the marketplace
async function sellTicket() {
  try {
    const ticketSelect = document.getElementById('ticket-select');
    const priceInput = document.getElementById('ticket-price');

    if (!ticketSelect || !priceInput) {
      console.error("Form elements not found");
      return;
    }

    const ticketId = ticketSelect.value;
    const price = priceInput.value;

    if (!ticketId) {
      alert('Please select a ticket to sell.');
      return;
    }

    if (!price || price <= 0 || price > 1) {
      alert('Please enter a valid price between 0.001 and 1 ETH.');
      return;
    }

    // Check if wallet is connected
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      alert('Please connect your wallet to sell tickets.');
      return;
    }

    const sellerAddress = window.ethereum.selectedAddress;

    let listingSuccessful = false;

    // Try to list on blockchain first
    try {
      if (window.contract) {
        // This would be the actual blockchain call in a real implementation
        console.log("Connected to contract, would list ticket here:", ticketId, price);

        // Simulate blockchain delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate blockchain error to fall back to localStorage
        throw new Error("Blockchain listing not implemented");
      } else {
        throw new Error("No contract connection");
      }
    } catch (blockchainError) {
      console.warn("Blockchain listing failed, using localStorage:", blockchainError);

      // Get tickets from localStorage
      const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

      // Find the ticket
      const ticket = mockTickets.find(t =>
        t.id === ticketId &&
        t.owner &&
        t.owner.toLowerCase() === sellerAddress.toLowerCase()
      );

      if (!ticket) {
        throw new Error("Ticket not found or you don't own this ticket");
      }

      // Get existing listings
      let marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');

      // Check if ticket is already listed
      if (marketplaceListings.some(listing => listing.ticketId === ticketId)) {
        throw new Error("This ticket is already listed for sale");
      }

      // Create listing object
      const listing = {
        id: Date.now().toString(),
        ticketId: ticketId,
        seller: sellerAddress,
        price: price.toString(),
        listingDate: new Date().toISOString(),
        ticketData: ticket
      };

      // Add to listings
      marketplaceListings.push(listing);

      // Save to localStorage
      localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings));

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      listingSuccessful = true;
    }

    if (listingSuccessful) {
      // Show success message
      alert('Ticket listed successfully!');

      // Reload the page to update the listings
      window.location.reload();
    }

  } catch (error) {
    console.error("Error selling ticket:", error);
    alert(`Error selling ticket: ${error.message || "Unknown error"}`);
  }
}

// Helper function to shorten address
function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Special function to connect wallet and immediately load tickets
// Make it globally accessible
window.connectWalletAndLoadTickets = async function() {
  console.log("Connect wallet and load tickets function called");

  try {
    // Set flag for manual wallet connection to show alert
    window.manualWalletConnect = true;

    // First connect the wallet
    const connected = await connectWallet();

    if (connected) {
      console.log("Wallet connected, now showing sell form and loading tickets");

      // Directly update the UI
      const sellWalletRequired = document.getElementById('sell-wallet-required');
      const sellTicketForm = document.getElementById('sell-ticket-form');

      if (sellWalletRequired && sellTicketForm) {
        // Hide the wallet required message
        sellWalletRequired.classList.add('d-none');

        // Show the sell form
        sellTicketForm.classList.remove('d-none');

        // Add some test tickets if there are none
        const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
        const currentAddress = window.ethereum.selectedAddress;

        // Filter tickets owned by current user
        const userTickets = mockTickets.filter(ticket =>
          ticket.owner && ticket.owner.toLowerCase() === currentAddress.toLowerCase()
        );

        if (userTickets.length === 0) {
          console.log("No tickets found for this user, adding some test tickets");
          if (typeof window.addMockTicketsToWallet === 'function') {
            window.addMockTicketsToWallet();
          }
        }

        // Load the tickets into the dropdown
        console.log("Loading tickets into dropdown");
        await loadUserTicketsForSale();

        // Force refresh the dropdown
        const ticketSelect = document.getElementById('ticket-select');
        if (ticketSelect) {
          console.log("Refreshing ticket dropdown");
          // Clear any existing options except the first one
          while (ticketSelect.options.length > 1) {
            ticketSelect.remove(1);
          }

          // Clean up any duplicate tickets first
          if (typeof window.clearDuplicateTickets === 'function') {
            console.log("Running duplicate ticket cleanup before refreshing dropdown");
            window.clearDuplicateTickets();
          }

          // Get tickets from localStorage again (after cleanup)
          const refreshedMockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

          // Track seen ticket IDs to prevent duplicates
          const seenTicketIds = new Set();

          // Filter tickets owned by current user
          const refreshedUserTickets = refreshedMockTickets.filter(ticket => {
            if (!ticket.id || !ticket.owner) {
              return false;
            }

            // Skip if we've already seen this ticket ID
            if (seenTicketIds.has(ticket.id)) {
              return false;
            }

            // Check if this ticket belongs to the current user
            const isOwner = ticket.owner.toLowerCase() === currentAddress.toLowerCase();

            // If it belongs to the user, add it to seen tickets
            if (isOwner) {
              seenTicketIds.add(ticket.id);
            }

            return isOwner;
          });

          console.log("Found", refreshedUserTickets.length, "tickets for user");

          // Add tickets to the select dropdown
          refreshedUserTickets.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.id;

            // Get date from attributes
            const dateAttr = ticket.attributes?.find(attr => attr.trait_type === 'Event Date');
            const date = dateAttr ? dateAttr.value : 'Unknown date';

            option.textContent = `${ticket.name} - ${date}`;
            ticketSelect.appendChild(option);
            console.log("Added ticket to dropdown:", ticket.name);
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in connectWalletAndLoadTickets:", error);
    alert("Error connecting wallet and loading tickets: " + error.message);
  }
}
