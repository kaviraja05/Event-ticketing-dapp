// Event Image Generator
// This script generates colored placeholder images for events

document.addEventListener('DOMContentLoaded', function() {
  // Define colors for different event types
  const eventColors = {
    'concerts': ['#3498db', '#2980b9', '#1abc9c', '#16a085'],
    'conferences': ['#e74c3c', '#c0392b', '#d35400', '#e67e22'],
    'sports': ['#2ecc71', '#27ae60', '#f1c40f', '#f39c12']
  };

  // Get all event cards with placeholder images
  const eventCards = document.querySelectorAll('.event-card');
  
  eventCards.forEach(card => {
    const img = card.querySelector('img');
    
    // Only process placeholder images
    if (img && img.src.includes('event-placeholder.jpg')) {
      // Get the event category from the parent div
      const categoryDiv = card.closest('[data-category]');
      const category = categoryDiv ? categoryDiv.getAttribute('data-category') : 'concerts';
      
      // Get the event title
      const title = card.querySelector('.card-title').textContent;
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      // Choose a color based on category
      const colors = eventColors[category] || eventColors['concerts'];
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      
      // Fill background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some visual elements
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const size = Math.random() * 100 + 50;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text if needed
      const words = title.split(' ');
      let line = '';
      let lines = [];
      let y = canvas.height / 2 - 20;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > canvas.width - 40 && i > 0) {
          lines.push(line);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Draw each line
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, y + index * 30);
      });
      
      // Convert canvas to data URL and set as image source
      img.src = canvas.toDataURL('image/png');
    }
  });
});
