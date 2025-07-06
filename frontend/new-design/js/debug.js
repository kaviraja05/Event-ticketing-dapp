// Debug helper functions

// Function to display localStorage contents
function displayLocalStorage() {
  console.log("=== LOCAL STORAGE CONTENTS ===");

  // Mock tickets
  const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
  console.log("Mock Tickets:", mockTickets);

  // Marketplace listings
  const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
  console.log("Marketplace Listings:", marketplaceListings);

  // Return values for display in alert
  return {
    ticketCount: mockTickets.length,
    listingCount: marketplaceListings.length
  };
}

// Function to clear duplicate tickets
function clearDuplicateTickets() {
  const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
  console.log("Original tickets:", mockTickets.length);

  // Group tickets by ID and owner
  const ticketGroups = {};

  for (const ticket of mockTickets) {
    if (!ticket.id) {
      console.log("Skipping ticket without ID:", ticket);
      continue;
    }

    // Create a unique key based on ID and owner (case-insensitive)
    // If owner is missing, use 'unknown' as the owner
    const owner = ticket.owner ? ticket.owner.toLowerCase() : 'unknown';
    const key = `${ticket.id}-${owner}`;

    if (!ticketGroups[key]) {
      ticketGroups[key] = [];
    }

    ticketGroups[key].push(ticket);
  }

  // Keep only one ticket from each group (the most complete one)
  const uniqueTickets = [];
  let duplicatesFound = 0;

  for (const key in ticketGroups) {
    if (ticketGroups[key].length > 0) {
      if (ticketGroups[key].length > 1) {
        console.log(`Found ${ticketGroups[key].length} duplicates for key: ${key}`);
        duplicatesFound += ticketGroups[key].length - 1;
      }

      // Sort tickets by "completeness" - more attributes is better
      const sortedTickets = ticketGroups[key].sort((a, b) => {
        const aScore = getTicketCompletenessScore(a);
        const bScore = getTicketCompletenessScore(b);
        return bScore - aScore; // Higher score first
      });

      // Keep only the most complete ticket
      uniqueTickets.push(sortedTickets[0]);
    }
  }

  console.log(`Found and removed ${duplicatesFound} duplicate tickets`);

  // Save back to localStorage
  localStorage.setItem('mockTickets', JSON.stringify(uniqueTickets));

  // Also update any marketplace listings to use the remaining tickets
  updateMarketplaceListings(uniqueTickets);

  return {
    before: mockTickets.length,
    after: uniqueTickets.length,
    removed: mockTickets.length - uniqueTickets.length
  };
}

// Make clearDuplicateTickets globally accessible
window.clearDuplicateTickets = clearDuplicateTickets;

// Helper function to score a ticket's completeness
function getTicketCompletenessScore(ticket) {
  let score = 0;

  // Basic properties
  if (ticket.id) score += 1;
  if (ticket.name) score += 1;
  if (ticket.owner) score += 1;
  if (ticket.image) score += 1;

  // Check attributes
  if (ticket.attributes && Array.isArray(ticket.attributes)) {
    score += ticket.attributes.length;

    // Extra points for important attributes
    const hasDate = ticket.attributes.some(attr => attr.trait_type === 'Event Date');
    const hasLocation = ticket.attributes.some(attr => attr.trait_type === 'Location');
    const hasPrice = ticket.attributes.some(attr => attr.trait_type === 'Price');

    if (hasDate) score += 2;
    if (hasLocation) score += 2;
    if (hasPrice) score += 2;
  }

  return score;
}

// Update marketplace listings to reference the remaining tickets
function updateMarketplaceListings(validTickets) {
  const marketplaceListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
  const validTicketIds = validTickets.map(ticket => ticket.id);

  // Filter out listings for tickets that no longer exist
  const validListings = marketplaceListings.filter(listing =>
    validTicketIds.includes(listing.ticketId)
  );

  // Update the ticketData in each listing to match the valid ticket
  for (const listing of validListings) {
    const validTicket = validTickets.find(ticket => ticket.id === listing.ticketId);
    if (validTicket) {
      listing.ticketData = validTicket;
    }
  }

  // Save back to localStorage
  localStorage.setItem('marketplaceListings', JSON.stringify(validListings));

  return {
    before: marketplaceListings.length,
    after: validListings.length
  };
}

// Function to fix ticket dates
function fixTicketDates() {
  const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');
  let fixedCount = 0;

  for (let i = 0; i < mockTickets.length; i++) {
    const ticket = mockTickets[i];

    // Check if ticket has attributes
    if (ticket.attributes) {
      const dateAttr = ticket.attributes.find(attr => attr.trait_type === 'Event Date');
      if (dateAttr) {
        // Parse the date
        try {
          const date = new Date(dateAttr.value);

          // Set to future date for testing
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + 1); // One month in the future

          // Update the date attribute
          dateAttr.value = futureDate.toISOString().split('T')[0];
          fixedCount++;
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
    }
  }

  // Save back to localStorage
  localStorage.setItem('mockTickets', JSON.stringify(mockTickets));

  return {
    total: mockTickets.length,
    fixed: fixedCount
  };
}

// Function to add mock tickets to the current wallet
// Make it globally accessible
window.addMockTicketsToWallet = function() {
  // Check if wallet is connected
  if (!window.ethereum || !window.ethereum.selectedAddress) {
    alert('Please connect your wallet first!');
    return { added: 0 };
  }

  const currentAddress = window.ethereum.selectedAddress;
  const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

  // Sample ticket data
  const newTickets = [
    {
      id: 'ticket-' + Date.now() + '-1',
      name: 'Tech Summit 2023',
      owner: currentAddress,
      image: 'images/event-placeholder.jpg',
      attributes: [
        { trait_type: 'Event Date', value: '2023-12-15' },
        { trait_type: 'Location', value: 'San Francisco Convention Center' },
        { trait_type: 'Seat', value: 'A-12' },
        { trait_type: 'Price', value: '0.05 ETH' }
      ]
    },
    {
      id: 'ticket-' + Date.now() + '-2',
      name: 'Summer Music Festival',
      owner: currentAddress,
      image: 'images/event-placeholder.jpg',
      attributes: [
        { trait_type: 'Event Date', value: '2023-08-20' },
        { trait_type: 'Location', value: 'Central Park' },
        { trait_type: 'Seat', value: 'General Admission' },
        { trait_type: 'Price', value: '0.03 ETH' }
      ]
    },
    {
      id: 'ticket-' + Date.now() + '-3',
      name: 'Championship Basketball Game',
      owner: currentAddress,
      image: 'images/event-placeholder.jpg',
      attributes: [
        { trait_type: 'Event Date', value: '2023-11-05' },
        { trait_type: 'Location', value: 'Madison Square Garden' },
        { trait_type: 'Seat', value: 'Section 101, Row 3' },
        { trait_type: 'Price', value: '0.08 ETH' }
      ]
    }
  ];

  // Add the new tickets to the existing ones
  mockTickets.push(...newTickets);

  // Save back to localStorage
  localStorage.setItem('mockTickets', JSON.stringify(mockTickets));

  // Fix the dates to ensure they're in the future
  fixTicketDates();

  // Try to reload the tickets in the UI if we're on the marketplace page
  if (typeof loadUserTicketsForSale === 'function') {
    console.log("Reloading user tickets in the UI...");
    setTimeout(() => {
      loadUserTicketsForSale();
    }, 500);
  }

  return { added: newTickets.length };
}

// Add debug buttons to the page
document.addEventListener('DOMContentLoaded', function() {
  // Create debug container
  const debugContainer = document.createElement('div');
  debugContainer.style.position = 'fixed';
  debugContainer.style.bottom = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugContainer.style.padding = '10px';
  debugContainer.style.borderRadius = '5px';
  debugContainer.style.display = 'flex';
  debugContainer.style.flexDirection = 'column';
  debugContainer.style.gap = '5px';

  // Add buttons
  const showStorageBtn = document.createElement('button');
  showStorageBtn.textContent = 'Show Storage';
  showStorageBtn.className = 'btn btn-sm btn-info';
  showStorageBtn.addEventListener('click', function() {
    const result = displayLocalStorage();
    alert(`LocalStorage contains ${result.ticketCount} tickets and ${result.listingCount} listings. Check console for details.`);
  });

  const fixDuplicatesBtn = document.createElement('button');
  fixDuplicatesBtn.textContent = 'Fix Duplicates';
  fixDuplicatesBtn.className = 'btn btn-sm btn-warning';
  fixDuplicatesBtn.addEventListener('click', function() {
    const result = clearDuplicateTickets();
    alert(`Removed ${result.removed} duplicate tickets. Before: ${result.before}, After: ${result.after}`);
    window.location.reload();
  });

  const fixDatesBtn = document.createElement('button');
  fixDatesBtn.textContent = 'Fix Dates';
  fixDatesBtn.className = 'btn btn-sm btn-success';
  fixDatesBtn.addEventListener('click', function() {
    const result = fixTicketDates();
    alert(`Fixed dates for ${result.fixed} out of ${result.total} tickets.`);
    window.location.reload();
  });

  const addTicketsBtn = document.createElement('button');
  addTicketsBtn.textContent = 'Add Test Tickets';
  addTicketsBtn.className = 'btn btn-sm btn-primary';
  addTicketsBtn.addEventListener('click', async function() {
    // Check if wallet is connected
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    // Add the tickets
    const result = addMockTicketsToWallet();

    if (result.added > 0) {
      alert(`Added ${result.added} test tickets to your wallet.`);

      // Try to update the UI directly if we're on the marketplace page
      if (typeof loadUserTicketsForSale === 'function') {
        try {
          // Update the sell form UI if needed
          const sellWalletRequired = document.getElementById('sell-wallet-required');
          const sellTicketForm = document.getElementById('sell-ticket-form');

          if (sellWalletRequired && sellTicketForm) {
            sellWalletRequired.classList.add('d-none');
            sellTicketForm.classList.remove('d-none');
          }

          // Force reload the tickets in the dropdown
          await loadUserTicketsForSale();

          // No need to reload the page
          alert('Tickets added and UI updated. You should now see tickets in the dropdown.');
        } catch (error) {
          console.error("Error updating UI after adding tickets:", error);
          alert('Tickets added but there was an error updating the UI. Please refresh the page.');
          window.location.reload();
        }
      } else {
        // If we're not on the marketplace page, just reload
        window.location.reload();
      }
    }
  });

  // Add buttons to container
  debugContainer.appendChild(showStorageBtn);
  debugContainer.appendChild(fixDuplicatesBtn);
  debugContainer.appendChild(fixDatesBtn);
  debugContainer.appendChild(addTicketsBtn);

  // Add container to page
  document.body.appendChild(debugContainer);
});
