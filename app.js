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
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
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

    // Brightness & Contrast dialog elements
    const adjustBrightnessBtn = document.getElementById('adjustBrightnessBtn');
    const brightnessDialog = document.getElementById('brightnessDialog');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const contrastSlider = document.getElementById('contrastSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const cancelBrightnessBtn = document.getElementById('cancelBrightnessBtn');
    const saveBrightnessBtn = document.getElementById('saveBrightnessBtn');

    // Store original image data for resizing
    let originalImage = null;

    // Store original canvas state for brightness/contrast
    let originalCanvasState = null;

    // History management
    let history = [];
    let currentHistoryIndex = -1;
    const maxHistorySize = 20; // Maximum number of states to keep in history

    // Function to save current state to history
    function saveToHistory() {
        // Remove any states after the current index
        if (currentHistoryIndex < history.length - 1) {
            history = history.slice(0, currentHistoryIndex + 1);
        }

        // Add current state to history
        const state = {
            imageData: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height
        };
        history.push(state);

        // Limit history size
        if (history.length > maxHistorySize) {
            history.shift();
        } else {
            currentHistoryIndex++;
        }

        // Update button states
        updateButtonStates();
    }

    // Function to update button states
    function updateButtonStates() {
        // Update undo button state
        const canUndo = history.length > 0 && currentHistoryIndex > 0;
        undoBtn.disabled = !canUndo;
        undoBtn.classList.toggle('opacity-50', !canUndo);
        undoBtn.classList.toggle('cursor-not-allowed', !canUndo);

        // Update redo button state
        const canRedo = currentHistoryIndex < history.length - 1;
        redoBtn.disabled = !canRedo;
        redoBtn.classList.toggle('opacity-50', !canRedo);
        redoBtn.classList.toggle('cursor-not-allowed', !canRedo);
    }

    // Function to restore state from history
    function restoreState(index) {
        if (index < 0 || index >= history.length) return;

        const state = history[index];
        const img = new Image();
        img.onload = () => {
            canvas.width = state.width;
            canvas.height = state.height;
            canvasContainer.style.width = `${state.width}px`;
            canvasContainer.style.height = `${state.height}px`;
            ctx.drawImage(img, 0, 0);
        };
        img.src = state.imageData;
    }

    // Function to apply brightness and contrast
    function applyBrightnessContrast(brightness, contrast) {
        if (!originalCanvasState) return;

        // Create a temporary canvas for the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(originalCanvasState, 0, 0);

        // Get the image data
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply brightness and contrast
        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] += brightness;     // Red
            data[i + 1] += brightness; // Green
            data[i + 2] += brightness; // Blue

            // Apply contrast
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            data[i] = factor * (data[i] - 128) + 128;     // Red
            data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
            data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue

            // Clamp values to valid range
            data[i] = Math.min(255, Math.max(0, data[i]));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);
    }

    // Initialize button states
    updateButtonStates();

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

    // Handle Undo button click
    undoBtn.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            currentHistoryIndex--;
            restoreState(currentHistoryIndex);
            updateButtonStates();
        }
        editMenu.classList.add('hidden');
    });

    // Handle Redo button click
    redoBtn.addEventListener('click', () => {
        if (currentHistoryIndex < history.length - 1) {
            currentHistoryIndex++;
            restoreState(currentHistoryIndex);
            updateButtonStates();
        }
        editMenu.classList.add('hidden');
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

                    // Save initial state to history
                    saveToHistory();
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
        
        // Save state to history
        saveToHistory();
        
        // Close dialog
        sizeDialog.classList.add('hidden');
    });

    // Handle Adjust Brightness & Contrast button click
    adjustBrightnessBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Store current canvas state
        originalCanvasState = document.createElement('canvas');
        originalCanvasState.width = canvas.width;
        originalCanvasState.height = canvas.height;
        originalCanvasState.getContext('2d').drawImage(canvas, 0, 0);
        
        // Reset sliders
        brightnessSlider.value = 0;
        contrastSlider.value = 0;
        brightnessValue.textContent = '0%';
        contrastValue.textContent = '0%';
        
        // Show dialog
        brightnessDialog.classList.remove('hidden');
        imageMenu.classList.add('hidden');
    });

    // Handle brightness slider change
    brightnessSlider.addEventListener('input', () => {
        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);
        brightnessValue.textContent = `${brightness}%`;
        applyBrightnessContrast(brightness, contrast);
    });

    // Handle contrast slider change
    contrastSlider.addEventListener('input', () => {
        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);
        contrastValue.textContent = `${contrast}%`;
        applyBrightnessContrast(brightness, contrast);
    });

    // Handle Cancel button click for brightness dialog
    cancelBrightnessBtn.addEventListener('click', () => {
        if (originalCanvasState) {
            ctx.drawImage(originalCanvasState, 0, 0);
        }
        brightnessDialog.classList.add('hidden');
    });

    // Handle Save button click for brightness dialog
    saveBrightnessBtn.addEventListener('click', () => {
        // Save state to history
        saveToHistory();
        
        // Close dialog
        brightnessDialog.classList.add('hidden');
    });
}); 