# BlockTix - Modern Event Ticketing DApp Frontend

This is a completely redesigned frontend for your Event Ticketing DApp with improved UI/UX design.

## Features

- **Modern, Professional Design**: Clean aesthetics with a blue/green color scheme
- **Responsive Layout**: Works well on all devices from mobile to desktop
- **Improved User Experience**: Intuitive navigation and clear visual hierarchy
- **Enhanced Ticket Management**: Better visualization and interaction with tickets
- **Network Switching**: Seamless switching between Hardhat Local and Sepolia networks
- **Interactive Elements**: Micro-interactions and visual feedback for user actions

## File Structure

```
frontend/new-design/
├── css/
│   ├── styles.css        # Main stylesheet
│   └── tickets.css       # Ticket-specific styles
├── images/
│   ├── wave.svg          # Wave decoration for hero section
│   └── ...               # Other images (to be added)
├── js/
│   ├── app.js            # Main application JavaScript
│   └── tickets.js        # Ticket-specific JavaScript
├── index.html            # Homepage
├── my-tickets.html       # My Tickets page
└── README.md             # This file
```

## Pages

1. **Home Page (index.html)**
   - Hero section with call-to-action
   - Featured events section
   - How it works section
   - Benefits section

2. **My Tickets Page (my-tickets.html)**
   - Ticket listing with filtering options
   - Ticket cards with QR codes
   - Ticket details modal
   - Transfer functionality

## Setup Instructions

1. **Copy the files**: Copy the entire `new-design` folder to your project

2. **Update contract address**: In `js/app.js`, update the contract addresses for both networks:
   ```javascript
   sepolia: {
     // ...
     contractAddress: "YOUR_DEPLOYED_CONTRACT_ADDRESS"
   }
   ```

3. **Add images**: Add the following images to the `images` folder:
   - `event-1.jpg`, `event-2.jpg`, `event-3.jpg`: Featured event images
   - `hero-tickets.png`: Hero section image
   - `event-placeholder.jpg`: Placeholder for events without images
   - `qr-placeholder.png`: Placeholder for QR codes

4. **Test locally**: Open `index.html` in your browser to test the new design

## Integration with Smart Contract

The JavaScript files are already set up to interact with your EventTicketNFT smart contract. The main integration points are:

- **Wallet Connection**: Connects to MetaMask and handles account changes
- **Network Detection**: Detects and allows switching between networks
- **Ticket Loading**: Loads tickets owned by the connected wallet
- **Ticket Transfer**: Allows transferring tickets to other addresses

## Customization

You can easily customize the design by modifying the CSS files:

- **Color Scheme**: Edit the color variables in `css/styles.css`
- **Typography**: Change the font family or sizes in `css/styles.css`
- **Layout**: Adjust the grid and spacing in the HTML files

## Browser Compatibility

The design is compatible with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Mobile Responsiveness

The design is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile phones

## Additional Notes

- The marketplace functionality is prepared but not fully implemented
- The design includes placeholders for future features like event creation
- QR codes are generated client-side using the qrcode.js library

## Next Steps

1. Complete the marketplace implementation
2. Add event creation functionality
3. Implement ticket verification system
4. Add user profile and settings page
