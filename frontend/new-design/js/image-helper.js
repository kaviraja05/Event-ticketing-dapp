/**
 * Image Helper Functions
 * This file contains utility functions for handling images in the DApp
 */

// Create a placeholder image if needed
function createPlaceholderImage(container, type = 'generic', size = 200) {
  // Clear the container
  container.innerHTML = '';
  container.classList.add('placeholder-image');

  // Set dimensions
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;

  // Add appropriate icon based on type
  let icon = 'fa-image';

  if (type === 'event') {
    icon = 'fa-calendar-alt';
  } else if (type === 'qr') {
    icon = 'fa-qrcode';
  } else if (type === 'ticket') {
    icon = 'fa-ticket-alt';
  }

  // Create icon element
  const iconElement = document.createElement('i');
  iconElement.className = `fas ${icon}`;
  container.appendChild(iconElement);

  return container;
}

// Function to optimize image loading
function optimizeImages() {
  // Add loading="lazy" to all images not in the viewport
  document.querySelectorAll('img').forEach(img => {
    if (!isInViewport(img)) {
      img.setAttribute('loading', 'lazy');
    }
  });

  // Add srcset for responsive images if available
  document.querySelectorAll('img[data-srcset]').forEach(img => {
    img.srcset = img.dataset.srcset;
  });
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Generate a QR code with fallback
function generateQRCodeWithFallback(container, data, options = {}) {
  if (!container) return;

  // Default options
  const defaultOptions = {
    width: 128,
    height: 128,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };

  // Merge options
  const qrOptions = {...defaultOptions, ...options};

  // Clear container
  container.innerHTML = '';

  try {
    // Try to generate QR code
    if (typeof QRCode !== 'undefined') {
      // Create a canvas element for the QR code
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);

      // Use the QRCode library to generate the code
      QRCode.toCanvas(canvas, data, qrOptions, function(error) {
        if (error) {
          console.error('QR code generation error:', error);
          createPlaceholderImage(container, 'qr', qrOptions.width);
        }
      });
    } else {
      // QRCode library not available
      createPlaceholderImage(container, 'qr', qrOptions.width);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    createPlaceholderImage(container, 'qr', qrOptions.width);
  }
}

// Initialize image helpers
document.addEventListener('DOMContentLoaded', function() {
  optimizeImages();

  // Re-run on window resize
  window.addEventListener('resize', optimizeImages);

  // Handle image errors
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      const container = this.parentElement;
      let type = 'generic';

      if (this.src.includes('event-')) {
        type = 'event';
      } else if (this.src.includes('qr-')) {
        type = 'qr';
      } else if (this.src.includes('ticket-')) {
        type = 'ticket';
      }

      // Remove the img element
      this.remove();

      // Create placeholder
      createPlaceholderImage(container, type);
    };
  });
});

// Generate map placeholder
function generateMapPlaceholder(container, location) {
  if (!container) return;

  // Default location text
  location = location || 'Location';

  // Clear container
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }

  if (!container) return;

  container.innerHTML = '';

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  // Fill background
  const gradient = ctx.createLinearGradient(0, 0, 600, 300);
  gradient.addColorStop(0, '#e3f2fd');
  gradient.addColorStop(1, '#bbdefb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw roads
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;

  // Main road
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(600, 150);
  ctx.stroke();

  // Secondary road 1
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(200, 300);
  ctx.stroke();

  // Secondary road 2
  ctx.beginPath();
  ctx.moveTo(400, 0);
  ctx.lineTo(400, 300);
  ctx.stroke();

  // Road borders
  ctx.strokeStyle = '#90caf9';
  ctx.lineWidth = 1;

  // Main road borders
  ctx.beginPath();
  ctx.moveTo(0, 145);
  ctx.lineTo(600, 145);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 155);
  ctx.lineTo(600, 155);
  ctx.stroke();

  // Secondary road 1 borders
  ctx.beginPath();
  ctx.moveTo(195, 0);
  ctx.lineTo(195, 300);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(205, 0);
  ctx.lineTo(205, 300);
  ctx.stroke();

  // Secondary road 2 borders
  ctx.beginPath();
  ctx.moveTo(395, 0);
  ctx.lineTo(395, 300);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(405, 0);
  ctx.lineTo(405, 300);
  ctx.stroke();

  // Draw location marker
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.arc(300, 150, 15, 0, Math.PI * 2);
  ctx.fill();

  // Draw location marker border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 150, 15, 0, Math.PI * 2);
  ctx.stroke();

  // Add location text
  ctx.fillStyle = '#0d47a1';
  ctx.font = 'bold 20px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Event Location', 300, 180);
  ctx.font = '16px Poppins, sans-serif';
  ctx.fillText(location, 300, 210);

  // Add map title
  ctx.fillStyle = '#0d47a1';
  ctx.font = 'bold 24px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Map', 300, 20);

  // Convert canvas to data URL and create image
  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  img.alt = 'Map to ' + location;
  img.className = 'img-fluid rounded';

  // Append image to container
  container.appendChild(img);

  return img;
}

// Export functions
window.imageHelper = {
  createPlaceholderImage,
  optimizeImages,
  generateQRCodeWithFallback,
  generateMapPlaceholder
};
