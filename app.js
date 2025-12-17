// SmartCreative Studio - Interactive JavaScript

// State
let canvasElements = [];
let currentZoom = 100;
let selectedElement = null;
let undoStack = [];
let redoStack = [];
let currentStyle = 'clean';
let dashboardInterval = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeDashboard();
    initializeCanvasDragDrop();
    animateOnScroll();
});

// Initialize
function initializeApp() {
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.85)';
        }
    });
}

// Navigation Functions
function scrollToBuilder() {
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
    showToast('success', 'Studio Ready', 'Start creating your ad below');
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

function playDemo() {
    showToast('info', 'Demo Video', 'Would open demo video in production');
}

// Canvas Functions
function initializeCanvasDragDrop() {
    const canvas = document.getElementById('designCanvas');
    if (!canvas) return;

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        canvas.classList.add('drag-over');
    });

    canvas.addEventListener('dragleave', () => {
        canvas.classList.remove('drag-over');
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            handleImageDrop(e.dataTransfer.files[0]);
        }
    });

    // Click to deselect
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas || e.target.id === 'canvasPlaceholder') {
            deselectAll();
        }
    });
}

function handleImageDrop(file) {
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Invalid File', 'Please drop an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        addImageToCanvas(e.target.result);
        showToast('success', 'Image Added', 'Your product image is on the canvas');
    };
    reader.readAsDataURL(file);
}

function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageDrop(file);
    }
}

function addImageToCanvas(src) {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const img = document.createElement('div');
    img.className = 'canvas-element image-element';
    img.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        background-image: url(${src});
        background-size: cover;
        background-position: center;
        border-radius: 8px;
        cursor: move;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    makeElementDraggable(img);
    makeElementSelectable(img);
    canvas.appendChild(img);
    canvasElements.push(img);
}

function addTextToCanvas() {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const text = document.createElement('div');
    text.className = 'canvas-element text-element';
    text.contentEditable = true;
    text.textContent = 'Your Text Here';
    text.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: 700;
        color: white;
        cursor: move;
        padding: 8px 16px;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        outline: none;
    `;

    makeElementDraggable(text);
    makeElementSelectable(text);
    canvas.appendChild(text);
    canvasElements.push(text);
    showToast('info', 'Text Added', 'Click to edit, drag to move');
}

function addShapeToCanvas() {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const shape = document.createElement('div');
    shape.className = 'canvas-element shape-element';
    shape.style.cssText = `
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 60px;
        background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 30px;
        cursor: move;
        backdrop-filter: blur(10px);
    `;

    makeElementDraggable(shape);
    makeElementSelectable(shape);
    canvas.appendChild(shape);
    canvasElements.push(shape);
}

function addTescoLogo() {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const logo = document.createElement('div');
    logo.className = 'canvas-element tesco-logo-element';
    logo.innerHTML = 'TESCO';
    logo.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        padding: 6px 14px;
        background: #00539F;
        color: white;
        font-size: 14px;
        font-weight: 700;
        border-radius: 4px;
        cursor: move;
        letter-spacing: 1px;
    `;

    makeElementDraggable(logo);
    makeElementSelectable(logo);
    canvas.appendChild(logo);
    canvasElements.push(logo);
    showToast('success', 'Logo Added', 'Tesco logo placed on canvas');
}

function addClubcardBadge() {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const badge = document.createElement('div');
    badge.className = 'canvas-element clubcard-element';
    badge.innerHTML = 'Clubcard Price';
    badge.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        padding: 6px 12px;
        background: #7B2D8E;
        color: white;
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        cursor: move;
    `;

    makeElementDraggable(badge);
    makeElementSelectable(badge);
    canvas.appendChild(badge);
    canvasElements.push(badge);
    showToast('success', 'Badge Added', 'Clubcard price badge on canvas');
}

function addPriceTag() {
    hidePlaceholder();
    saveToUndoStack();

    const canvas = document.getElementById('designCanvas');
    const price = document.createElement('div');
    price.className = 'canvas-element price-element';
    price.innerHTML = '£2.50';
    price.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 10px 16px;
        background: #EE1C2E;
        color: white;
        font-size: 22px;
        font-weight: 800;
        border-radius: 6px;
        cursor: move;
    `;

    makeElementDraggable(price);
    makeElementSelectable(price);
    canvas.appendChild(price);
    canvasElements.push(price);
    showToast('success', 'Price Added', 'Price tag on canvas');
}

function makeElementDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        if (e.target.contentEditable === 'true' && document.activeElement === e.target) {
            return;
        }
        isDragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        element.style.zIndex = 100;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const canvas = document.getElementById('designCanvas');
        const canvasRect = canvas.getBoundingClientRect();

        let x = e.clientX - canvasRect.left - offsetX;
        let y = e.clientY - canvasRect.top - offsetY;

        // Bounds checking
        x = Math.max(0, Math.min(x, canvasRect.width - element.offsetWidth));
        y = Math.max(0, Math.min(y, canvasRect.height - element.offsetHeight));

        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.zIndex = '';
        }
    });
}

function makeElementSelectable(element) {
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        deselectAll();
        element.classList.add('selected');
        element.style.outline = '2px solid #3B82F6';
        element.style.outlineOffset = '2px';
        selectedElement = element;
    });
}

function deselectAll() {
    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.remove('selected');
        el.style.outline = 'none';
    });
    selectedElement = null;
}

function hidePlaceholder() {
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

function showPlaceholder() {
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'block';
    }
}

// Canvas Actions
function clearCanvas() {
    saveToUndoStack();
    const canvas = document.getElementById('designCanvas');
    document.querySelectorAll('.canvas-element').forEach(el => el.remove());
    canvasElements = [];
    showPlaceholder();
    showToast('info', 'Canvas Cleared', 'Starting fresh');
}

function changeCanvasSize(format) {
    const canvas = document.getElementById('designCanvas');
    const sizes = {
        'instagram': { w: 400, h: 400 },
        'facebook': { w: 400, h: 209 },
        'tesco-app': { w: 280, h: 500 },
        'instore': { w: 400, h: 225 }
    };

    const size = sizes[format];
    if (size) {
        canvas.style.width = size.w + 'px';
        canvas.style.height = size.h + 'px';
    }
    showToast('info', 'Format Changed', `Canvas set to ${format.replace('-', ' ')}`);
}

function zoomIn() {
    if (currentZoom < 150) {
        currentZoom += 10;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > 50) {
        currentZoom -= 10;
        applyZoom();
    }
}

function applyZoom() {
    const container = document.getElementById('canvasContainer');
    container.style.transform = `scale(${currentZoom / 100})`;
    document.getElementById('zoomLevel').textContent = currentZoom + '%';
}

function saveToUndoStack() {
    const canvas = document.getElementById('designCanvas');
    undoStack.push(canvas.innerHTML);
    if (undoStack.length > 20) undoStack.shift();
    redoStack = [];
}

function undo() {
    if (undoStack.length === 0) return;
    const canvas = document.getElementById('designCanvas');
    redoStack.push(canvas.innerHTML);
    canvas.innerHTML = undoStack.pop();
    reinitializeElements();
}

function redo() {
    if (redoStack.length === 0) return;
    const canvas = document.getElementById('designCanvas');
    undoStack.push(canvas.innerHTML);
    canvas.innerHTML = redoStack.pop();
    reinitializeElements();
}

function reinitializeElements() {
    canvasElements = [];
    document.querySelectorAll('.canvas-element').forEach(el => {
        makeElementDraggable(el);
        makeElementSelectable(el);
        canvasElements.push(el);
    });
}

// AI Generation
function generateWithAI() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    if (!prompt) {
        showToast('info', 'Describe Your Ad', 'Tell us what you want to create');
        return;
    }

    showLoading('Analyzing your description...');

    setTimeout(() => {
        updateLoadingText('Generating creative options...');
    }, 800);

    setTimeout(() => {
        updateLoadingText('Applying brand guidelines...');
    }, 1600);

    setTimeout(() => {
        hideLoading();
        generateCreative(prompt);
        showToast('success', 'Creative Ready', 'Your ad has been generated');
    }, 2500);
}

function generateCreative(prompt) {
    // Clear and generate based on prompt
    clearCanvas();
    hidePlaceholder();

    const canvas = document.getElementById('designCanvas');

    // Determine theme from prompt
    const isSummer = prompt.toLowerCase().includes('summer') || prompt.toLowerCase().includes('fresh');
    const hasClubcard = prompt.toLowerCase().includes('clubcard') || prompt.toLowerCase().includes('price');
    const isValue = prompt.toLowerCase().includes('value') || prompt.toLowerCase().includes('deal');

    // Set background based on theme
    if (isSummer) {
        canvas.style.background = 'linear-gradient(145deg, #2d5a3d 0%, #1a3626 100%)';
    } else if (isValue) {
        canvas.style.background = 'linear-gradient(145deg, #4a2c2c 0%, #2a1a1a 100%)';
    } else {
        canvas.style.background = 'linear-gradient(145deg, #2a3a5a 0%, #1a2540 100%)';
    }

    // Add headline
    const headline = document.createElement('div');
    headline.className = 'canvas-element text-element';
    headline.textContent = isSummer ? 'Fresh & Delicious' : (isValue ? 'Great Value' : 'Special Offer');
    headline.style.cssText = `
        position: absolute;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 28px;
        font-weight: 800;
        color: white;
        cursor: move;
        text-shadow: 0 2px 10px rgba(0,0,0,0.4);
    `;
    makeElementDraggable(headline);
    makeElementSelectable(headline);
    canvas.appendChild(headline);

    // Add subtext
    const subtext = document.createElement('div');
    subtext.className = 'canvas-element text-element';
    subtext.textContent = 'Available at Tesco';
    subtext.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        color: rgba(255,255,255,0.8);
        cursor: move;
    `;
    makeElementDraggable(subtext);
    makeElementSelectable(subtext);
    canvas.appendChild(subtext);

    // Add product placeholder
    const product = document.createElement('div');
    product.className = 'canvas-element shape-element';
    product.style.cssText = `
        position: absolute;
        top: 50%;
        right: 15%;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, ${isSummer ? '#7ab85a' : (isValue ? '#e85d5d' : '#5a7ab8')} 0%, ${isSummer ? '#4a7a3a' : (isValue ? '#a84040' : '#3a5a8a')} 80%);
        border-radius: 50%;
        cursor: move;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    `;
    makeElementDraggable(product);
    makeElementSelectable(product);
    canvas.appendChild(product);

    // Add Tesco logo
    addTescoLogo();

    // Add Clubcard if mentioned
    if (hasClubcard) {
        addClubcardBadge();
    }

    // Add price
    addPriceTag();

    canvasElements = Array.from(document.querySelectorAll('.canvas-element'));
}

function applySuggestion(type) {
    const prompts = {
        'summer': 'Fresh summer produce promotion with vibrant colors',
        'clubcard': 'Clubcard exclusive deal with savings badge',
        'fresh': 'Fresh and healthy groceries, clean design',
        'value': 'Great value pack deal with bold pricing'
    };
    document.getElementById('aiPrompt').value = prompts[type] || '';
    generateWithAI();
}

function applyStyle(style) {
    currentStyle = style;
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.style-btn').classList.add('active');

    const canvas = document.getElementById('designCanvas');
    const styles = {
        'clean': 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        'warm': 'linear-gradient(145deg, #3d2a1a 0%, #2a1a0a 100%)',
        'dark': 'linear-gradient(145deg, #1a1a2a 0%, #0a0a14 100%)',
        'playful': 'linear-gradient(145deg, #4a2a5a 0%, #2a1a3a 100%)'
    };
    canvas.style.background = styles[style] || styles['clean'];
    showToast('info', 'Style Applied', style.charAt(0).toUpperCase() + style.slice(1) + ' theme active');
}

// Quick Tools
function removeBackground() {
    showLoading('Removing background...');
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Background Removed', 'Clean product shot ready');
    }, 1500);
}

function autoEnhance() {
    showLoading('Enhancing image...');
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Auto-Enhanced', 'Colors and contrast optimized');
    }, 1200);
}

function generateVariants() {
    showLoading('Creating variants...');
    setTimeout(() => {
        hideLoading();
        showToast('success', '3 Variants Created', 'Check the variant panel');
    }, 2000);
}

// Export Functions
function exportAd() {
    showLoading('Preparing export...');
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Export Ready', '4 formats packaged for download');
    }, 1500);
}

function toggleFormat(btn) {
    btn.classList.toggle('active');
}

function downloadAll() {
    showLoading('Packaging files...');
    setTimeout(() => {
        updateLoadingText('Running compliance checks...');
    }, 600);
    setTimeout(() => {
        updateLoadingText('Optimizing for web...');
    }, 1200);
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Download Started', 'SmartCreative_Export.zip ready');

        // Simulate download
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'SmartCreative_Export.zip';
        showToast('info', 'Demo Mode', 'In production, this would download the actual files');
    }, 2000);
}

// Dashboard Functions
function initializeDashboard() {
    updateTimeValue();
    startMetricsUpdate();
}

function updateTimeValue() {
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour < 12) timeOfDay = 'Morning';
    else if (hour < 17) timeOfDay = 'Afternoon';
    else if (hour < 21) timeOfDay = 'Evening';
    else timeOfDay = 'Night';

    const timeEl = document.getElementById('timeValue');
    if (timeEl) timeEl.textContent = timeOfDay;
}

function startMetricsUpdate() {
    updateMetrics();
    dashboardInterval = setInterval(updateMetrics, 3000);
}

function updateMetrics() {
    // Impressions
    const impressionsEl = document.getElementById('impressionsValue');
    if (impressionsEl) {
        const current = parseInt(impressionsEl.textContent.replace(/,/g, ''));
        const newVal = current + Math.floor(Math.random() * 50) + 10;
        animateValue(impressionsEl, current, newVal, 800);
    }

    // Engagement
    const engagementEl = document.getElementById('engagementValue');
    if (engagementEl) {
        const newEng = (4.2 + Math.random() * 0.8).toFixed(1);
        engagementEl.textContent = newEng + '%';
    }

    // ROI
    const roiEl = document.getElementById('roiValue');
    if (roiEl) {
        const newRoi = Math.floor(280 + Math.random() * 60);
        roiEl.textContent = newRoi + '%';
    }

    // Rotations
    const rotationsEl = document.getElementById('rotationsValue');
    if (rotationsEl) {
        rotationsEl.textContent = Math.floor(35 + Math.random() * 15);
    }

    // Update weather randomly
    const weatherEl = document.getElementById('weatherValue');
    if (weatherEl) {
        const temps = ['Sunny, 22°C', 'Partly Cloudy, 19°C', 'Clear, 24°C'];
        weatherEl.textContent = temps[Math.floor(Math.random() * temps.length)];
    }

    // Update footfall
    const footfallEl = document.getElementById('footfallValue');
    if (footfallEl) {
        const levels = ['High', 'Medium', 'Very High'];
        footfallEl.textContent = levels[Math.floor(Math.random() * levels.length)];
    }

    // Update trending
    const trendEl = document.getElementById('trendValue');
    if (trendEl) {
        const trends = ['Berries +18%', 'Dairy +12%', 'Snacks +22%', 'Drinks +15%'];
        trendEl.textContent = trends[Math.floor(Math.random() * trends.length)];
    }
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + range * easeOutCubic(progress));
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Animation on Scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .layer-card, .metric-card, .about-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add CSS for visible state
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Toast Notifications
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '!'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Loading Overlay
function showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay && loadingText) {
        loadingText.textContent = text;
        overlay.classList.add('active');
    }
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Undo: Ctrl+Z
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    // Redo: Ctrl+Shift+Z
    if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
    }
    // Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && selectedElement.contentEditable !== 'true') {
            e.preventDefault();
            saveToUndoStack();
            selectedElement.remove();
            canvasElements = canvasElements.filter(el => el !== selectedElement);
            selectedElement = null;
            if (canvasElements.length === 0) showPlaceholder();
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboardInterval) clearInterval(dashboardInterval);
});
