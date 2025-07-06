# Image Guide for BlockTix Frontend

This guide explains how to work with images in the BlockTix frontend design.

## Image Structure

The frontend expects the following images in the `images` directory:

```
frontend/new-design/images/
├── event-1.jpg         # Featured event image (Summer Music Festival)
├── event-2.jpg         # Featured event image (Blockchain Conference)
├── event-3.jpg         # Featured event image (Championship Finals)
├── event-placeholder.jpg # Fallback for missing event images
├── hero-tickets.png    # Hero section image
├── qr-placeholder.png  # Placeholder for QR codes
└── wave.svg            # Wave decoration for hero section
```

## Image Specifications

### Event Images
- **Dimensions**: Ideally 800x450px (16:9 ratio)
- **Format**: JPG or WEBP
- **Purpose**: Used in event cards and ticket displays

### Hero Image
- **Dimensions**: Ideally 600x600px
- **Format**: PNG with transparency preferred
- **Purpose**: Main visual on the homepage

### QR Placeholder
- **Dimensions**: 128x128px
- **Format**: PNG
- **Purpose**: Placeholder until QR codes are generated

## Handling Image Variations

We've added several features to handle variations in your images:

1. **CSS Adjustments**: The `image-adjustments.css` file contains specific styles to handle different image sizes and formats.

2. **Error Handling**: The JavaScript includes error handling that will:
   - Replace missing images with placeholders
   - Create fallback icons when images fail to load
   - Ensure consistent layout regardless of image dimensions

3. **Responsive Design**: Images will adapt to different screen sizes automatically.

## Adding Your Own Images

When adding your own images:

1. **Maintain aspect ratios** where possible (especially for event images)
2. **Optimize file sizes** for web (compress images to reduce loading time)
3. **Use descriptive filenames** that match the expected naming convention

## Image Helper Functions

We've included several helper functions in `js/image-helper.js`:

- `createPlaceholderImage(container, type, size)`: Creates a placeholder with an icon
- `optimizeImages()`: Adds lazy loading to images not in the viewport
- `generateQRCodeWithFallback(container, data, options)`: Generates QR codes with fallback

## Troubleshooting Common Image Issues

### Images Not Displaying

If images aren't displaying:

1. **Check file paths**: Ensure images are in the correct directory
2. **Verify file names**: Names should match exactly what's referenced in the HTML
3. **Check file formats**: Make sure you're using supported formats (JPG, PNG, WEBP, SVG)

### Images Look Distorted

If images appear stretched or squished:

1. **Check aspect ratios**: Try to maintain the recommended aspect ratios
2. **Inspect CSS**: The `object-fit` property in CSS controls how images fill their containers

### Images Load Slowly

If images are slow to load:

1. **Optimize file sizes**: Use tools like [TinyPNG](https://tinypng.com/) to compress images
2. **Consider using WEBP**: This modern format offers better compression
3. **Reduce dimensions**: Very large images can be resized to improve loading times

## Best Practices

1. **Use consistent styling** for all images to maintain visual harmony
2. **Keep file sizes small** (under 200KB per image) for better performance
3. **Provide alt text** for all images for accessibility
4. **Test on multiple devices** to ensure responsive behavior works correctly

## Additional Resources

- [Unsplash](https://unsplash.com/) - Free high-quality images
- [TinyPNG](https://tinypng.com/) - Image compression tool
- [Canva](https://www.canva.com/) - Create custom graphics
- [Squoosh](https://squoosh.app/) - Advanced image optimization
