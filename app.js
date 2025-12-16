/* ================================
   RetailCanvas - JavaScript Application
   ================================ */

// Global State
const state = {
    selectedElement: null,
    zoom: 100,
    canvasSize: 'social',
    history: [],
    historyIndex: -1,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
};

// DOM Elements
const elements = {
    designCanvas: null,
    canvasContainer: null,
    zoomLevel: null,
    loadingOverlay: null,
    toastContainer: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeCanvas();
    initializeDragAndDrop();
    initializeToolbar();
    addEventListeners();
    console.log('RetailCanvas initialized successfully!');
});

function initializeElements() {
    elements.designCanvas = document.getElementById('designCanvas');
    elements.canvasContainer = document.getElementById('canvasContainer');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.loadingOverlay = document.getElementById('loadingOverlay');
    elements.toastContainer = document.getElementById('toastContainer');
}

// Canvas Initialization
function initializeCanvas() {
    const canvasElements = document.querySelectorAll('.canvas-element');
    canvasElements.forEach(element => {
        makeElementDraggable(element);
        element.addEventListener('click', (e) => selectElement(element, e));
    });

    // Save initial state
    saveState();
}

// Make elements draggable
function makeElementDraggable(element) {
    element.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;

        state.isDragging = true;
        state.selectedElement = element;

        const rect = element.getBoundingClientRect();
        const canvasRect = elements.designCanvas.getBoundingClientRect();

        state.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        element.classList.add('selected');

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
    });
}

function onDrag(e) {
    if (!state.isDragging || !state.selectedElement) return;

    const canvasRect = elements.designCanvas.getBoundingClientRect();
    const scale = state.zoom / 100;

    let x = (e.clientX - canvasRect.left) / scale - state.dragOffset.x;
    let y = (e.clientY - canvasRect.top) / scale - state.dragOffset.y;

    // Constrain to canvas bounds
    const elementRect = state.selectedElement.getBoundingClientRect();
    const elementWidth = elementRect.width / scale;
    const elementHeight = elementRect.height / scale;

    x = Math.max(0, Math.min(x, 400 - elementWidth));
    y = Math.max(0, Math.min(y, 400 - elementHeight));

    state.selectedElement.style.left = x + 'px';
    state.selectedElement.style.top = y + 'px';
    state.selectedElement.style.bottom = 'auto';
    state.selectedElement.style.right = 'auto';
}

function onDragEnd() {
    if (state.isDragging) {
        state.isDragging = false;
        saveState();
    }
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
}

function selectElement(element, e) {
    e.stopPropagation();

    // Deselect all elements
    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.remove('selected');
    });

    // Select clicked element
    element.classList.add('selected');
    state.selectedElement = element;
}

// Drag and Drop from sidebar
function initializeDragAndDrop() {
    const assetItems = document.querySelectorAll('.asset-item');

    assetItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('asset-type', item.dataset.asset);
        });
    });

    elements.designCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.designCanvas.style.outline = '2px dashed var(--tesco-blue)';
    });

    elements.designCanvas.addEventListener('dragleave', () => {
        elements.designCanvas.style.outline = 'none';
    });

    elements.designCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.designCanvas.style.outline = 'none';

        const assetType = e.dataTransfer.getData('asset-type');
        if (assetType) {
            addAssetToCanvas(assetType, e);
        }
    });
}

function addAssetToCanvas(assetType, e) {
    const canvasRect = elements.designCanvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - 50;
    const y = e.clientY - canvasRect.top - 20;

    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.style.position = 'absolute';
    element.style.left = x + 'px';
    element.style.top = y + 'px';

    switch (assetType) {
        case 'tesco-logo':
            element.innerHTML = `
                <div class="element-content">
                    <svg width="80" height="30" viewBox="0 0 80 30">
                        <rect width="80" height="30" rx="4" fill="#00539F"/>
                        <text x="40" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="700">TESCO</text>
                    </svg>
                </div>
            `;
            break;
        case 'clubcard':
            element.innerHTML = `
                <div class="element-content">
                    <div style="background: #6B2D7B; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        Clubcard Price
                    </div>
                </div>
            `;
            break;
        case 'available-tag':
            element.innerHTML = `
                <div class="element-content">
                    <div style="background: #00539F; color: white; padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                        Available at Tesco
                    </div>
                </div>
            `;
            break;
    }

    elements.designCanvas.appendChild(element);
    makeElementDraggable(element);
    element.addEventListener('click', (evt) => selectElement(element, evt));

    showToast('Asset added to canvas', 'success');
    saveState();
}

// Toolbar
function initializeToolbar() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Canvas Size
function changeCanvasSize(size) {
    state.canvasSize = size;
    const canvas = elements.designCanvas;

    const sizes = {
        'social': { width: 400, height: 400 },
        'banner': { width: 728, height: 90 },
        'story': { width: 270, height: 480 },
        'instore': { width: 640, height: 360 }
    };

    const { width, height } = sizes[size] || sizes.social;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    showToast(`Canvas resized to ${width}×${height}`, 'success');
}

// Zoom Controls
function zoomIn() {
    if (state.zoom < 200) {
        state.zoom += 10;
        updateZoom();
    }
}

function zoomOut() {
    if (state.zoom > 50) {
        state.zoom -= 10;
        updateZoom();
    }
}

function updateZoom() {
    elements.zoomLevel.textContent = state.zoom + '%';
    elements.canvasContainer.style.transform = `scale(${state.zoom / 100})`;
}

// Undo/Redo
function saveState() {
    const canvasHTML = elements.designCanvas.innerHTML;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(canvasHTML);
    state.historyIndex++;
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        elements.designCanvas.innerHTML = state.history[state.historyIndex];
        reinitializeElements();
        showToast('Undo successful', 'success');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        elements.designCanvas.innerHTML = state.history[state.historyIndex];
        reinitializeElements();
        showToast('Redo successful', 'success');
    }
}

function reinitializeElements() {
    const canvasElements = document.querySelectorAll('.canvas-element');
    canvasElements.forEach(element => {
        makeElementDraggable(element);
        element.addEventListener('click', (e) => selectElement(element, e));
    });
}

// AI Generation
async function generateWithAI() {
    const prompt = document.getElementById('aiPrompt').value;
    if (!prompt.trim()) {
        showToast('Please enter a description for your ad', 'warning');
        return;
    }

    showLoading(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Apply generated design
    applyGeneratedDesign(prompt);

    showLoading(false);
    showToast('AI design generated successfully!', 'success');
}

function applyGeneratedDesign(prompt) {
    const canvas = elements.designCanvas;
    const lowerPrompt = prompt.toLowerCase();

    // Determine theme based on prompt
    let bgGradient = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    let productColor = '#84cc16';

    if (lowerPrompt.includes('summer') || lowerPrompt.includes('fresh')) {
        bgGradient = 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)';
        productColor = '#f97316';
    } else if (lowerPrompt.includes('clubcard') || lowerPrompt.includes('deal')) {
        bgGradient = 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)';
        productColor = '#a855f7';
    } else if (lowerPrompt.includes('holiday') || lowerPrompt.includes('christmas')) {
        bgGradient = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
        productColor = '#dc2626';
    }

    canvas.style.background = bgGradient;

    // Update product placeholder
    const productElement = document.getElementById('productImage');
    if (productElement) {
        productElement.querySelector('.placeholder-product').style.background =
            `linear-gradient(135deg, ${productColor} 0%, ${adjustColor(productColor, -30)} 100%)`;
        productElement.querySelector('.placeholder-product').style.borderRadius = '50%';
        productElement.querySelector('.placeholder-product').style.border = 'none';
        productElement.querySelector('.placeholder-product').innerHTML = `
            <span style="font-size: 2rem;">🛒</span>
        `;
    }

    // Update headline
    const headlineElement = document.getElementById('headlineText');
    if (headlineElement) {
        const headlines = {
            'summer': 'Summer Sale!',
            'fresh': 'Fresh & Delicious',
            'clubcard': 'Clubcard Exclusive',
            'holiday': 'Holiday Special',
            'deal': 'Amazing Deals'
        };

        let headline = 'Shop Now & Save';
        for (const [key, value] of Object.entries(headlines)) {
            if (lowerPrompt.includes(key)) {
                headline = value;
                break;
            }
        }

        headlineElement.querySelector('h2').textContent = headline;
    }

    saveState();
}

function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Quick Suggestions
function applySuggestion(type) {
    const prompts = {
        'summer-sale': 'Create a vibrant summer sale ad with warm colors and refreshing products',
        'clubcard-deal': 'Design a Clubcard exclusive deal with purple accents and savings highlight',
        'fresh-produce': 'Create a fresh produce ad featuring organic vegetables and green tones',
        'holiday-special': 'Design a festive holiday special with red and gold Christmas theme'
    };

    document.getElementById('aiPrompt').value = prompts[type] || '';
    generateWithAI();
}

// Style Presets
function applyStyle(style) {
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.style-btn').classList.add('active');

    const canvas = elements.designCanvas;

    const styles = {
        'modern': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        'vibrant': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        'minimal': 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        'bold': 'linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)'
    };

    canvas.style.background = styles[style] || styles.modern;

    // Adjust text colors for bold theme
    const textElements = canvas.querySelectorAll('h2, .ad-headline');
    textElements.forEach(el => {
        el.style.color = style === 'bold' ? '#ffffff' : '#111827';
    });

    showToast(`${style.charAt(0).toUpperCase() + style.slice(1)} style applied`, 'success');
    saveState();
}

// Quick Actions
function removeBackground() {
    showLoading(true);

    setTimeout(() => {
        showLoading(false);
        showToast('Background removed! (Simulated)', 'success');
    }, 1500);
}

function autoEnhance() {
    showLoading(true);

    setTimeout(() => {
        const canvas = elements.designCanvas;
        canvas.style.filter = 'contrast(1.1) saturate(1.2)';

        setTimeout(() => {
            canvas.style.filter = 'none';
        }, 100);

        showLoading(false);
        showToast('Auto-enhance applied!', 'success');
    }, 1000);
}

// Export
function exportAd() {
    showLoading(true);

    setTimeout(() => {
        showLoading(false);
        showToast('Ad exported successfully! 4 sizes generated.', 'success');

        // Simulate download
        const link = document.createElement('a');
        link.download = 'retail-canvas-ad.png';
        link.href = '#';

        // Create download notification
        const downloadModal = document.createElement('div');
        downloadModal.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #1F2937; padding: 32px; border-radius: 16px; 
                        border: 1px solid rgba(255,255,255,0.1); z-index: 10000; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 16px;">✅</div>
                <h3 style="color: white; margin-bottom: 8px;">Export Complete!</h3>
                <p style="color: #9CA3AF; margin-bottom: 20px;">Your ad has been exported in 4 sizes:</p>
                <ul style="color: #D1D5DB; list-style: none; text-align: left; margin-bottom: 20px;">
                    <li>✓ Instagram (1080×1080)</li>
                    <li>✓ Facebook (1200×628)</li>
                    <li>✓ Tesco App (750×1334)</li>
                    <li>✓ In-Store (1920×1080)</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: linear-gradient(135deg, #EE1C2E 0%, #00539F 100%); 
                               color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                               cursor: pointer; font-weight: 600;">
                    Done
                </button>
            </div>
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(0,0,0,0.5); z-index: 9999;" 
                 onclick="this.parentElement.remove()"></div>
        `;
        document.body.appendChild(downloadModal);
    }, 2000);
}

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}</span>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function scrollToCanvas() {
    document.getElementById('canvas').scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
function addEventListeners() {
    // Click outside to deselect
    elements.designCanvas.addEventListener('click', (e) => {
        if (e.target === elements.designCanvas) {
            document.querySelectorAll('.canvas-element').forEach(el => {
                el.classList.remove('selected');
            });
            state.selectedElement = null;
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    exportAd();
                    break;
            }
        }

        // Delete selected element
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.selectedElement && !e.target.isContentEditable) {
                state.selectedElement.remove();
                state.selectedElement = null;
                saveState();
                showToast('Element deleted', 'success');
            }
        }
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Format options
    document.querySelectorAll('.format-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.format-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// Compliance checker animation
function updateComplianceStatus() {
    const checkItems = document.querySelectorAll('.check-item');
    checkItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100);
        }, index * 150);
    });
}

// Initialize compliance animation on scroll
const complianceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            updateComplianceStatus();
            complianceObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const complianceSection = document.getElementById('compliance');
    if (complianceSection) {
        complianceObserver.observe(complianceSection);
    }
});

// Smooth reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .case-card, .innovation-card, .tech-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        revealObserver.observe(el);
    });

    // Initialize dashboard simulation
    initializeDashboard();
});

// Dashboard Simulation
function initializeDashboard() {
    // Simulate live metric updates
    setInterval(updateMetrics, 3000);

    // Animate chart on scroll
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        const dashboardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateChart();
                    dashboardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        dashboardObserver.observe(dashboardSection);
    }
}

function updateMetrics() {
    const impressions = document.getElementById('impressionsValue');
    const engagement = document.getElementById('engagementValue');
    const roi = document.getElementById('roiValue');
    const rotations = document.getElementById('rotationsValue');

    if (impressions) {
        const currentVal = parseInt(impressions.textContent.replace(/,/g, ''));
        const newVal = currentVal + Math.floor(Math.random() * 50) + 10;
        impressions.textContent = newVal.toLocaleString();
    }

    if (engagement) {
        const currentVal = parseFloat(engagement.textContent);
        const newVal = (currentVal + (Math.random() * 0.1 - 0.05)).toFixed(1);
        engagement.textContent = newVal + '%';
    }

    if (rotations) {
        const currentVal = parseInt(rotations.textContent);
        if (Math.random() > 0.7) {
            rotations.textContent = currentVal + 1;
        }
    }
}

function animateChart() {
    const chartLines = document.querySelectorAll('.chart-line');
    chartLines.forEach((line, index) => {
        const length = line.getTotalLength ? line.getTotalLength() : 500;
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        line.style.animation = `drawLine 1.5s ease forwards ${index * 0.3}s`;
    });
}

// Add CSS for chart animation
const chartStyle = document.createElement('style');
chartStyle.textContent = `
    @keyframes drawLine {
        to { stroke-dashoffset: 0; }
    }
`;
document.head.appendChild(chartStyle);

// Navigation functions
function scrollToBuilder() {
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

// Generate AI Variants
function generateVariants() {
    showLoading(true);

    setTimeout(() => {
        showLoading(false);
        showToast('3 AI variants generated! (SD/SDXL)', 'success');
    }, 2000);
}

// Update canvas sizes for new formats
function changeCanvasSize(size) {
    state.canvasSize = size;
    const canvas = elements.designCanvas;

    const sizes = {
        'social': { width: 400, height: 400 },
        'facebook': { width: 450, height: 236 },
        'tesco-app': { width: 280, height: 500 },
        'instore': { width: 640, height: 360 },
        'banner': { width: 728, height: 90 }
    };

    const { width, height } = sizes[size] || sizes.social;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    showToast(`Canvas: ${size.replace('-', ' ').toUpperCase()}`, 'success');
}
