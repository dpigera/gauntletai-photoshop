// Main application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    console.log('GauntletAI Photoshop initialized');

    // Get DOM elements
    const fileMenuBtn = document.getElementById('fileMenuBtn');
    const fileMenu = document.getElementById('fileMenu');
    const openFileBtn = document.getElementById('openFileBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('mainCanvas');
    const canvasContainer = document.getElementById('canvasContainer');
    const ctx = canvas.getContext('2d');

    // Toggle file menu
    fileMenuBtn.addEventListener('click', () => {
        fileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!fileMenuBtn.contains(e.target) && !fileMenu.contains(e.target)) {
            fileMenu.classList.add('hidden');
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
}); 