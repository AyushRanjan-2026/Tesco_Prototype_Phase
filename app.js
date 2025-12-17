// SmartCreative Studio - Application Logic

// ===== State =====
let isLoggedIn = false;
let currentUser = null;
let canvasElements = [];
let selectedElement = null;
let undoStack = [];
let redoStack = [];
let currentZoom = 100;
let currentStyle = 'gradient';
let dashboardUpdateInterval = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    initCanvas();
    initDashboard();
    initChart();
    setupKeyboardShortcuts();
});

// ===== Auth Functions =====
function checkLoginState() {
    const savedUser = localStorage.getItem('smartcreative_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateAuthUI();
    }
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function openSignupModal() {
    document.getElementById('signupModal').classList.add('active');
}

function closeModals() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('signupModal').classList.remove('active');
}

function switchToSignup() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('signupModal').classList.add('active');
}

function switchToLogin() {
    document.getElementById('signupModal').classList.remove('active');
    document.getElementById('loginModal').classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showLoading('Logging in...');

    // Simulate login delay
    setTimeout(() => {
        hideLoading();

        // Check if user exists in localStorage or accept any credentials for demo
        const users = JSON.parse(localStorage.getItem('smartcreative_users') || '[]');
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            loginUser(user);
        } else if (users.length === 0) {
            // Demo mode - accept any login
            loginUser({ name: email.split('@')[0], email: email });
        } else {
            showToast('error', 'Login Failed', 'Invalid email or password');
        }
    }, 800);
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    showLoading('Creating account...');

    setTimeout(() => {
        hideLoading();

        // Save user
        const users = JSON.parse(localStorage.getItem('smartcreative_users') || '[]');

        if (users.find(u => u.email === email)) {
            showToast('error', 'Email Exists', 'This email is already registered');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('smartcreative_users', JSON.stringify(users));

        loginUser(newUser);
        showToast('success', 'Welcome!', 'Your account has been created');
    }, 1000);
}

function loginUser(user) {
    currentUser = user;
    isLoggedIn = true;
    localStorage.setItem('smartcreative_user', JSON.stringify(user));
    closeModals();
    updateAuthUI();
    showToast('success', 'Welcome back!', `Logged in as ${user.name || user.email}`);
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('smartcreative_user');
    updateAuthUI();
    showToast('info', 'Logged out', 'See you next time!');
}

function updateAuthUI() {
    const headerActions = document.getElementById('headerActions');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (isLoggedIn) {
        headerActions.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.name || currentUser.email.split('@')[0];
    } else {
        headerActions.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function handleGetStarted() {
    if (isLoggedIn) {
        scrollToSection('builder');
    } else {
        openSignupModal();
    }
}

// ===== Navigation =====
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Canvas Functions =====
function initCanvas() {
    const canvas = document.getElementById('canvas');

    // Drag and drop
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        canvas.style.borderColor = 'var(--border-light)';
    });

    canvas.addEventListener('dragleave', () => {
        canvas.style.borderColor = '';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.style.borderColor = '';

        if (e.dataTransfer.files.length > 0) {
            handleFileUpload({ target: { files: e.dataTransfer.files } });
        }
    });

    // Click to deselect
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas || e.target.classList.contains('canvas-empty')) {
            deselectAll();
        }
    });
}

function hideCanvasEmpty() {
    const empty = document.getElementById('canvasEmpty');
    if (empty) empty.style.display = 'none';
}

function showCanvasEmpty() {
    const empty = document.getElementById('canvasEmpty');
    if (empty && canvasElements.length === 0) {
        empty.style.display = 'block';
    }
}

function setTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tool-btn').classList.add('active');
}

function triggerUpload() {
    document.getElementById('fileInput').click();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        showToast('error', 'Invalid File', 'Please upload an image');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        addImageElement(event.target.result);
        showToast('success', 'Image Added', 'Your image is on the canvas');
    };
    reader.readAsDataURL(file);
}

function addImageElement(src) {
    hideCanvasEmpty();
    saveToUndo();

    const canvas = document.getElementById('canvas');
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.style.cssText = `
        width: 100px;
        height: 100px;
        background-image: url(${src});
        background-size: cover;
        background-position: center;
        border-radius: 6px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    makeDraggable(el);
    makeSelectable(el);
    canvas.appendChild(el);
    canvasElements.push(el);
}

function addText() {
    hideCanvasEmpty();
    saveToUndo();

    const canvas = document.getElementById('canvas');
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.contentEditable = true;
    el.textContent = 'Your Text';
    el.style.cssText = `
        font-size: 22px;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 6px rgba(0,0,0,0.5);
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 12px;
        outline: none;
        min-width: 50px;
    `;

    makeDraggable(el);
    makeSelectable(el);
    canvas.appendChild(el);
    canvasElements.push(el);
    showToast('info', 'Text Added', 'Click to edit, drag to move');
}

function addShape() {
    hideCanvasEmpty();
    saveToUndo();

    const canvas = document.getElementById('canvas');
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.style.cssText = `
        width: 140px;
        height: 50px;
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 25px;
        top: 65%;
        left: 50%;
        transform: translateX(-50%);
        backdrop-filter: blur(8px);
    `;

    makeDraggable(el);
    makeSelectable(el);
    canvas.appendChild(el);
    canvasElements.push(el);
}

function addAsset(type) {
    hideCanvasEmpty();
    saveToUndo();

    const canvas = document.getElementById('canvas');
    const el = document.createElement('div');
    el.className = 'canvas-element';

    if (type === 'logo') {
        el.textContent = 'TESCO';
        el.style.cssText = `
            background: var(--tesco-blue);
            color: white;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            top: 15px;
            left: 15px;
        `;
        showToast('success', 'Logo Added', 'Tesco logo on canvas');
    } else if (type === 'clubcard') {
        el.textContent = 'Clubcard Price';
        el.style.cssText = `
            background: var(--clubcard);
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            bottom: 15px;
            left: 15px;
        `;
        showToast('success', 'Badge Added', 'Clubcard badge on canvas');
    } else if (type === 'price') {
        el.textContent = '£2.50';
        el.style.cssText = `
            background: var(--tesco-red);
            color: white;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 20px;
            font-weight: 800;
            bottom: 15px;
            right: 15px;
        `;
        showToast('success', 'Price Added', 'Price tag on canvas');
    }

    makeDraggable(el);
    makeSelectable(el);
    canvas.appendChild(el);
    canvasElements.push(el);
}

function makeDraggable(el) {
    let isDragging = false;
    let startX, startY;

    el.addEventListener('mousedown', (e) => {
        if (el.contentEditable === 'true' && document.activeElement === el) return;

        isDragging = true;
        const rect = el.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        el.style.zIndex = 50;
        el.style.transform = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();

        let x = e.clientX - canvasRect.left - startX;
        let y = e.clientY - canvasRect.top - startY;

        x = Math.max(0, Math.min(x, canvasRect.width - el.offsetWidth));
        y = Math.max(0, Math.min(y, canvasRect.height - el.offsetHeight));

        el.style.left = x + 'px';
        el.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            el.style.zIndex = '';
        }
    });
}

function makeSelectable(el) {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        deselectAll();
        el.classList.add('selected');
        selectedElement = el;
    });
}

function deselectAll() {
    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.remove('selected');
    });
    selectedElement = null;
}

function clearCanvas() {
    saveToUndo();
    document.querySelectorAll('.canvas-element').forEach(el => el.remove());
    canvasElements = [];
    showCanvasEmpty();
    showToast('info', 'Canvas Cleared', 'Starting fresh');
}

function saveToUndo() {
    const canvas = document.getElementById('canvas');
    undoStack.push(canvas.innerHTML);
    if (undoStack.length > 20) undoStack.shift();
    redoStack = [];
}

function undo() {
    if (undoStack.length === 0) return;
    const canvas = document.getElementById('canvas');
    redoStack.push(canvas.innerHTML);
    canvas.innerHTML = undoStack.pop();
    reinitElements();
    showToast('info', 'Undo', 'Action undone');
}

function redo() {
    if (redoStack.length === 0) return;
    const canvas = document.getElementById('canvas');
    undoStack.push(canvas.innerHTML);
    canvas.innerHTML = redoStack.pop();
    reinitElements();
    showToast('info', 'Redo', 'Action redone');
}

function reinitElements() {
    canvasElements = [];
    document.querySelectorAll('.canvas-element').forEach(el => {
        makeDraggable(el);
        makeSelectable(el);
        canvasElements.push(el);
    });
}

function changeFormat(format) {
    const canvas = document.getElementById('canvas');
    const sizes = {
        'square': { w: 360, h: 360 },
        'landscape': { w: 400, h: 209 },
        'portrait': { w: 280, h: 420 },
        'wide': { w: 420, h: 236 }
    };

    const size = sizes[format];
    if (size) {
        canvas.style.width = size.w + 'px';
        canvas.style.height = size.h + 'px';
    }
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
    const canvas = document.getElementById('canvas');
    canvas.style.transform = `scale(${currentZoom / 100})`;
    document.getElementById('zoomDisplay').textContent = currentZoom + '%';
}

// ===== AI & Generation =====
function generateAd() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    if (!prompt) {
        showToast('info', 'Describe Your Ad', 'Type what you want to create');
        return;
    }

    showLoading('Analyzing prompt...');

    setTimeout(() => {
        document.getElementById('loadingText').textContent = 'Generating layout...';
    }, 600);

    setTimeout(() => {
        document.getElementById('loadingText').textContent = 'Adding elements...';
    }, 1200);

    setTimeout(() => {
        hideLoading();
        createGeneratedAd(prompt);
        showToast('success', 'Ad Generated!', 'Your creative is ready');
    }, 1800);
}

function createGeneratedAd(prompt) {
    clearCanvas();
    hideCanvasEmpty();

    const canvas = document.getElementById('canvas');
    const promptLower = prompt.toLowerCase();

    // Set background based on prompt
    if (promptLower.includes('summer') || promptLower.includes('fresh')) {
        canvas.style.background = 'linear-gradient(145deg, #2d5a3d, #1a3626)';
    } else if (promptLower.includes('value') || promptLower.includes('deal')) {
        canvas.style.background = 'linear-gradient(145deg, #5a2d2d, #361a1a)';
    } else if (promptLower.includes('clubcard')) {
        canvas.style.background = 'linear-gradient(145deg, #4a2d5a, #2d1a36)';
    } else {
        canvas.style.background = 'linear-gradient(145deg, #2d3a5a, #1a2436)';
    }

    // Add headline
    const headline = document.createElement('div');
    headline.className = 'canvas-element';
    headline.textContent = promptLower.includes('summer') ? 'Fresh & Tasty' :
        promptLower.includes('value') ? 'Great Value' :
            promptLower.includes('clubcard') ? 'Clubcard Deal' : 'Special Offer';
    headline.style.cssText = `
        font-size: 26px;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
    `;
    makeDraggable(headline);
    makeSelectable(headline);
    canvas.appendChild(headline);
    canvasElements.push(headline);

    // Add subtext
    const subtext = document.createElement('div');
    subtext.className = 'canvas-element';
    subtext.textContent = 'Available now at Tesco';
    subtext.style.cssText = `
        font-size: 13px;
        color: rgba(255,255,255,0.8);
        top: 38%;
        left: 50%;
        transform: translateX(-50%);
    `;
    makeDraggable(subtext);
    makeSelectable(subtext);
    canvas.appendChild(subtext);
    canvasElements.push(subtext);

    // Add product circle
    const product = document.createElement('div');
    product.className = 'canvas-element';
    const color = promptLower.includes('summer') ? '#7ab85a' :
        promptLower.includes('value') ? '#e85d5d' : '#5a7ab8';
    product.style.cssText = `
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, ${color}, ${color.replace('#', '#4a')});
        border-radius: 50%;
        top: 45%;
        right: 15%;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    `;
    makeDraggable(product);
    makeSelectable(product);
    canvas.appendChild(product);
    canvasElements.push(product);

    // Add logo
    addAsset('logo');

    // Add price or clubcard based on prompt
    if (promptLower.includes('clubcard')) {
        addAsset('clubcard');
    }
    addAsset('price');
}

function applyTheme(theme) {
    document.getElementById('aiPrompt').value = {
        'summer': 'Summer fruit promotion, bright and fresh colors',
        'value': 'Great value pack deal, bold pricing',
        'fresh': 'Fresh groceries, healthy lifestyle theme',
        'clubcard': 'Clubcard exclusive savings, member prices'
    }[theme] || '';

    generateAd();
}

function setStyle(style) {
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.style-btn').classList.add('active');
    currentStyle = style;

    const canvas = document.getElementById('canvas');
    const styles = {
        'gradient': 'linear-gradient(145deg, #1e3a2f, #0f1f18)',
        'solid': '#1a3a28',
        'light': '#f5f5f5',
        'dark': '#111111'
    };
    canvas.style.background = styles[style];
}

// ===== Quick Actions =====
function removeBg() {
    showLoading('Removing background...');
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Background Removed', 'Image now has transparent background');
    }, 1200);
}

function enhance() {
    showLoading('Enhancing...');
    setTimeout(() => {
        hideLoading();
        showToast('success', 'Enhanced!', 'Colors and contrast improved');
    }, 1000);
}

// ===== Export =====
function exportAll() {
    if (!isLoggedIn) {
        showToast('info', 'Login Required', 'Please log in to export');
        openLoginModal();
        return;
    }

    showLoading('Preparing exports...');

    setTimeout(() => {
        document.getElementById('loadingText').textContent = 'Checking compliance...';
    }, 600);

    setTimeout(() => {
        document.getElementById('loadingText').textContent = 'Packaging files...';
    }, 1200);

    setTimeout(() => {
        hideLoading();
        showToast('success', 'Export Ready!', 'Check your downloads folder');
        // Simulate download
        downloadDemoFile();
    }, 1800);
}

function downloadPackage() {
    exportAll();
}

function downloadDemoFile() {
    // Create a simple text file as demo
    const content = `SmartCreative Studio Export
============================
Export Date: ${new Date().toLocaleString()}
User: ${currentUser?.name || 'Guest'}

Formats Included:
- Instagram (1080x1080)
- Facebook (1200x628)  
- Tesco App (750x1334)
- In-Store (1920x1080)

Note: This is a demo export. In production, 
this would be a ZIP file with all image formats.

Thank you for using SmartCreative Studio!
Built by Ayush Ranjan & Sachin Verma
Tesco InnovAItion Jam 2025`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SmartCreative_Export.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// ===== Dashboard =====
function initDashboard() {
    updateTriggers();
    startMetricsUpdate();
}

function updateTriggers() {
    const hour = new Date().getHours();
    let timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

    const timeEl = document.getElementById('triggerTime');
    if (timeEl) timeEl.textContent = timeOfDay;
}

function startMetricsUpdate() {
    updateMetrics();
    dashboardUpdateInterval = setInterval(updateMetrics, 3000);
}

function updateMetrics() {
    // Views
    const viewsEl = document.getElementById('metricViews');
    if (viewsEl) {
        const current = parseInt(viewsEl.textContent.replace(/,/g, '')) || 14892;
        const newVal = current + Math.floor(Math.random() * 40) + 5;
        animateNumber(viewsEl, current, newVal);
    }

    // Engagement
    const engEl = document.getElementById('metricEngagement');
    if (engEl) {
        engEl.textContent = (4.2 + Math.random() * 0.8).toFixed(1) + '%';
    }

    // ROI
    const roiEl = document.getElementById('metricROI');
    if (roiEl) {
        roiEl.textContent = Math.floor(280 + Math.random() * 60) + '%';
    }

    // Rotations
    const rotEl = document.getElementById('metricRotations');
    if (rotEl) {
        rotEl.textContent = Math.floor(35 + Math.random() * 12);
    }

    // Update triggers randomly
    const weatherEl = document.getElementById('triggerWeather');
    if (weatherEl) {
        const weathers = ['Sunny, 22°C', 'Cloudy, 18°C', 'Clear, 24°C'];
        weatherEl.textContent = weathers[Math.floor(Math.random() * weathers.length)];
    }

    const trafficEl = document.getElementById('triggerTraffic');
    if (trafficEl) {
        const levels = ['High', 'Medium', 'Very High'];
        trafficEl.textContent = levels[Math.floor(Math.random() * levels.length)];
    }

    const trendEl = document.getElementById('triggerTrend');
    if (trendEl) {
        const trends = ['Berries +18%', 'Dairy +12%', 'Snacks +22%'];
        trendEl.textContent = trends[Math.floor(Math.random() * trends.length)];
    }
}

function animateNumber(el, start, end) {
    const duration = 600;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + (end - start) * easeOut(progress));
        el.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== Chart =====
function initChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 180;

    drawChart(ctx, canvas.width, canvas.height);

    // Redraw periodically
    setInterval(() => {
        drawChart(ctx, canvas.width, canvas.height);
    }, 5000);
}

function drawChart(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = 20 + i * 35;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
    }

    // Generate random data
    const points = 8;
    const data1 = Array.from({ length: points }, () => 30 + Math.random() * 100);
    const data2 = Array.from({ length: points }, () => 50 + Math.random() * 80);
    const data3 = Array.from({ length: points }, () => 60 + Math.random() * 60);

    // Draw lines
    const drawLine = (data, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let i = 0; i < data.length; i++) {
            const x = 40 + (i * (width - 60) / (points - 1));
            const y = height - 30 - data[i];

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        for (let i = 0; i < data.length; i++) {
            const x = 40 + (i * (width - 60) / (points - 1));
            const y = height - 30 - data[i];
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    drawLine(data1, '#10b981');
    drawLine(data2, '#3b82f6');
    drawLine(data3, '#8b5cf6');

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Inter';
    const labels = ['9am', '11am', '1pm', '3pm', '5pm', '7pm', '9pm', 'Now'];
    for (let i = 0; i < labels.length; i++) {
        const x = 40 + (i * (width - 60) / (points - 1));
        ctx.fillText(labels[i], x - 10, height - 8);
    }
}

// ===== Utilities =====
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) {
        overlay.classList.add('active');
        if (loadingText) loadingText.textContent = text;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ===== Keyboard Shortcuts =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z = Undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Ctrl+Shift+Z = Redo
        if (e.ctrlKey && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            redo();
        }
        // Delete selected element
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
            if (selectedElement.contentEditable !== 'true' || document.activeElement !== selectedElement) {
                e.preventDefault();
                saveToUndo();
                selectedElement.remove();
                canvasElements = canvasElements.filter(el => el !== selectedElement);
                selectedElement = null;
                showCanvasEmpty();
            }
        }
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModals();
            deselectAll();
        }
    });
}

// ===== Cleanup =====
window.addEventListener('beforeunload', () => {
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
});
