// Main Application JavaScript

// Network Configuration
const NETWORK_CONFIG = {
  hardhat: {
    name: "Hardhat Local",
    chainId: "0x7A69", // 31337 in hex
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  },
  sepolia: {
    name: "Sepolia Testnet",
    chainId: "0xaa36a7", // 11155111 in hex
    rpcUrl: "https://sepolia.infura.io/v3/",
    blockExplorer: "https://sepolia.etherscan.io",
    contractAddress: "0x5d54626E5D78bd54C24C6De371BB0C748Ce42964" // Your deployed contract address
  }
};

// Default to Hardhat network
let currentNetwork = 'hardhat';
let CONTRACT_ADDRESS = NETWORK_CONFIG[currentNetwork].contractAddress;

// Contract ABI (simplified for brevity)
const CONTRACT_ABI = [
  "function mintTicket(address to, string memory tokenURI) public onlyOwner",
  "function transferTicket(address from, address to, uint256 tokenId) public",
  "function isValidTicket(uint256 tokenId) public view returns (address ownerAddress, bool exists)",
  "function getOwnedTickets(address user) public view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approveTransfer(uint256 tokenId) public onlyOwner",
  "function approvedTransfers(uint256) view returns (bool)",
  "function lockTimestamp() view returns (uint256)",
  "function maxResalePrice() view returns (uint256)"
];

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const networkBadge = document.getElementById('network-badge');
const networkName = document.getElementById('network-name');

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);

// Initialize the application
async function initialize() {
  // Clean up any duplicate tickets in localStorage
  cleanupDuplicateTickets();

  // Check if MetaMask is installed
  if (typeof window.ethereum !== 'undefined') {
    // Add event listeners
    connectWalletBtn.addEventListener('click', connectWallet);

    // Check if already connected
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error("Error checking accounts:", error);
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Listen for chain changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    // Check current network
    checkNetwork();

    // Add scroll event for navbar
    window.addEventListener('scroll', handleScroll);
  } else {
    // MetaMask not installed
    connectWalletBtn.textContent = 'Install MetaMask';
    connectWalletBtn.addEventListener('click', () => {
      window.open('https://metamask.io/download.html', '_blank');
    });

    // Show alert
    showAlert('MetaMask is not installed. Please install MetaMask to use this application.', 'warning');
  }
}

// Clean up duplicate tickets in localStorage
function cleanupDuplicateTickets() {
  try {
    // Check if we have the clearDuplicateTickets function from debug.js
    if (typeof clearDuplicateTickets === 'function') {
      console.log("Checking for duplicate tickets...");

      // Get tickets from localStorage
      const mockTickets = JSON.parse(localStorage.getItem('mockTickets') || '[]');

      // Group tickets by ID and owner to identify duplicates
      const ticketGroups = {};
      for (const ticket of mockTickets) {
        // Create a unique key based on ID and owner
        const key = `${ticket.id}-${ticket.owner || 'unknown'}`;

        if (!ticketGroups[key]) {
          ticketGroups[key] = [];
        }

        ticketGroups[key].push(ticket);
      }

      // Check if we have any duplicates
      let hasDuplicates = false;
      for (const key in ticketGroups) {
        if (ticketGroups[key].length > 1) {
          hasDuplicates = true;
          break;
        }
      }

      // If we have duplicates, clean them up
      if (hasDuplicates) {
        console.log("Found duplicate tickets, cleaning up...");
        const result = clearDuplicateTickets();
        console.log(`Removed ${result.removed} duplicate tickets`);
      } else {
        console.log("No duplicate tickets found");
      }
    }
  } catch (error) {
    console.error("Error cleaning up duplicate tickets:", error);
  }
}

// Connect wallet function
async function connectWallet() {
  return new Promise(async (resolve, reject) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);

        // Check network after connecting
        await checkNetwork();

        // Show success message
        showAlert('Wallet connected successfully!', 'success');

        // Resolve with the connected account
        resolve(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        if (error.code === 4001) {
          // User rejected the request
          showAlert('Please connect to MetaMask to use this application.', 'warning');
        } else {
          showAlert('Error connecting to MetaMask. Please try again.', 'danger');
        }
        reject(error);
      }
    } else {
      const error = new Error('MetaMask is not installed');
      showAlert('MetaMask is not installed. Please install MetaMask to use this application.', 'warning');
      reject(error);
    }
  });
}

// Handle accounts changed
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // No accounts - user logged out
    connectWalletBtn.innerHTML = '<i class="fas fa-wallet me-2"></i>Connect Wallet';
    networkBadge.classList.remove('connected');
    networkName.textContent = 'Not Connected';

    // Show alert
    showAlert('Please connect to MetaMask to use this application.', 'warning');

    // Hide user-specific elements if any
    document.querySelectorAll('.wallet-connected').forEach(el => {
      el.style.display = 'none';
    });

    // Show wallet not connected elements if any
    document.querySelectorAll('.wallet-not-connected').forEach(el => {
      el.style.display = 'block';
    });
  } else {
    // User connected
    const account = accounts[0];
    const shortAccount = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    connectWalletBtn.innerHTML = `<i class="fas fa-user-circle me-2"></i>${shortAccount}`;

    // Show user-specific elements if any
    document.querySelectorAll('.wallet-connected').forEach(el => {
      el.style.display = 'block';
    });

    // Hide wallet not connected elements if any
    document.querySelectorAll('.wallet-not-connected').forEach(el => {
      el.style.display = 'none';
    });

    // Trigger any page-specific wallet connected events
    if (typeof onWalletConnected === 'function') {
      onWalletConnected(account);
    }
  }
}

// Check current network
async function checkNetwork() {
  if (typeof window.ethereum === 'undefined') return;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (chainId === NETWORK_CONFIG.hardhat.chainId) {
      currentNetwork = 'hardhat';
      updateNetworkUI('hardhat');
    } else if (chainId === NETWORK_CONFIG.sepolia.chainId) {
      currentNetwork = 'sepolia';
      updateNetworkUI('sepolia');
    } else {
      // Unknown network
      networkBadge.classList.remove('connected');
      networkName.textContent = 'Unknown Network';

      // Show alert
      showAlert('Please connect to Hardhat Local or Sepolia Testnet.', 'warning');
    }

    // Update contract address based on network
    CONTRACT_ADDRESS = NETWORK_CONFIG[currentNetwork].contractAddress;

  } catch (error) {
    console.error('Error checking network:', error);
  }
}

// Update network UI
function updateNetworkUI(network) {
  networkBadge.classList.add('connected');

  if (network === 'hardhat') {
    networkName.textContent = 'Hardhat Local';
  } else if (network === 'sepolia') {
    networkName.textContent = 'Sepolia Testnet';
  }
}

// Switch network
async function switchNetwork(targetNetwork) {
  if (typeof window.ethereum === 'undefined') {
    showAlert('MetaMask is not installed!', 'warning');
    return;
  }

  try {
    if (targetNetwork === 'sepolia') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }],
      });
    } else if (targetNetwork === 'hardhat') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.hardhat.chainId }],
      });
    }

    // The network change will trigger a chainChanged event, which will reload the page
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 && targetNetwork === 'sepolia') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: NETWORK_CONFIG.sepolia.chainId,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: [NETWORK_CONFIG.sepolia.rpcUrl],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
        showAlert('Error adding Sepolia network. Please try again.', 'danger');
      }
    } else {
      console.error('Error switching network:', switchError);
      showAlert('Error switching network. Please try again.', 'danger');
    }
  }
}

// Handle scroll for navbar
function handleScroll() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Show alert function
function showAlert(message, type = 'info', duration = 5000) {
  // Create alert element
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4`;
  alertEl.style.zIndex = '9999';
  alertEl.style.maxWidth = '90%';
  alertEl.style.width = '500px';

  alertEl.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Add to body
  document.body.appendChild(alertEl);

  // Auto dismiss after duration
  setTimeout(() => {
    const bsAlert = new bootstrap.Alert(alertEl);
    bsAlert.close();
  }, duration);
}

// Helper function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to truncate address
function truncateAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Handle image loading errors
function handleImageErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      // Check image type and apply appropriate fallback
      if (this.src.includes('event-')) {
        this.src = 'images/event-placeholder.jpg';
      } else if (this.src.includes('hero-')) {
        this.src = 'images/event-placeholder.jpg';
      } else if (this.src.includes('qr-')) {
        this.src = 'images/qr-placeholder.png';
        // If QR placeholder is also missing, create a simple placeholder
        this.onerror = function() {
          this.onerror = null;
          this.parentElement.classList.add('placeholder-image');
          this.parentElement.innerHTML = '<i class="fas fa-qrcode"></i>';
        };
      } else {
        // Generic fallback
        this.onerror = null;
        this.parentElement.classList.add('placeholder-image');
        this.parentElement.innerHTML = '<i class="fas fa-image"></i>';
      }
    };
  });
}

// Call handleImageErrors when DOM is loaded
document.addEventListener('DOMContentLoaded', handleImageErrors);

// Export functions for use in other scripts
window.app = {
  connectWallet,
  switchNetwork,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  NETWORK_CONFIG,
  currentNetwork,
  formatDate,
  truncateAddress,
  showAlert,
  handleImageErrors
};
