// Tickets Page JavaScript

// DOM Elements
const walletNotConnected = document.getElementById('wallet-not-connected');
const loadingTickets = document.getElementById('loading-tickets');
const noTickets = document.getElementById('no-tickets');
const ticketsContainer = document.getElementById('tickets-container');
const ticketCount = document.getElementById('ticket-count');
const connectWalletTickets = document.getElementById('connect-wallet-tickets');

// Filter buttons
const viewAllBtn = document.getElementById('view-all');
const viewUpcomingBtn = document.getElementById('view-upcoming');
const viewPastBtn = document.getElementById('view-past');

// Modal elements
const ticketModal = document.getElementById('ticketModal');
const transferModal = document.getElementById('transferModal');
const sellModal = document.getElementById('sellModal');
const modalEventName = document.getElementById('modal-event-name');
const modalEventDate = document.getElementById('modal-event-date');
const modalEventLocation = document.getElementById('modal-event-location');
const modalTicketId = document.getElementById('modal-ticket-id');
const modalTicketOwner = document.getElementById('modal-ticket-owner');
const modalTicketType = document.getElementById('modal-ticket-type');
const modalPurchaseDate = document.getElementById('modal-purchase-date');
const modalPurchasePrice = document.getElementById('modal-purchase-price');
const modalTransferBtn = document.getElementById('modal-transfer-btn');
const modalSellBtn = document.getElementById('modal-sell-btn');
const modalViewOnExplorer = document.getElementById('modal-view-on-explorer');
const modalQrCode = document.getElementById('modal-qr-code');

// Transfer modal elements
const recipientAddress = document.getElementById('recipient-address');
const confirmTransfer = document.getElementById('confirm-transfer');
const transferStatus = document.getElementById('transfer-status');

// Sell modal elements
const sellTicketImage = document.getElementById('sell-ticket-image');
const sellTicketName = document.getElementById('sell-ticket-name');
const sellTicketDetails = document.getElementById('sell-ticket-details');
const listingPrice = document.getElementById('listing-price');
const confirmListing = document.getElementById('confirm-listing');
const sellStatus = document.getElementById('sell-status');

// Current user's address
let currentUserAddress = '';

// Current selected ticket for transfer
let selectedTicketId = null;

// Ticket data cache
let ticketsData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeTicketsPage);

// Initialize the tickets page
function initializeTicketsPage() {
  // Clean up any duplicate tickets on page load
  // This is critical to prevent duplicate tickets from appearing
  if (typeof window.clearDuplicateTickets === 'function') {
    console.log("Running automatic duplicate ticket cleanup on page load");
    const result = window.clearDuplicateTickets();
    console.log(`Ticket cleanup result: Removed ${result.removed} duplicates. Before: ${result.before}, After: ${result.after}`);
  } else {
    console.warn("clearDuplicateTickets function not available - duplicates may appear");
  }

  // Add event listeners
  if (connectWalletTickets) {
    connectWalletTickets.addEventListener('click', async () => {
      try {
        await window.app.connectWallet();
        // After connecting, check wallet connection status again
        setTimeout(checkWalletConnection, 500);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        window.app.showAlert("Failed to connect wallet. Please try again.", "danger");
      }
    });
  }

  // Add filter event listeners
  viewAllBtn.addEventListener('click', () => filterTickets('all'));
  viewUpcomingBtn.addEventListener('click', () => filterTickets('upcoming'));
  viewPastBtn.addEventListener('click', () => filterTickets('past'));

  // Add fix duplicates button event listener
  const fixDuplicatesBtn = document.getElementById('fix-duplicates');
  if (fixDuplicatesBtn) {
    fixDuplicatesBtn.addEventListener('click', async () => {
      if (typeof window.clearDuplicateTickets === 'function') {
        // Show loading state
        fixDuplicatesBtn.disabled = true;
        fixDuplicatesBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Fixing...';

        // Run the cleanup
        const result = window.clearDuplicateTickets();

        // Show result
        if (result.removed > 0) {
          window.app.showAlert(`Fixed ${result.removed} duplicate tickets!`, "success");
        } else {
          window.app.showAlert("No duplicate tickets found.", "info");
        }

        // Reload tickets
        await loadUserTickets();

        // Reset button
        fixDuplicatesBtn.disabled = false;
        fixDuplicatesBtn.innerHTML = '<i class="fas fa-broom me-1"></i>Fix Duplicates';
      } else {
        window.app.showAlert("Duplicate fixing functionality not available.", "danger");
      }
    });
  }

  // Add modal event listeners
  modalTransferBtn.addEventListener('click', openTransferModal);
  confirmTransfer.addEventListener('click', transferTicket);

  // Add sell modal event listeners
  if (modalSellBtn) {
    modalSellBtn.addEventListener('click', () => openSellModal(ticketsData.find(t => t.id === selectedTicketId)));
  }
  if (confirmListing) {
    confirmListing.addEventListener('click', sellTicket);
  }

  // Check if wallet is connected
  checkWalletConnection();
}

// Function to be called when wallet is connected
function onWalletConnected(account) {
  currentUserAddress = account;
  walletNotConnected.style.display = 'none';
  loadingTickets.classList.remove('d-none');
  loadUserTickets();
}

// Check if wallet is connected
async function checkWalletConnection() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        onWalletConnected(accounts[0]);
      } else {
        // Not connected
        walletNotConnected.style.display = 'block';
        loadingTickets.classList.add('d-none');
        ticketsContainer.classList.add('d-none');
        noTickets.classList.add('d-none');
      }
    } catch (error) {
      console.error("Error checking accounts:", error);
      app.showAlert("Error checking wallet connection", "danger");
    }
  }
}

// Load user's tickets
async function loadUserTickets() {
  if (!currentUserAddress) return;

  try {
    // Clear tickets container
    ticketsContainer.innerHTML = '';
    ticketsData = [];

    let hasTickets = false;

    // First, check if there are any marketplace listings for this user
    const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    const userListings = marketplaceListings.filter(listing =>
      listing.seller && listing.seller.toLowerCase() === currentUserAddress.toLowerCase()
    );

    // Track seen ticket IDs to prevent duplicates
    const seenTicketIds = new Set();

    // Always run the duplicate cleanup before loading tickets
    // This ensures we're working with clean data
    if (typeof window.clearDuplicateTickets === 'function') {
      console.log("Running duplicate ticket cleanup before loading tickets");
      const result = window.clearDuplicateTickets();
      if (result.removed > 0) {
        console.log(`Removed ${result.removed} duplicate tickets during load`);
      }
    }

    // Get the cleaned up tickets from localStorage
    const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

    // Try to load tickets from blockchain
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(app.CONTRACT_ADDRESS, app.CONTRACT_ABI, signer);

      // Get owned ticket IDs
      const ticketIds = await contract.getOwnedTickets(currentUserAddress);

      if (ticketIds.length > 0) {
        hasTickets = true;

        // Update ticket count
        ticketCount.textContent = ticketIds.length;

        // Load each ticket from blockchain
        for (const tokenId of ticketIds) {
          try {
            // Skip if we've already seen this ticket ID
            if (seenTicketIds.has(tokenId.toString())) continue;
            seenTicketIds.add(tokenId.toString());

            // Get token URI
            const tokenURI = await contract.tokenURI(tokenId);

            // Fetch metadata
            const response = await fetch(tokenURI);
            const metadata = await response.json();

            // Create ticket data object
            const ticketData = {
              id: tokenId.toString(),
              name: metadata.name || 'Unnamed Event',
              description: metadata.description || '',
              image: metadata.image || 'images/event-placeholder.jpg',
              date: metadata.attributes?.find(attr => attr.trait_type === 'Event Date')?.value || 'TBA',
              location: metadata.attributes?.find(attr => attr.trait_type === 'Location')?.value || 'TBA',
              type: metadata.attributes?.find(attr => attr.trait_type === 'Ticket Type')?.value || 'General Admission',
              price: metadata.attributes?.find(attr => attr.trait_type === 'Price')?.value || '0.05 ETH',
              status: isUpcoming(metadata.attributes?.find(attr => attr.trait_type === 'Event Date')?.value) ? 'upcoming' : 'past'
            };

            // Add to tickets data
            ticketsData.push(ticketData);

            // Create and append ticket card
            const ticketCard = createTicketCard(ticketData);
            ticketsContainer.appendChild(ticketCard);
          } catch (error) {
            console.error(`Error loading ticket ${tokenId}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn("Error loading tickets from blockchain, falling back to localStorage:", error);
    }

    // If no blockchain tickets or error occurred, try to load from localStorage
    if (!hasTickets) {
      // Get the cleaned up mock tickets (after potential cleanup)
      const cleanedMockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

      // Filter tickets for current user
      const userTickets = cleanedMockTickets.filter(ticket =>
        ticket.owner && ticket.owner.toLowerCase() === currentUserAddress.toLowerCase()
      );

      // Update ticket count
      ticketCount.textContent = userTickets.length;

      if (userTickets.length > 0) {
        hasTickets = true;
        console.log(`Found ${userTickets.length} tickets for user ${currentUserAddress}`);

        // Process each ticket
        for (const ticket of userTickets) {
          // Skip if we've already seen this ticket ID
          if (seenTicketIds.has(ticket.id)) {
            console.log(`Skipping duplicate ticket ID: ${ticket.id}`);
            continue;
          }
          seenTicketIds.add(ticket.id);

          // Check if this ticket is listed in the marketplace
          const isListed = marketplaceListings.some(listing => listing.ticketId === ticket.id);

          // Create ticket data object
          const ticketData = {
            id: ticket.id,
            name: ticket.name || 'Unnamed Event',
            description: ticket.description || '',
            image: ticket.image || 'images/event-placeholder.jpg',
            date: ticket.attributes?.find(attr => attr.trait_type === 'Event Date')?.value || 'TBA',
            location: ticket.attributes?.find(attr => attr.trait_type === 'Location')?.value || 'TBA',
            type: ticket.attributes?.find(attr => attr.trait_type === 'Ticket Type')?.value || 'General Admission',
            price: ticket.attributes?.find(attr => attr.trait_type === 'Price')?.value || '0.05 ETH',
            status: isUpcoming(ticket.attributes?.find(attr => attr.trait_type === 'Event Date')?.value) ? 'upcoming' : 'past',
            isListed: isListed
          };

          // Add to tickets data
          ticketsData.push(ticketData);

          // Create and append ticket card
          const ticketCard = createTicketCard(ticketData);
          ticketsContainer.appendChild(ticketCard);
        }
      }
    }

    // Show appropriate UI based on whether we have tickets
    loadingTickets.classList.add('d-none');

    if (hasTickets) {
      noTickets.classList.add('d-none');
      ticketsContainer.classList.remove('d-none');
    } else {
      noTickets.classList.remove('d-none');
      ticketsContainer.classList.add('d-none');
    }

  } catch (error) {
    console.error("Error loading tickets:", error);
    loadingTickets.classList.add('d-none');

    // Show no tickets message instead of error
    noTickets.classList.remove('d-none');
    ticketsContainer.classList.add('d-none');
  }
}

// Create ticket card element
function createTicketCard(ticket) {
  const col = document.createElement('div');
  col.className = 'col-lg-4 col-md-6';
  col.dataset.status = ticket.status;

  col.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header">
        <div class="event-logo">
          <img src="${ticket.image}" alt="${ticket.name}">
        </div>
        <div class="ticket-status ${ticket.status}">
          <i class="fas ${ticket.status === 'upcoming' ? 'fa-clock' : 'fa-check-circle'} me-1"></i>
          ${ticket.status === 'upcoming' ? 'Upcoming' : 'Past'}
        </div>
        ${ticket.isListed ? `
        <div class="ticket-status" style="right: auto; left: 10px; background-color: #ff9800;">
          <i class="fas fa-tag me-1"></i>
          Listed
        </div>` : ''}
      </div>
      <div class="ticket-body">
        <h3 class="event-name">${ticket.name}</h3>
        <div class="event-details">
          <div class="detail">
            <i class="fas fa-calendar-alt"></i>
            <span>${ticket.date}</span>
          </div>
          <div class="detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>${ticket.location}</span>
          </div>
          <div class="detail">
            <i class="fas fa-ticket-alt"></i>
            <span>Token ID: #${ticket.id}</span>
          </div>
        </div>
      </div>
      <div class="ticket-actions">
        <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.id}">
          <i class="fas fa-eye me-1"></i>View
        </button>
        <button class="btn btn-sm btn-outline-secondary transfer-ticket" data-id="${ticket.id}" ${ticket.isListed ? 'disabled' : ''}>
          <i class="fas fa-exchange-alt me-1"></i>Transfer
        </button>
        <button class="btn btn-sm ${ticket.isListed ? 'btn-outline-warning' : 'btn-outline-success'} sell-ticket" data-id="${ticket.id}">
          <i class="fas ${ticket.isListed ? 'fa-times' : 'fa-tag'} me-1"></i>${ticket.isListed ? 'Unlist' : 'Sell'}
        </button>
      </div>
      <div class="ticket-footer">
        <div class="qr-code" id="qr-${ticket.id}">
          <!-- QR code will be generated here -->
        </div>
        <div class="ticket-info">
          <div class="seat-info">${ticket.type}</div>
          <div class="price-info">Purchased for ${ticket.price}</div>
        </div>
      </div>
    </div>
  `;

  // Generate QR code
  setTimeout(() => {
    const qrContainer = col.querySelector(`#qr-${ticket.id}`);
    if (window.imageHelper && window.imageHelper.generateQRCodeWithFallback) {
      window.imageHelper.generateQRCodeWithFallback(qrContainer, JSON.stringify({
        tokenId: ticket.id,
        contract: app.CONTRACT_ADDRESS,
        network: app.currentNetwork
      }));
    } else {
      generateQRCode(qrContainer, JSON.stringify({
        tokenId: ticket.id,
        contract: app.CONTRACT_ADDRESS,
        network: app.currentNetwork
      }));
    }
  }, 100);

  // Add event listeners
  col.querySelector('.view-ticket').addEventListener('click', () => openTicketModal(ticket));
  col.querySelector('.transfer-ticket').addEventListener('click', () => {
    selectedTicketId = ticket.id;
    openTransferModal();
  });
  col.querySelector('.sell-ticket').addEventListener('click', () => {
    selectedTicketId = ticket.id;
    openSellModal(ticket);
  });

  return col;
}

// Filter tickets
function filterTickets(filter) {
  // Update active button
  viewAllBtn.classList.remove('active');
  viewUpcomingBtn.classList.remove('active');
  viewPastBtn.classList.remove('active');

  if (filter === 'all') {
    viewAllBtn.classList.add('active');
    document.querySelectorAll('#tickets-container > div').forEach(el => {
      el.style.display = 'block';
    });
  } else if (filter === 'upcoming') {
    viewUpcomingBtn.classList.add('active');
    document.querySelectorAll('#tickets-container > div').forEach(el => {
      el.style.display = el.dataset.status === 'upcoming' ? 'block' : 'none';
    });
  } else if (filter === 'past') {
    viewPastBtn.classList.add('active');
    document.querySelectorAll('#tickets-container > div').forEach(el => {
      el.style.display = el.dataset.status === 'past' ? 'block' : 'none';
    });
  }
}

// Open ticket modal
function openTicketModal(ticket) {
  // Set modal content
  modalEventName.textContent = ticket.name;
  modalEventDate.textContent = ticket.date;
  modalEventLocation.textContent = ticket.location;
  modalTicketId.textContent = `Token ID: #${ticket.id}`;
  modalTicketOwner.textContent = `Owner: ${app.truncateAddress(currentUserAddress)}`;
  modalTicketType.textContent = ticket.type;
  modalPurchaseDate.textContent = 'N/A'; // This would come from blockchain events in a full implementation
  modalPurchasePrice.textContent = ticket.price;

  // Set explorer link
  const explorerUrl = app.NETWORK_CONFIG[app.currentNetwork].blockExplorer;
  if (explorerUrl) {
    modalViewOnExplorer.href = `${explorerUrl}/token/${app.CONTRACT_ADDRESS}?a=${ticket.id}`;
    modalViewOnExplorer.classList.remove('d-none');
  } else {
    modalViewOnExplorer.classList.add('d-none');
  }

  // Generate QR code
  if (window.imageHelper && window.imageHelper.generateQRCodeWithFallback) {
    window.imageHelper.generateQRCodeWithFallback(modalQrCode, JSON.stringify({
      tokenId: ticket.id,
      contract: app.CONTRACT_ADDRESS,
      network: app.currentNetwork,
      owner: currentUserAddress
    }));
  } else {
    generateQRCode(modalQrCode, JSON.stringify({
      tokenId: ticket.id,
      contract: app.CONTRACT_ADDRESS,
      network: app.currentNetwork,
      owner: currentUserAddress
    }));
  }

  // Set selected ticket ID
  selectedTicketId = ticket.id;

  // Show modal
  const modal = new bootstrap.Modal(ticketModal);
  modal.show();
}

// Open transfer modal
function openTransferModal() {
  // Clear previous inputs
  recipientAddress.value = '';
  transferStatus.innerHTML = '';

  // Show modal
  const modal = new bootstrap.Modal(transferModal);
  modal.show();
}

// Transfer ticket
async function transferTicket() {
  if (!selectedTicketId || !recipientAddress.value) {
    transferStatus.innerHTML = `
      <div class="alert alert-danger">
        Please enter a recipient address
      </div>
    `;
    return;
  }

  // Validate address
  if (!ethers.utils.isAddress(recipientAddress.value)) {
    transferStatus.innerHTML = `
      <div class="alert alert-danger">
        Invalid Ethereum address
      </div>
    `;
    return;
  }

  // Disable button and show loading
  confirmTransfer.disabled = true;
  confirmTransfer.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Processing...
  `;

  try {
    let transferSuccessful = false;

    // Try to transfer on blockchain first
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(app.CONTRACT_ADDRESS, app.CONTRACT_ABI, signer);

      // Transfer ticket
      const tx = await contract.transferTicket(
        currentUserAddress,
        recipientAddress.value,
        selectedTicketId
      );

      transferStatus.innerHTML = `
        <div class="alert alert-info">
          Transaction submitted. Waiting for confirmation...
        </div>
      `;

      // Wait for transaction to be mined
      await tx.wait();
      transferSuccessful = true;
    } catch (blockchainError) {
      console.warn("Blockchain transfer failed, trying localStorage:", blockchainError);

      // If blockchain transfer fails, try localStorage
      // Get mock tickets from localStorage
      const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

      // Find the ticket to transfer
      const ticketIndex = mockTickets.findIndex(ticket =>
        ticket.id === selectedTicketId &&
        ticket.owner &&
        ticket.owner.toLowerCase() === currentUserAddress.toLowerCase()
      );

      if (ticketIndex !== -1) {
        // Update the owner
        mockTickets[ticketIndex].owner = recipientAddress.value;

        // Save back to localStorage
        localStorage.setItem('mockTickets', JSON.stringify(mockTickets));

        // Simulate blockchain delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        transferSuccessful = true;
      } else {
        throw new Error("Ticket not found or you don't own this ticket");
      }
    }

    if (transferSuccessful) {
      transferStatus.innerHTML = `
        <div class="alert alert-success">
          Ticket successfully transferred!
        </div>
      `;

      // Reload tickets after a short delay
      setTimeout(() => {
        loadUserTickets();

        // Close modal after a delay
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(transferModal);
          modal.hide();
        }, 1500);
      }, 2000);
    }

  } catch (error) {
    console.error("Error transferring ticket:", error);

    let errorMessage = "Error transferring ticket. Please try again.";
    if (error.message) {
      if (error.message.includes("Transfer not approved or after lock time")) {
        errorMessage = "Transfer not allowed: Ticket is locked or requires approval.";
      } else if (error.message.includes("Sender does not own the ticket") || error.message.includes("you don't own this ticket")) {
        errorMessage = "You don't own this ticket.";
      }
    }

    transferStatus.innerHTML = `
      <div class="alert alert-danger">
        ${errorMessage}
      </div>
    `;

    // Re-enable button
    confirmTransfer.disabled = false;
    confirmTransfer.innerHTML = `
      <i class="fas fa-paper-plane me-1"></i>Transfer Ticket
    `;
  }
}

// Generate QR code
function generateQRCode(container, data) {
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Create QR code
  const qrCode = new QRCode(container, {
    text: data,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Open sell modal
function openSellModal(ticket) {
  if (!ticket) return;

  // Check if ticket is already listed
  if (ticket.isListed) {
    // Confirm unlisting
    if (confirm(`Are you sure you want to remove "${ticket.name}" from the marketplace?`)) {
      unlistTicket(ticket.id);
    }
    return;
  }

  // Set ticket details in the modal
  sellTicketImage.src = ticket.image || 'images/event-placeholder.jpg';
  sellTicketName.textContent = ticket.name;
  sellTicketDetails.textContent = `${ticket.date} • ${ticket.location}`;

  // Set default price (you can adjust this logic)
  const originalPrice = parseFloat(ticket.price.replace(' ETH', ''));
  listingPrice.value = originalPrice.toFixed(3);

  // Clear any previous status
  sellStatus.innerHTML = '';

  // Show the modal
  const modal = new bootstrap.Modal(sellModal);
  modal.show();
}

// Function to unlist a ticket from the marketplace
async function unlistTicket(ticketId) {
  try {
    // Get marketplace listings
    let marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');

    // Find the listing index
    const listingIndex = marketplaceListings.findIndex(listing =>
      listing.ticketId === ticketId &&
      listing.seller &&
      listing.seller.toLowerCase() === currentUserAddress.toLowerCase()
    );

    if (listingIndex === -1) {
      throw new Error("Listing not found or you don't own this ticket");
    }

    // Remove the listing
    marketplaceListings.splice(listingIndex, 1);

    // Save back to localStorage
    localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings));

    // Show success message
    app.showAlert("Ticket removed from marketplace", "success");

    // Reload tickets
    setTimeout(() => {
      loadUserTickets();
    }, 1000);

  } catch (error) {
    console.error("Error unlisting ticket:", error);
    app.showAlert(error.message || "Error unlisting ticket", "danger");
  }
}

// Sell ticket function
async function sellTicket() {
  if (!selectedTicketId) {
    sellStatus.innerHTML = `
      <div class="alert alert-danger">
        No ticket selected
      </div>
    `;
    return;
  }

  const price = parseFloat(listingPrice.value);
  if (isNaN(price) || price <= 0 || price > 1) {
    sellStatus.innerHTML = `
      <div class="alert alert-danger">
        Please enter a valid price between 0.001 and 1 ETH
      </div>
    `;
    return;
  }

  // Disable button and show loading
  confirmListing.disabled = true;
  confirmListing.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Processing...
  `;

  try {
    let listingSuccessful = false;

    // Try to list on blockchain first
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(app.CONTRACT_ADDRESS, app.CONTRACT_ABI, signer);

      // This would be the actual blockchain call in a real implementation
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate blockchain error to fall back to localStorage
      throw new Error("Blockchain listing not implemented");

    } catch (blockchainError) {
      console.warn("Blockchain listing failed, using localStorage:", blockchainError);

      // Get the ticket data
      const ticket = ticketsData.find(t => t.id === selectedTicketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Get existing listings or initialize empty array
      let marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');

      // Check if ticket is already listed
      const existingListing = marketplaceListings.find(listing => listing.ticketId === selectedTicketId);
      if (existingListing) {
        throw new Error("This ticket is already listed for sale");
      }

      // Create listing object
      const listing = {
        id: Date.now().toString(),
        ticketId: selectedTicketId,
        seller: currentUserAddress,
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
      sellStatus.innerHTML = `
        <div class="alert alert-success">
          Ticket successfully listed for sale!
        </div>
      `;

      // Show success message
      window.app.showAlert("Your ticket has been listed on the marketplace!", "success");

      // Close modal after a delay
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(sellModal);
        modal.hide();

        // Redirect to marketplace
        window.location.href = 'marketplace.html';
      }, 2000);
    }

  } catch (error) {
    console.error("Error listing ticket:", error);

    sellStatus.innerHTML = `
      <div class="alert alert-danger">
        ${error.message || "Error listing ticket. Please try again."}
      </div>
    `;

    // Re-enable button
    confirmListing.disabled = false;
    confirmListing.innerHTML = `
      <i class="fas fa-tag me-1"></i>List for Sale
    `;
  }
}

// Check if date is in the future
function isUpcoming(dateString) {
  if (!dateString) return true;

  try {
    // Handle different date formats
    let eventDate;

    // Try to parse the date string
    if (dateString.includes('-')) {
      // Format: YYYY-MM-DD
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      eventDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
    } else if (dateString.includes('/')) {
      // Format: MM/DD/YYYY
      const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
      eventDate = new Date(year, month - 1, day);
    } else {
      // Try to parse as a natural language date
      eventDate = new Date(dateString);
    }

    // Check if the date is valid
    if (isNaN(eventDate.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return true; // Default to upcoming if we can't parse the date
    }

    const now = new Date();

    // Set both dates to midnight for fair comparison
    eventDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return eventDate >= now;
  } catch (e) {
    console.error("Error parsing date:", e);
    return true; // Default to upcoming if there's an error
  }
}
