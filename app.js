// Main application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    console.log('GauntletAI Photoshop initialized');

    // Get DOM elements
    const fileMenuBtn = document.getElementById('fileMenuBtn');
    const fileMenu = document.getElementById('fileMenu');
    const editMenuBtn = document.getElementById('editMenuBtn');
    const editMenu = document.getElementById('editMenu');
    const imageMenuBtn = document.getElementById('imageMenuBtn');
    const imageMenu = document.getElementById('imageMenu');
    const openFileBtn = document.getElementById('openFileBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('mainCanvas');
    const canvasContainer = document.getElementById('canvasContainer');
    const ctx = canvas.getContext('2d');

    // Size adjustment dialog elements
    const adjustSizeBtn = document.getElementById('adjustSizeBtn');
    const sizeDialog = document.getElementById('sizeDialog');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const cancelSizeBtn = document.getElementById('cancelSizeBtn');
    const saveSizeBtn = document.getElementById('saveSizeBtn');

    // Store original image data for resizing
    let originalImage = null;

    // Toggle file menu
    fileMenuBtn.addEventListener('click', () => {
        fileMenu.classList.toggle('hidden');
        editMenu.classList.add('hidden'); // Close other menus
        imageMenu.classList.add('hidden');
    });

    // Toggle edit menu
    editMenuBtn.addEventListener('click', () => {
        editMenu.classList.toggle('hidden');
        fileMenu.classList.add('hidden'); // Close other menus
        imageMenu.classList.add('hidden');
    });

    // Toggle image menu
    imageMenuBtn.addEventListener('click', () => {
        imageMenu.classList.toggle('hidden');
        fileMenu.classList.add('hidden'); // Close other menus
        editMenu.classList.add('hidden');
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!fileMenuBtn.contains(e.target) && !fileMenu.contains(e.target) &&
            !editMenuBtn.contains(e.target) && !editMenu.contains(e.target) &&
            !imageMenuBtn.contains(e.target) && !imageMenu.contains(e.target)) {
            fileMenu.classList.add('hidden');
            editMenu.classList.add('hidden');
            imageMenu.classList.add('hidden');
        }
    });

    // Handle Open button click
    openFileBtn.addEventListener('click', () => {
        fileInput.click();
        fileMenu.classList.add('hidden');
    });

    // Handle Download as PNG button click
    downloadPngBtn.addEventListener('click', () => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'image.png';
        
        // Convert canvas to PNG data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Set the link's href to the data URL
        link.href = dataUrl;
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        
        // Close the menu
        fileMenu.classList.add('hidden');
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Store original image for resizing
                    originalImage = img;
                    
                    // Calculate dimensions to fit the image while maintaining aspect ratio
                    const maxWidth = window.innerWidth * 0.7; // 70% of window width
                    const maxHeight = window.innerHeight * 0.8; // 80% of window height
                    
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (maxWidth * height) / width;
                        width = maxWidth;
                    }
                    
                    if (height > maxHeight) {
                        width = (maxHeight * width) / height;
                        height = maxHeight;
                    }

                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Update container size
                    canvasContainer.style.width = `${width}px`;
                    canvasContainer.style.height = `${height}px`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Adjust Size button click
    adjustSizeBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Set current dimensions in inputs
        widthInput.value = canvas.width;
        heightInput.value = canvas.height;
        
        // Show dialog
        sizeDialog.classList.remove('hidden');
        imageMenu.classList.add('hidden');
    });

    // Handle width input change
    widthInput.addEventListener('input', () => {
        if (!originalImage) return;
        
        const newWidth = parseInt(widthInput.value);
        if (isNaN(newWidth)) return;
        
        // Calculate new height maintaining aspect ratio
        const newHeight = Math.round((newWidth * originalImage.height) / originalImage.width);
        heightInput.value = newHeight;
    });

    // Handle height input change
    heightInput.addEventListener('input', () => {
        if (!originalImage) return;
        
        const newHeight = parseInt(heightInput.value);
        if (isNaN(newHeight)) return;
        
        // Calculate new width maintaining aspect ratio
        const newWidth = Math.round((newHeight * originalImage.width) / originalImage.height);
        widthInput.value = newWidth;
    });

    // Handle Cancel button click
    cancelSizeBtn.addEventListener('click', () => {
        sizeDialog.classList.add('hidden');
    });

    // Handle Save button click
    saveSizeBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        
        if (isNaN(newWidth) || isNaN(newHeight)) return;
        
        // Update canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Redraw image with new dimensions
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
        
        // Update container size
        canvasContainer.style.width = `${newWidth}px`;
        canvasContainer.style.height = `${newHeight}px`;
        
        // Close dialog
        sizeDialog.classList.add('hidden');
    });
}); 