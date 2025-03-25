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
    const filterMenuBtn = document.getElementById('filterMenuBtn');
    const filterMenu = document.getElementById('filterMenu');
    const openFileBtn = document.getElementById('openFileBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('mainCanvas');
    const canvasContainer = document.getElementById('canvasContainer');
    const ctx = canvas.getContext('2d');
    const marqueeToolBtn = document.getElementById('marqueeToolBtn');
    const textToolBtn = document.getElementById('textToolBtn');
    const colorPalette = document.getElementById('colorPalette');
    const selectedColorBox = document.getElementById('selectedColorBox');
    const selectedColorHex = document.getElementById('selectedColorHex');

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

    // Hue & Saturation dialog elements
    const adjustHueBtn = document.getElementById('adjustHueBtn');
    const hueDialog = document.getElementById('hueDialog');
    const hueSlider = document.getElementById('hueSlider');
    const saturationSlider = document.getElementById('saturationSlider');
    const hueValue = document.getElementById('hueValue');
    const saturationValue = document.getElementById('saturationValue');
    const cancelHueBtn = document.getElementById('cancelHueBtn');
    const saveHueBtn = document.getElementById('saveHueBtn');

    // Black and White button
    const blackAndWhiteBtn = document.getElementById('blackAndWhiteBtn');
    const sepiaBtn = document.getElementById('sepiaBtn');
    const blurBtn = document.getElementById('blurBtn');
    const blurDialog = document.getElementById('blurDialog');
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');
    const cancelBlurBtn = document.getElementById('cancelBlurBtn');
    const saveBlurBtn = document.getElementById('saveBlurBtn');

    // Store original image data for resizing
    let originalImage = null;

    // Store original canvas state for brightness/contrast and hue/saturation
    let originalCanvasState = null;

    // History management
    let history = [];
    let currentHistoryIndex = -1;
    const maxHistorySize = 20; // Maximum number of states to keep in history

    // Tool states
    let isMarqueeToolActive = false;
    let isTextToolActive = false;
    let isDrawingSelection = false;
    let selectionStartX = 0;
    let selectionStartY = 0;
    let selectionWidth = 0;
    let selectionHeight = 0;
    let selectedColor = '#000000'; // Initialize with black
    let textInput = null;

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

    // Function to apply hue and saturation
    function applyHueSaturation(hue, saturation) {
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

        // Convert hue to radians
        const hueRad = (hue * Math.PI) / 180;

        // Apply hue and saturation
        for (let i = 0; i < data.length; i += 4) {
            // Convert RGB to HSL
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // Apply hue adjustment
            h = (h + hueRad / (2 * Math.PI)) % 1;
            if (h < 0) h += 1;

            // Apply saturation adjustment
            s = Math.max(0, Math.min(1, s * (1 + saturation / 100)));

            // Convert back to RGB
            let r2, g2, b2;
            if (s === 0) {
                r2 = g2 = b2 = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;

                r2 = hue2rgb(p, q, h + 1/3);
                g2 = hue2rgb(p, q, h);
                b2 = hue2rgb(p, q, h - 1/3);
            }

            // Update RGB values
            data[i] = Math.round(r2 * 255);
            data[i + 1] = Math.round(g2 * 255);
            data[i + 2] = Math.round(b2 * 255);
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);
    }

    // Function to apply black and white filter
    function applyBlackAndWhite() {
        if (!originalImage) return;

        // Create a temporary canvas for the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Get the image data
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to black and white using luminance
        for (let i = 0; i < data.length; i += 4) {
            // Calculate luminance using standard coefficients
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Set all RGB values to the luminance value
            data[i] = luminance;     // Red
            data[i + 1] = luminance; // Green
            data[i + 2] = luminance; // Blue
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Save state to history
        saveToHistory();
        
        // Close the filter menu
        filterMenu.classList.add('hidden');
    }

    // Function to apply sepia filter
    function applySepia() {
        if (!originalImage) return;

        // Create a temporary canvas for the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // Get the image data
        const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply sepia effect
        for (let i = 0; i < data.length; i += 4) {
            // Get RGB values
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate sepia values
            const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);

            // Update RGB values with sepia effect
            data[i] = Math.min(255, sepiaR);     // Red
            data[i + 1] = Math.min(255, sepiaG); // Green
            data[i + 2] = Math.min(255, sepiaB); // Blue
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Save state to history
        saveToHistory();
        
        // Close the filter menu
        filterMenu.classList.add('hidden');
    }

    // Function to apply blur effect
    function applyBlur(radius) {
        if (!originalCanvasState) return;

        // Create a temporary canvas for the image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(originalCanvasState, 0, 0);

        // Apply blur using canvas filter
        tempCtx.filter = `blur(${radius}px)`;
        tempCtx.drawImage(originalCanvasState, 0, 0);

        // Draw the blurred image back to the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    // Function to draw selection rectangle
    function drawSelection() {
        // Clear previous selection
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw the original image
        if (originalImage) {
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        }

        // Draw selection rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Create dashed line effect
        ctx.strokeRect(selectionStartX, selectionStartY, selectionWidth, selectionHeight);
        ctx.setLineDash([]); // Reset line dash
    }

    // Function to handle color selection
    function handleColorSelection(e) {
        // Remove selected class from all color swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('border-4', 'border-blue-500', 'ring-4', 'ring-blue-500');
        });
        
        // Add selected class to clicked swatch
        e.target.classList.add('border-4', 'border-blue-500', 'ring-4', 'ring-blue-500');
        
        // Get the color from the background-color style
        const color = e.target.style.backgroundColor;
        
        // Update selected color
        selectedColor = color;
        
        // Update selected color box and hex code
        selectedColorBox.style.backgroundColor = color;
        selectedColorHex.textContent = rgbToHex(color);
        
        // Show an alert with the selected color
        alert(`Color selected: ${rgbToHex(color)}`);
    }

    // Function to convert RGB color to HEX
    function rgbToHex(rgb) {
        // Handle rgb(r, g, b) format
        if (rgb.startsWith('rgb')) {
            const matches = rgb.match(/\d+/g);
            if (matches && matches.length === 3) {
                const [r, g, b] = matches.map(Number);
                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
            }
        }
        // Handle hex format
        return rgb;
    }

    // Function to handle text tool selection
    function handleTextTool() {
        isTextToolActive = !isTextToolActive;
        textToolBtn.classList.toggle('border-blue-500', isTextToolActive);
        colorPalette.classList.toggle('hidden', !isTextToolActive);
        
        // Deactivate marquee tool if it's active
        if (isMarqueeToolActive) {
            isMarqueeToolActive = false;
            marqueeToolBtn.classList.remove('border-blue-500');
        }
    }

    // Function to handle canvas click for text input
    function handleCanvasClick(e) {
        if (!isTextToolActive) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create a temporary input element for text entry
        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.className = 'fixed border-none outline-none bg-transparent text-transparent';
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-9999px';
        tempInput.style.top = '-9999px';
        tempInput.style.zIndex = '-1';
        document.body.appendChild(tempInput);
        tempInput.focus();

        // Function to draw text on canvas
        function drawText(text) {
            if (!text.trim()) return;
            
            // Clear the canvas and redraw the original image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (originalImage) {
                ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            }
            
            // Draw the new text
            ctx.font = '20px Arial';
            ctx.fillStyle = selectedColor;
            ctx.fillText(text, x, y);
            
            // Save to history
            saveToHistory();
        }

        // Handle text input
        tempInput.addEventListener('input', () => {
            drawText(tempInput.value);
        });

        // Handle Enter key
        tempInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const finalText = tempInput.value;
                tempInput.remove();
                if (finalText.trim()) {
                    drawText(finalText);
                }
            }
        });

        // Handle blur (clicking outside)
        tempInput.addEventListener('blur', () => {
            const finalText = tempInput.value;
            tempInput.remove();
            if (finalText.trim()) {
                drawText(finalText);
            }
        });
    }

    // Function to handle marquee tool selection
    function handleMarqueeTool() {
        isMarqueeToolActive = !isMarqueeToolActive;
        marqueeToolBtn.classList.toggle('border-blue-500', isMarqueeToolActive);
        colorPalette.classList.toggle('hidden', !isMarqueeToolActive);
        
        // Deactivate text tool if it's active
        if (isTextToolActive) {
            isTextToolActive = false;
            textToolBtn.classList.remove('border-blue-500');
        }
        
        // Reset selection when deactivating tool
        if (!isMarqueeToolActive) {
            isDrawingSelection = false;
            selectionStartX = 0;
            selectionStartY = 0;
            selectionWidth = 0;
            selectionHeight = 0;
            drawSelection();
        }
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
        filterMenu.classList.add('hidden');
    });

    // Toggle filter menu
    filterMenuBtn.addEventListener('click', () => {
        filterMenu.classList.toggle('hidden');
        fileMenu.classList.add('hidden'); // Close other menus
        editMenu.classList.add('hidden');
        imageMenu.classList.add('hidden');
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!fileMenuBtn.contains(e.target) && !fileMenu.contains(e.target) &&
            !editMenuBtn.contains(e.target) && !editMenu.contains(e.target) &&
            !imageMenuBtn.contains(e.target) && !imageMenu.contains(e.target) &&
            !filterMenuBtn.contains(e.target) && !filterMenu.contains(e.target)) {
            fileMenu.classList.add('hidden');
            editMenu.classList.add('hidden');
            imageMenu.classList.add('hidden');
            filterMenu.classList.add('hidden');
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

    // Handle Adjust Hue & Saturation button click
    adjustHueBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Store current canvas state
        originalCanvasState = document.createElement('canvas');
        originalCanvasState.width = canvas.width;
        originalCanvasState.height = canvas.height;
        originalCanvasState.getContext('2d').drawImage(canvas, 0, 0);
        
        // Reset sliders
        hueSlider.value = 0;
        saturationSlider.value = 0;
        hueValue.textContent = '0°';
        saturationValue.textContent = '0%';
        
        // Show dialog
        hueDialog.classList.remove('hidden');
        imageMenu.classList.add('hidden');
    });

    // Handle hue slider change
    hueSlider.addEventListener('input', () => {
        const hue = parseInt(hueSlider.value);
        const saturation = parseInt(saturationSlider.value);
        hueValue.textContent = `${hue}°`;
        applyHueSaturation(hue, saturation);
    });

    // Handle saturation slider change
    saturationSlider.addEventListener('input', () => {
        const hue = parseInt(hueSlider.value);
        const saturation = parseInt(saturationSlider.value);
        saturationValue.textContent = `${saturation}%`;
        applyHueSaturation(hue, saturation);
    });

    // Handle Cancel button click for hue dialog
    cancelHueBtn.addEventListener('click', () => {
        if (originalCanvasState) {
            ctx.drawImage(originalCanvasState, 0, 0);
        }
        hueDialog.classList.add('hidden');
    });

    // Handle Save button click for hue dialog
    saveHueBtn.addEventListener('click', () => {
        // Save state to history
        saveToHistory();
        
        // Close dialog
        hueDialog.classList.add('hidden');
    });

    // Handle Black and White button click
    blackAndWhiteBtn.addEventListener('click', () => {
        if (!originalImage) return;
        applyBlackAndWhite();
    });

    // Handle Sepia button click
    sepiaBtn.addEventListener('click', () => {
        if (!originalImage) return;
        applySepia();
    });

    // Handle Blur button click
    blurBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Store current canvas state
        originalCanvasState = document.createElement('canvas');
        originalCanvasState.width = canvas.width;
        originalCanvasState.height = canvas.height;
        originalCanvasState.getContext('2d').drawImage(canvas, 0, 0);
        
        // Reset slider
        blurSlider.value = 0;
        blurValue.textContent = '0px';
        
        // Show dialog
        blurDialog.classList.remove('hidden');
        filterMenu.classList.add('hidden');
    });

    // Handle blur slider change
    blurSlider.addEventListener('input', () => {
        const radius = parseInt(blurSlider.value);
        blurValue.textContent = `${radius}px`;
        applyBlur(radius);
    });

    // Handle Cancel button click for blur dialog
    cancelBlurBtn.addEventListener('click', () => {
        if (originalCanvasState) {
            ctx.drawImage(originalCanvasState, 0, 0);
        }
        blurDialog.classList.add('hidden');
    });

    // Handle Save button click for blur dialog
    saveBlurBtn.addEventListener('click', () => {
        // Save state to history
        saveToHistory();
        
        // Close dialog
        blurDialog.classList.add('hidden');
    });

    // Add event listeners for color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', handleColorSelection);
    });

    // Add event listeners for tools
    textToolBtn.addEventListener('click', handleTextTool);
    marqueeToolBtn.addEventListener('click', handleMarqueeTool);
    canvas.addEventListener('click', handleCanvasClick);
}); 