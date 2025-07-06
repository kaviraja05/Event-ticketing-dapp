// My Tickets page functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  initializeMyTicketsPage();
  
  // Set up event listeners
  setupEventListeners();
});

// Initialize the my tickets page
function initializeMyTicketsPage() {
  // Check if wallet is connected
  checkWalletConnection();
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
}

// Check wallet connection status
async function checkWalletConnection() {
  const connectWalletBtn = document.getElementById('connect-wallet');
  const networkBadge = document.getElementById('network-badge');
  const networkName = document.getElementById('network-name');
  const walletRequired = document.getElementById('wallet-required');
  const ticketsContainer = document.getElementById('tickets-container');
  
  // If we already have a connection from the main app.js
  if (window.ethereum && window.ethereum.selectedAddress) {
    // Update connect button
    connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortenAddress(window.ethereum.selectedAddress)}`;
    connectWalletBtn.classList.remove('btn-outline-light');
    connectWalletBtn.classList.add('btn-light');
    
    // Update network badge
    if (window.currentNetwork) {
      networkName.textContent = networks[window.currentNetwork].name;
      networkBadge.querySelector('.dot').classList.add('connected');
    }
    
    // Show tickets container, hide wallet required message
    walletRequired.classList.add('d-none');
    ticketsContainer.classList.remove('d-none');
    
    // Load user's tickets
    loadUserTickets();
  }
}

// Connect wallet function
async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (window.ethereum) {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Update UI
      const connectWalletBtn = document.getElementById('connect-wallet');
      connectWalletBtn.innerHTML = `<i class="fas fa-wallet me-2"></i>${shortenAddress(account)}`;
      connectWalletBtn.classList.remove('btn-outline-light');
      connectWalletBtn.classList.add('btn-light');
      
      // Show tickets container, hide wallet required message
      const walletRequired = document.getElementById('wallet-required');
      const ticketsContainer = document.getElementById('tickets-container');
      walletRequired.classList.add('d-none');
      ticketsContainer.classList.remove('d-none');
      
      // Load user's tickets
      loadUserTickets();
      
      // Update network info
      updateNetworkInfo();
      
    } else {
      alert('MetaMask is not installed. Please install it to use this dApp: https://metamask.io/download.html');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
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

// Load user's tickets from the blockchain
async function loadUserTickets() {
  try {
    // Clear existing tickets
    const activeTicketsContainer = document.getElementById('active-tickets-container');
    const pastTicketsContainer = document.getElementById('past-tickets-container');
    const noActiveTickets = document.getElementById('no-active-tickets');
    const noPastTickets = document.getElementById('no-past-tickets');
    
    // Check if we have a connected wallet and contract
    if (window.ethereum && window.ethereum.selectedAddress && window.contract) {
      // Here you would fetch tickets from your smart contract
      console.log("Connected to contract, would fetch tickets here");
      
      // Example of how you might fetch tickets from contract:
      // const ticketCount = await window.contract.balanceOf(window.ethereum.selectedAddress);
      // 
      // if (ticketCount > 0) {
      //   noActiveTickets.classList.add('d-none');
      //   
      //   for (let i = 0; i < ticketCount; i++) {
      //     const tokenId = await window.contract.tokenOfOwnerByIndex(window.ethereum.selectedAddress, i);
      //     const tokenURI = await window.contract.tokenURI(tokenId);
      //     
      //     // Fetch metadata from tokenURI
      //     const response = await fetch(tokenURI);
      //     const metadata = await response.json();
      //     
      //     // Add ticket to the page
      //     addTicketToPage(tokenId, metadata);
      //   }
      // }
      
      // For now, let's add some mock tickets for demonstration
      addMockTickets();
      
    } else {
      console.log("No contract connection");
    }
  } catch (error) {
    console.error("Error loading tickets:", error);
  }
}

// Add mock tickets for demonstration
function addMockTickets() {
  const activeTicketsContainer = document.getElementById('active-tickets-container');
  const pastTicketsContainer = document.getElementById('past-tickets-container');
  const noActiveTickets = document.getElementById('no-active-tickets');
  const noPastTickets = document.getElementById('no-past-tickets');
  
  // Hide the "no tickets" messages
  noActiveTickets.classList.add('d-none');
  noPastTickets.classList.add('d-none');
  
  // Add some mock active tickets
  const activeTickets = [
    {
      id: 'NFT #1234',
      title: 'Summer Music Festival',
      date: 'June 15, 2023 - 7:00 PM',
      location: 'Central Park, New York',
      image: 'images/event-1.jpg',
      status: 'active'
    },
    {
      id: 'NFT #5678',
      title: 'Blockchain Conference 2023',
      date: 'July 22, 2023 - 9:00 AM',
      location: 'Tech Center, San Francisco',
      image: 'images/event-2.jpg',
      status: 'active'
    }
  ];
  
  // Add some mock past tickets
  const pastTickets = [
    {
      id: 'NFT #9012',
      title: 'Tech Summit 2022',
      date: 'November 10, 2022 - 10:00 AM',
      location: 'Convention Center, Seattle',
      image: 'images/event-2.jpg',
      status: 'past'
    }
  ];
  
  // Add active tickets to the page
  activeTickets.forEach(ticket => {
    addTicketToPage(ticket, activeTicketsContainer);
  });
  
  // Add past tickets to the page
  pastTickets.forEach(ticket => {
    addTicketToPage(ticket, pastTicketsContainer);
  });
}

// Add a ticket to the page
function addTicketToPage(ticket, container) {
  // Get the template
  const template = document.getElementById('ticket-template');
  const ticketElement = document.importNode(template.content, true);
  
  // Set the ticket data
  ticketElement.querySelector('.ticket-title').textContent = ticket.title;
  ticketElement.querySelector('.ticket-date').textContent = ticket.date;
  ticketElement.querySelector('.ticket-location').textContent = ticket.location;
  ticketElement.querySelector('.ticket-id').textContent = ticket.id;
  ticketElement.querySelector('.ticket-image').src = ticket.image;
  ticketElement.querySelector('.ticket-image').alt = ticket.title;
  
  // Set the status badge
  const statusElement = ticketElement.querySelector('.ticket-status');
  if (ticket.status === 'active') {
    statusElement.textContent = 'Active';
    statusElement.classList.add('active');
  } else {
    statusElement.textContent = 'Past';
    statusElement.classList.add('past');
  }
  
  // Add event listener to view ticket button
  ticketElement.querySelector('.view-ticket-btn').addEventListener('click', function() {
    // Here you would navigate to the ticket details page
    // For now, just log to console
    console.log('View ticket:', ticket.id);
    alert('Ticket details would open here. This is a mock implementation.');
  });
  
  // Add the ticket to the container
  container.appendChild(ticketElement);
}

// Helper function to shorten address
function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}
