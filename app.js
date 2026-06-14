// -------------------------------------------------------------
// Initialization & Global State
// -------------------------------------------------------------
const tabHistory = ['overview'];

function createIconsSafe() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide icons library not loaded.');
    }
}

function safeGetLocalStorage(key, defaultValue) {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch (e) {
        console.warn('localStorage access denied:', e);
        return defaultValue;
    }
}

function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn('localStorage access denied:', e);
    }
}

function initializeApp() {
    // Initialize Lucide Icons safely
    createIconsSafe();
    
    // Initialize Theme
    initTheme();
    
    // Initialize Navigation & Tabs
    initNavigation();
    
    // Initialize Journey Flowchart
    initJourneyFlowchart();
    
    // Initialize Contact Forms
    initContactForms();
    
    // Initialize Extra Interactions (Search, Notifications, Back History, etc.)
    initExtraInteractions();
}



// -------------------------------------------------------------
// Theme Management (Light / Dark Mode)
// -------------------------------------------------------------
function initTheme() {
    const lightBtns = document.querySelectorAll('#light-theme-btn, #light-theme-btn-mobile');
    const darkBtns = document.querySelectorAll('#dark-theme-btn, #dark-theme-btn-mobile');
    const body = document.body;

    const setTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            lightBtns.forEach(btn => btn.classList.remove('active'));
            darkBtns.forEach(btn => btn.classList.add('active'));
            safeSetLocalStorage('portfolio-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            darkBtns.forEach(btn => btn.classList.remove('active'));
            lightBtns.forEach(btn => btn.classList.add('active'));
            safeSetLocalStorage('portfolio-theme', 'light');
        }
        setTimeout(drawJourneyLines, 100);
    };

    // Check cached preference, default to light
    const cachedTheme = safeGetLocalStorage('portfolio-theme', 'light');
    setTheme(cachedTheme);

    // Light theme button click handler
    lightBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!body.classList.contains('light-mode')) {
                setTheme('light');
            }
        });
    });

    // Dark theme button click handler
    darkBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!body.classList.contains('dark-mode')) {
                setTheme('dark');
            }
        });
    });
}

// -------------------------------------------------------------
// Navigation & Tab Switching
// -------------------------------------------------------------
function initNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn, .sidebar-nav button');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Wire up custom page content tab triggers (CTAs, See More links)
    const customSwitchers = document.querySelectorAll('[data-tab]:not(.tab-btn):not(.sidebar-nav button)');
    customSwitchers.forEach(el => {
        el.addEventListener('click', (e) => {
            if (el.tagName === 'A' || el.getAttribute('href') === '#') {
                e.preventDefault();
            }
            const targetTab = el.getAttribute('data-tab');
            const scrollTarget = el.getAttribute('data-scroll');
            
            switchTab(targetTab);
            
            if (scrollTarget) {
                setTimeout(() => {
                    const scrollEl = document.getElementById(scrollTarget);
                    if (scrollEl) {
                        scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        });
    });
}

function switchTab(tabId, shouldPushHistory = true) {
    // 1. Manage navigation history stack
    if (shouldPushHistory) {
        if (tabHistory.length === 0 || tabHistory[tabHistory.length - 1] !== tabId) {
            tabHistory.push(tabId);
        }
    }
    
    // Update back button visual state
    updateBackButtonState();

    // 2. Deactivate all contents and active states
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    const allButtons = document.querySelectorAll('.tab-btn, .sidebar-nav button');
    allButtons.forEach(button => {
        button.classList.remove('active');
    });

    // 3. Activate target content
    const activeContent = document.getElementById(`${tabId}-section`);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // 4. Highlight corresponding buttons in both header and sidebar
    const matchedButtons = document.querySelectorAll(`[data-tab="${tabId}"]`);
    matchedButtons.forEach(btn => {
        btn.classList.add('active');
    });

    // 5. Custom action: Redraw flowlines if shifting to About Me tab
    if (tabId === 'about') {
        setTimeout(drawJourneyLines, 300);
    }
}

function updateBackButtonState() {
    const backBtn = document.querySelector('.sidebar-back-btn');
    if (backBtn) {
        if (tabHistory.length > 1) {
            backBtn.classList.add('visible');
            backBtn.style.opacity = '1';
            backBtn.style.pointerEvents = 'auto';
            backBtn.style.cursor = 'pointer';
        } else {
            backBtn.classList.remove('visible');
            backBtn.style.opacity = '0.3';
            backBtn.style.pointerEvents = 'none';
            backBtn.style.cursor = 'default';
        }
    }
}

// -------------------------------------------------------------
// Interactive Journey Flowchart System
// -------------------------------------------------------------
const MILESTONE_DETAILS = {
    "1": {
        tag: "Schooling",
        title: "Secondary School Certificate (SSC)",
        time: "Graduated: 2018 // Shamsul Haque Khan School & College",
        desc: "Graduated Secondary School Certificate curriculum with science concentration and perfect GPA scores.",
        highlights: [
            "GPA: 5.00 / 5.00",
            "Solid foundations in Mathematics, Science, and basic computing"
        ]
    },
    "2": {
        tag: "College",
        title: "Higher Secondary School Certificate (HSC)",
        time: "Graduated: 2020 // Notre Dame College",
        desc: "Finished College in Dhaka, Bangladesh, with a science focus, active math interest, and software foundations.",
        highlights: [
            "GPA: 5.00 / 5.00",
            "Developed mathematical modeling and basic programming foundations"
        ]
    },
    "3": {
        tag: "University",
        title: "B.Sc. Engineering (ETE)",
        time: "2022 - Present // University of Frontier Technology",
        desc: "Pursuing undergraduate degree in Educational Technology & Engineering in Gazipur, Bangladesh. Learning algorithms, database design, software QA, and parallel architectures.",
        highlights: [
            "CGPA: 3.67 / 4.00",
            "Deep focus on Flutter UI integration, CUDA computing, and Federated Learning"
        ]
    },
    "4": {
        tag: "Deployment",
        title: "Learnify LMS Platform",
        time: "Flutter & Firebase Mobile Application",
        desc: "Built a full-featured Learning Management System featuring Admin and Student panels with course enrollments.",
        highlights: [
            "Built registration and learning material distribution flows",
            "Structured Firebase Authentication and Firestore relational schemas",
            "Designed real-time alerts using Firebase Cloud Messaging (FCM)"
        ]
    },
    "5": {
        tag: "Deployment",
        title: "eSaudagar Platform",
        time: "Flutter & Firebase E-Commerce Application",
        desc: "Designed and implemented a responsive cross-platform e-commerce app featuring standard shopping workflows.",
        highlights: [
            "Created secure client auth, cart caching, and order tracking models",
            "Optimized request processing and structured data layouts"
        ]
    }
};

// Connections tree map: nodeSource -> array of nodeTargets
const JOURNEY_CONNECTIONS = [
    { from: "node-1", to: "node-3" },
    { from: "node-2", to: "node-3" },
    { from: "node-3", to: "node-4" },
    { from: "node-3", to: "node-5" }
];

function initJourneyFlowchart() {
    const nodes = document.querySelectorAll('.journey-node');
    
    // Add Click listeners to nodes
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const milestoneId = node.getAttribute('data-milestone');
            activateMilestone(milestoneId);
        });
    });

    // Draw initial lines
    setTimeout(drawJourneyLines, 500);

    // Redraw on window resize
    window.addEventListener('resize', () => {
        drawJourneyLines();
    });
}

function activateMilestone(id) {
    // 1. Toggle Active Classes
    document.querySelectorAll('.journey-node').forEach(node => {
        node.classList.remove('active');
    });
    
    const targetNode = document.getElementById(`node-${id}`);
    if (targetNode) {
        targetNode.classList.add('active');
    }

    // 2. Fetch and Populate Data
    const data = MILESTONE_DETAILS[id];
    if (data) {
        document.getElementById('detail-tag').textContent = data.tag;
        document.getElementById('detail-title').textContent = data.title;
        document.getElementById('detail-time').textContent = data.time;
        document.getElementById('detail-description').textContent = data.desc;
        
        const bulletContainer = document.getElementById('detail-bulletpoints');
        bulletContainer.innerHTML = '';
        data.highlights.forEach(highlight => {
            const li = document.createElement('li');
            li.textContent = highlight;
            bulletContainer.appendChild(li);
        });
    }

    // 3. Highlight corresponding connection lines in SVG
    highlightLinesForNode(`node-${id}`);
}

function drawJourneyLines() {
    const svg = document.getElementById('journey-lines-svg');
    if (!svg) return;
    
    // Clear old lines
    svg.innerHTML = '';

    // If mobile view, layout stacks vertically, do not render horizontal flowlines
    if (window.innerWidth <= 768) {
        return;
    }

    const svgRect = svg.getBoundingClientRect();
    
    JOURNEY_CONNECTIONS.forEach(conn => {
        const fromNode = document.getElementById(conn.from);
        const toNode = document.getElementById(conn.to);
        
        if (fromNode && toNode) {
            const fromRect = fromNode.getBoundingClientRect();
            const toRect = toNode.getBoundingClientRect();
            
            // Calculate start and end coordinates relative to SVG
            const startX = fromRect.right - svgRect.left;
            const startY = fromRect.top + (fromRect.height / 2) - svgRect.top;
            
            const endX = toRect.left - svgRect.left;
            const endY = toRect.top + (toRect.height / 2) - svgRect.top;
            
            // Draw smooth bezier path
            const cp1X = startX + (endX - startX) * 0.4;
            const cp1Y = startY;
            const cp2X = startX + (endX - startX) * 0.6;
            const cp2Y = endY;
            
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`);
            path.setAttribute("class", "journey-line-path");
            path.setAttribute("id", `line-${conn.from}-to-${conn.to}`);
            
            // Core styles
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "var(--border-color)");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-dasharray", "4,4");
            
            svg.appendChild(path);
        }
    });

    // Re-highlight line based on currently active node
    const activeNode = document.querySelector('.journey-node.active');
    if (activeNode) {
        highlightLinesForNode(activeNode.id);
    }
}

function highlightLinesForNode(nodeId) {
    // Reset all lines to default styling
    document.querySelectorAll('.journey-line-path').forEach(path => {
        path.setAttribute("stroke", "var(--border-color)");
        path.setAttribute("stroke-width", "2");
        path.removeAttribute("style");
    });

    // Find paths connected to this node and highlight them
    JOURNEY_CONNECTIONS.forEach(conn => {
        if (conn.from === nodeId || conn.to === nodeId) {
            const path = document.getElementById(`line-${conn.from}-to-${conn.to}`);
            if (path) {
                // Determine highlight color based on active theme
                const highlightColor = document.body.classList.contains('dark-mode') ? '#ff5b4f' : '#ff5b4f'; 
                path.setAttribute("stroke", highlightColor);
                path.setAttribute("stroke-width", "3");
                path.style.strokeDasharray = "none";
                path.style.filter = "drop-shadow(0 0 4px rgba(255, 91, 79, 0.4))";
            }
        }
    });
}

// -------------------------------------------------------------
// Contact Form Submission (Support System Simulation)
// -------------------------------------------------------------
function initContactForms() {
    // 1. Dashboard Mini-Ticket Form
    const ticketForm = document.getElementById('contact-ticket-form');
    const ticketSuccess = document.getElementById('ticket-success');
    const resetTicketBtn = document.getElementById('reset-ticket-btn');
    
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('ticket-submit-btn');
            
            // Set loading state on button
            setButtonLoading(submitBtn, true);
            
            // Simulate API transmission latency
            setTimeout(() => {
                setButtonLoading(submitBtn, false);
                // Generate ticket ID
                const randomId = Math.floor(1000 + Math.random() * 9000);
                document.getElementById('ticket-id-display').textContent = `#TCK-${randomId}`;
                
                // Show Success Area
                ticketForm.style.display = 'none';
                ticketSuccess.style.display = 'flex';
            }, 1200);
        });
    }

    if (resetTicketBtn) {
        resetTicketBtn.addEventListener('click', () => {
            ticketForm.reset();
            ticketSuccess.style.display = 'none';
            ticketForm.style.display = 'flex';
        });
    }

    // 2. Main Contact Form (Sub-Section)
    const mainForm = document.getElementById('main-contact-form');
    const mainFormSuccess = document.getElementById('main-form-success');
    
    if (mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = mainForm.querySelector('button[type="submit"]');
            
            setButtonLoading(submitBtn, true);
            
            setTimeout(() => {
                setButtonLoading(submitBtn, false);
                mainForm.style.display = 'none';
                mainFormSuccess.style.display = 'flex';
            }, 1500);
        });
    }
}

function setButtonLoading(btn, isLoading) {
    const textNode = btn.querySelector('span');
    const iconNode = btn.querySelector('i');
    
    if (isLoading) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        if (textNode) textNode.textContent = 'Sending Message...';
        if (iconNode) {
            btn.style.cursor = 'wait';
            iconNode.style.animation = 'spin 1s linear infinite';
            iconNode.setAttribute('data-lucide', 'loader-2');
            createIconsSafe();
        }
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        if (textNode) textNode.textContent = btn.id === 'ticket-submit-btn' ? 'Submit Ticket' : 'Send Message';
        if (iconNode) {
            iconNode.style.animation = 'none';
            iconNode.setAttribute('data-lucide', 'send');
            createIconsSafe();
        }
    }
}

// Loader spin helper rule added dynamically if needed
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes highlightFlash {
    0% { background-color: rgba(255, 91, 79, 0.4); border-color: #ff5b4f; box-shadow: 0 0 16px rgba(255, 91, 79, 0.6); }
    50% { background-color: rgba(255, 91, 79, 0.1); }
    100% { background-color: transparent; }
}
.search-highlight-flash {
    animation: highlightFlash 2s ease-out;
}
`;
document.head.appendChild(style);

// -------------------------------------------------------------
// Extra Interactions (Back History, Brand, Search, Notifications)
// -------------------------------------------------------------
const searchIndex = [
    // Tabs
    { title: "Overview Dashboard", type: "tab", id: "overview", description: "Main overview with intro and flowchart" },
    { title: "Career & Education Journey", type: "tab", id: "journey", description: "Detailed timeline of education and accomplishments" },
    { title: "Technical Skills Matrix", type: "tab", id: "skills", description: "Expertise in Flutter, CUDA, ML and backend" },
    { title: "Projects Showcase", type: "tab", id: "projects", description: "Browse Learnify LMS, eSaudagar and CUDA FL Node" },
    { title: "Contact Info & Inquiry", type: "tab", id: "contact", description: "Get in touch, phone number, email and support ticket" },
    
    // Milestones
    { title: "Secondary School Certificate (SSC)", type: "milestone", id: "1", tab: "overview", description: "Completed 2018 at Shamsul Haque Khan School" },
    { title: "Higher Secondary Certificate (HSC)", type: "milestone", id: "2", tab: "overview", description: "Notre Dame College, Dhaka. Graduated 2020" },
    { title: "B.Sc. Engg (ETE) Degree", type: "milestone", id: "3", tab: "overview", description: "Undergraduate study at University of Frontier Technology" },
    { title: "Learnify LMS Project Milestone", type: "milestone", id: "4", tab: "overview", description: "Flutter LMS node on dashboard" },
    { title: "eSaudagar E-Commerce Milestone", type: "milestone", id: "5", tab: "overview", description: "Flutter e-commerce node on dashboard" },
    
    // Skills
    { title: "Flutter & Dart Development", type: "skill", id: "skills-section", tab: "skills", description: "Expert cross-platform app development" },
    { title: "CUDA Parallel Computing", type: "skill", id: "skills-section", tab: "skills", description: "GPU-accelerated programming in C/C++" },
    { title: "Federated Learning systems", type: "skill", id: "skills-section", tab: "skills", description: "Privacy-preserving distributed ML pipelines" },
    { title: "Firebase Integration & FCM", type: "skill", id: "skills-section", tab: "skills", description: "Cloud Firestore, Cloud Messaging, Auth" },
    { title: "FastAPI / Python Web", type: "skill", id: "skills-section", tab: "skills", description: "Lightweight API deployments" },
    
    // Projects
    { title: "Learnify Learning Management System", type: "project", id: "projects-container", tab: "about", description: "Flutter learning management system with student and admin dashboards" },
    { title: "eSaudagar E-Commerce Platform", type: "project", id: "projects-container", tab: "about", description: "Flutter e-commerce application featuring shopping cart and order placement" },
    { title: "AI Object Detection App", type: "project", id: "projects-container", tab: "about", description: "Flutter app with real-time computer vision object detection on device" },
    { title: "Video Conference Application", type: "project", id: "projects-container", tab: "about", description: "Flutter real-time collaborative video meeting application" }
];

function getSearchIcon(type) {
    switch(type) {
        case 'tab': return 'layout-grid';
        case 'milestone': return 'git-commit';
        case 'skill': return 'cpu';
        case 'project': return 'folder-git-2';
        default: return 'search';
    }
}

function flashElement(el) {
    el.classList.add('search-highlight-flash');
    setTimeout(() => {
        el.classList.remove('search-highlight-flash');
    }, 2000);
}

function initExtraInteractions() {
    // 1. Back Button
    const backBtn = document.querySelector('.sidebar-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (tabHistory.length > 1) {
                tabHistory.pop(); // Remove the current tab
                const prevTab = tabHistory[tabHistory.length - 1];
                switchTab(prevTab, false);
            }
        });
        updateBackButtonState();
    }
    
    // 2. Brand Clickable
    const brand = document.querySelector('.brand');
    if (brand) {
        brand.style.cursor = 'pointer';
        brand.addEventListener('click', () => {
            switchTab('overview');
        });
    }
    
    // 3. Notifications Dropdown Panel
    const bellBtn = document.querySelector('.header-action-btn[title="Notifications"]');
    const notifPanel = document.getElementById('notifications-panel');
    if (bellBtn && notifPanel) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPanel.classList.toggle('active');
            
            // Hide notification dot when opened
            const dot = bellBtn.querySelector('.notification-dot');
            if (dot) dot.style.display = 'none';
            
            // Close other dropdowns
            const searchDropdown = document.getElementById('search-dropdown');
            if (searchDropdown) searchDropdown.classList.remove('active');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        if (notifPanel) notifPanel.classList.remove('active');
        const searchDropdown = document.getElementById('search-dropdown');
        if (searchDropdown) searchDropdown.classList.remove('active');
    });
    
    if (notifPanel) {
        notifPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // 4. Search Bar Logic
    const searchInput = document.querySelector('.search-bar input');
    const searchDropdown = document.getElementById('search-dropdown');
    
    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                searchDropdown.innerHTML = '';
                searchDropdown.classList.remove('active');
                return;
            }
            
            const results = searchIndex.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query)
            ).slice(0, 5);
            
            if (results.length === 0) {
                searchDropdown.innerHTML = '<div class="search-no-results">No matches found</div>';
            } else {
                searchDropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" data-type="${item.type}" data-id="${item.id}" data-tab="${item.tab || ''}">
                        <div class="result-icon-wrapper ${item.type}">
                            <i data-lucide="${getSearchIcon(item.type)}"></i>
                        </div>
                        <div class="result-info">
                            <div class="result-title">${item.title}</div>
                            <div class="result-desc">${item.description}</div>
                        </div>
                    </div>
                `).join('');
                createIconsSafe();
            }
            searchDropdown.classList.add('active');
            
            // Close notification panel if open
            if (notifPanel) notifPanel.classList.remove('active');
        });
        
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
            if (searchInput.value.trim()) {
                searchDropdown.classList.add('active');
            }
        });
        
        // Handle result click
        searchDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (!item) return;
            
            const type = item.getAttribute('data-type');
            const id = item.getAttribute('data-id');
            const tab = item.getAttribute('data-tab');
            const clickedTitle = item.querySelector('.result-title').textContent;
            
            if (type === 'tab') {
                switchTab(id);
            } else if (type === 'milestone') {
                switchTab('overview');
                setTimeout(() => {
                    activateMilestone(id);
                    const el = document.getElementById(`node-${id}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        flashElement(el);
                    }
                }, 400);
            } else if (type === 'skill') {
                switchTab(tab);
                setTimeout(() => {
                    // Look inside the skills boxes for a matching item
                    const listItems = document.querySelectorAll('#skills-section li');
                    let foundItem = null;
                    for (const li of listItems) {
                        if (li.textContent.toLowerCase().includes(clickedTitle.toLowerCase().split(' ')[0])) {
                            foundItem = li;
                            break;
                        }
                    }
                    if (foundItem) {
                        foundItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        flashElement(foundItem);
                    }
                }, 400);
            } else if (type === 'project') {
                switchTab(tab);
                setTimeout(() => {
                    const cards = document.querySelectorAll('#projects-container .project-card-interactive');
                    let foundCard = null;
                    for (const card of cards) {
                        const titleEl = card.querySelector('h3');
                        if (titleEl && titleEl.textContent.toLowerCase().includes(clickedTitle.toLowerCase().split(':')[0])) {
                            foundCard = card;
                            break;
                        }
                    }
                    if (foundCard) {
                        foundCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        flashElement(foundCard);
                    }
                }, 400);
            }
            
            searchInput.value = '';
            searchDropdown.classList.remove('active');
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
