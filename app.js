/**
 * GroomifyAI - Main Application JavaScript
 * Handles all client-side functionality including:
 * - User authentication and localStorage management
 * - Speech recording simulation
 * - Progress tracking
 * - UI interactions and navigation
 */

// Global Variables
let currentUser = null;
let isRecording = false;
let recordingTimer = null;
let recordingTime = 0;
let currentSession = null;

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('GroomifyAI application starting...');
    
    // Initialize the application based on current page
    initializeApp();
    
    // Set up event listeners for common elements
    setupEventListeners();
    
    // Check user authentication status
    checkAuthStatus();
});

/**
 * Initialize the application based on the current page
 */
function initializeApp() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    console.log(`Initializing page: ${filename}`);
    
    switch(filename) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'login.html':
            initializeLoginPage();
            break;
        case 'dashboard.html':
            initializeDashboard();
            break;
        case 'progress.html':
            initializeProgressPage();
            break;
    }
}

/**
 * Set up common event listeners across all pages
 */
function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // User menu dropdown
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Check if user is authenticated and redirect if necessary
 */
function checkAuthStatus() {
    // Get current user from localStorage
    currentUser = getCurrentUser();
    
    const protectedPages = ['dashboard.html', 'progress.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // If user is not logged in and trying to access protected pages
    if (!currentUser && protectedPages.includes(currentPage)) {
        console.log('User not authenticated, redirecting to login...');
        showMessage('Please log in to access this page.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // If user is logged in, update UI with user info
    if (currentUser) {
        updateUserUI();
    }
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('groomify_current_user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Save current user to localStorage
 */
function setCurrentUser(user) {
    try {
        localStorage.setItem('groomify_current_user', JSON.stringify(user));
        currentUser = user;
        console.log('User session saved:', user.email);
    } catch (error) {
        console.error('Error saving user session:', error);
    }
}

/**
 * Update UI elements with current user information
 */
function updateUserUI() {
    if (!currentUser) return;
    
    // Update user name in header
    const userNameHeader = document.getElementById('userNameHeader');
    const userName = document.getElementById('userName');
    const profileName = document.getElementById('profileName');
    
    if (userNameHeader) userNameHeader.textContent = currentUser.name;
    if (userName) userName.textContent = currentUser.name;
    if (profileName) profileName.textContent = currentUser.name;
    
    console.log('User UI updated for:', currentUser.name);
}

/**
 * Initialize Home Page functionality
 */
function initializeHomePage() {
    console.log('Home page initialized');
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections for animation
    document.querySelectorAll('.about, .features, .cta').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Initialize Login Page functionality
 */
function initializeLoginPage() {
    console.log('Login page initialized');
    
    // Set up tab switching
    setupAuthTabs();
    
    // Set up form handlers
    setupLoginForm();
    setupSignupForm();
    
    // Set up password strength checker
    setupPasswordStrength();
}

/**
 * Set up authentication tab switching
 */
function setupAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
            
            // Clear any existing messages
            hideAuthMessage();
        });
    });
}

/**
 * Switch to specific auth tab (used by footer links)
 */
function switchTab(tabName) {
    const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetTab) {
        targetTab.click();
    }
}

/**
 * Set up login form functionality
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            const password = formData.get('password');
            
            console.log('Login attempt for:', email);
            
            // Validate input
            if (!email || !password) {
                showAuthMessage('Please fill in all fields.', 'error');
                return;
            }
            
            // Check if user exists in localStorage
            const users = getStoredUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                console.log('Login successful for:', email);
                showAuthMessage('Login successful! Redirecting...', 'success');
                
                // Set current user session
                setCurrentUser(user);
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                console.log('Login failed for:', email);
                showAuthMessage('Invalid email or password.', 'error');
            }
        });
    }
}

/**
 * Set up signup form functionality
 */
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const terms = formData.get('terms');
            
            console.log('Signup attempt for:', email);
            
            // Validate input
            if (!name || !email || !password || !confirmPassword) {
                showAuthMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAuthMessage('Passwords do not match.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showAuthMessage('Password must be at least 6 characters long.', 'error');
                return;
            }
            
            if (!terms) {
                showAuthMessage('Please accept the terms and conditions.', 'error');
                return;
            }
            
            // Check if user already exists
            const users = getStoredUsers();
            if (users.find(u => u.email === email)) {
                showAuthMessage('An account with this email already exists.', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                joinDate: new Date().toISOString(),
                sessions: [],
                stats: {
                    totalSessions: 0,
                    totalTime: 0,
                    streak: 0
                }
            };
            
            // Save user to localStorage
            users.push(newUser);
            localStorage.setItem('groomify_users', JSON.stringify(users));
            
            console.log('Signup successful for:', email);
            showAuthMessage('Account created successfully! Please log in.', 'success');
            
            // Switch to login tab after short delay
            setTimeout(() => {
                switchTab('login');
                // Pre-fill login email
                document.getElementById('loginEmail').value = email;
            }, 2000);
        });
    }
}

/**
 * Get all stored users from localStorage
 */
function getStoredUsers() {
    try {
        const users = localStorage.getItem('groomify_users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error getting stored users:', error);
        return [];
    }
}

/**
 * Set up password strength checker
 */
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signupPassword');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            strengthIndicator.textContent = strength.text;
            strengthIndicator.className = `password-strength ${strength.class}`;
            strengthIndicator.style.display = password.length > 0 ? 'block' : 'none';
        });
    }
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) {
        return { text: 'Weak password', class: 'strength-weak' };
    } else if (score < 5) {
        return { text: 'Medium strength', class: 'strength-medium' };
    } else {
        return { text: 'Strong password', class: 'strength-strong' };
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Show authentication message
 */
function showAuthMessage(message, type) {
    const messageElement = document.getElementById('authMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        messageElement.style.display = 'block';
    }
}

/**
 * Hide authentication message
 */
function hideAuthMessage() {
    const messageElement = document.getElementById('authMessage');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

/**
 * Initialize Dashboard functionality
 */
function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Set up scenario selection
    setupScenarioSelection();
    
    // Set up recording interface
    setupRecordingInterface();
    
    // Set up image generation
    setupImageGeneration();
    
    // Load user stats
    loadDashboardStats();
    
    // Initialize session
    initializeSession();
}

/**
 * Set up scenario selection functionality
 */
function setupScenarioSelection() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    
    scenarioButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active scenario
            scenarioButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update scenario details
            const scenario = this.getAttribute('data-scenario');
            updateCurrentScenario(scenario);
        });
    });
}

/**
 * Update current scenario display
 */
function updateCurrentScenario(scenarioId) {
    const scenarios = {
        'technical-interview': {
            title: 'Technical Interview',
            description: "You're in a technical interview for a software developer position. The interviewer is asking about your experience with JavaScript and problem-solving approach. Stay confident, provide specific examples, and explain your thought process clearly.",
            difficulty: 'Medium',
            duration: '5-10 min'
        },
        'behavioral-interview': {
            title: 'Behavioral Interview',
            description: "This is a behavioral interview focusing on your past experiences and how you handle workplace situations. Use the STAR method (Situation, Task, Action, Result) to structure your responses.",
            difficulty: 'Easy',
            duration: '10-15 min'
        },
        'group-discussion': {
            title: 'Group Discussion',
            description: "You're participating in a group discussion about current technology trends. Practice active listening, contributing meaningful points, and respectfully engaging with different viewpoints.",
            difficulty: 'Hard',
            duration: '15-20 min'
        },
        'project-presentation': {
            title: 'Project Presentation',
            description: "Present your latest project to stakeholders. Focus on clear communication, engaging storytelling, and handling questions confidently. Structure your presentation with a clear beginning, middle, and end.",
            difficulty: 'Medium',
            duration: '8-12 min'
        },
        'sales-pitch': {
            title: 'Sales Pitch',
            description: "You're pitching a product or service to potential clients. Focus on identifying customer needs, presenting benefits clearly, and handling objections professionally.",
            difficulty: 'Hard',
            duration: '5-8 min'
        }
    };
    
    const scenario = scenarios[scenarioId];
    if (scenario) {
        document.getElementById('scenarioTitle').textContent = scenario.title;
        document.getElementById('scenarioDescription').textContent = scenario.description;
        
        // Update tags
        const tagsContainer = document.querySelector('.scenario-tags');
        tagsContainer.innerHTML = `
            <span class="tag">Difficulty: ${scenario.difficulty}</span>
            <span class="tag">Duration: ${scenario.duration}</span>
        `;
        
        console.log('Scenario updated:', scenario.title);
    }
}

/**
 * Set up recording interface functionality
 */
function setupRecordingInterface() {
    const micButton = document.getElementById('micButton');
    const playButton = document.getElementById('playButton');
    const resetButton = document.getElementById('resetButton');
    
    if (micButton) {
        micButton.addEventListener('click', toggleRecording);
    }
    
    if (playButton) {
        playButton.addEventListener('click', playRecording);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetRecording);
    }
}

/**
 * Toggle recording state
 */
function toggleRecording() {
    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');
    const recordingStatus = document.getElementById('recordingStatus');
    
    if (!isRecording) {
        // Start recording
        isRecording = true;
        recordingTime = 0;
        
        // Update UI
        micButton.classList.add('recording');
        micIcon.classList.remove('fa-microphone');
        micIcon.classList.add('fa-stop');
        recordingStatus.innerHTML = '<span style="color: #EF4444;">Recording... Click to stop</span>';
        
        // Start timer
        recordingTimer = setInterval(updateRecordingTimer, 1000);
        
        // Simulate recording start
        console.log('Recording started');
        showMessage('Recording started. Speak clearly into your microphone.', 'success');
        
        // Update session progress
        updateSessionProgress(25);
        
    } else {
        // Stop recording
        stopRecording();
    }
}

/**
 * Stop recording
 */
function stopRecording() {
    isRecording = false;
    
    // Clear timer
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    
    // Update UI
    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');
    const recordingStatus = document.getElementById('recordingStatus');
    const playButton = document.getElementById('playButton');
    
    micButton.classList.remove('recording');
    micIcon.classList.remove('fa-stop');
    micIcon.classList.add('fa-microphone');
    recordingStatus.innerHTML = '<span style="color: #10B981;">Recording complete. Click play to review.</span>';
    playButton.disabled = false;
    
    // Simulate AI processing
    console.log('Recording stopped, processing...');
    showMessage('Recording complete! Processing your speech...', 'success');
    
    // Simulate transcription and feedback after delay
    setTimeout(() => {
        generateMockFeedback();
        updateSessionProgress(75);
    }, 2000);
    
    // Save session data
    saveSessionData();
}

/**
 * Update recording timer display
 */
function updateRecordingTimer() {
    recordingTime++;
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    
    const timerElement = document.getElementById('recordingTime');
    if (timerElement) {
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Play recorded audio (simulated)
 */
function playRecording() {
    console.log('Playing recording...');
    showMessage('Playing your recording...', 'success');
    
    // Simulate playback
    const playButton = document.getElementById('playButton');
    const originalText = playButton.innerHTML;
    
    playButton.innerHTML = '<i class="fas fa-pause"></i> Playing';
    playButton.disabled = true;
    
    // Re-enable after simulated playback
    setTimeout(() => {
        playButton.innerHTML = originalText;
        playButton.disabled = false;
        showMessage('Playback complete.', 'success');
    }, 3000);
}

/**
 * Reset recording interface
 */
function resetRecording() {
    // Stop recording if active
    if (isRecording) {
        stopRecording();
    }
    
    // Reset UI
    recordingTime = 0;
    document.getElementById('recordingTime').textContent = '00:00';
    document.getElementById('recordingStatus').innerHTML = '<span>Click to start recording</span>';
    document.getElementById('playButton').disabled = true;
    
    // Clear feedback
    document.getElementById('transcriptionBox').innerHTML = '<p class="placeholder-text">Your speech will be transcribed here...</p>';
    
    // Reset metrics
    document.getElementById('wordCount').textContent = '--';
    document.getElementById('speakingSpeed').textContent = '-- WPM';
    document.getElementById('confidenceLevel').textContent = '--';
    document.getElementById('sentiment').textContent = '--';
    
    // Reset suggestions
    document.getElementById('suggestionsList').innerHTML = '<li class="placeholder-text">Complete a recording to see AI feedback...</li>';
    
    // Reset progress
    updateSessionProgress(0);
    
    console.log('Recording interface reset');
    showMessage('Recording interface reset.', 'success');
}

/**
 * Generate mock AI feedback (simulates real AI analysis)
 */
function generateMockFeedback() {
    // Mock transcription
    const mockTranscriptions = [
        "Thank you for this opportunity. I'm excited about this position because it aligns perfectly with my background in JavaScript development. I have three years of experience building web applications, and I'm particularly skilled in React and Node.js. In my previous role, I led a team project that improved our application's performance by 40%. I approach problem-solving by first understanding the requirements, then breaking down complex problems into manageable pieces.",
        "I believe effective communication is key to successful teamwork. In my experience, I've learned that active listening and clear articulation of ideas helps prevent misunderstandings. When facing challenges, I prefer to collaborate with team members and leverage diverse perspectives to find innovative solutions.",
        "My greatest strength is my ability to adapt quickly to new technologies and environments. For example, when our team needed to migrate from a legacy system, I took the initiative to learn the new framework and helped train other team members. This experience taught me the importance of continuous learning in the tech industry."
    ];
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    
    // Update transcription
    document.getElementById('transcriptionBox').innerHTML = `<p>${randomTranscription}</p>`;
    
    // Generate mock metrics
    const wordCount = randomTranscription.split(' ').length;
    const speakingSpeed = Math.floor(Math.random() * (180 - 120) + 120); // 120-180 WPM
    const confidenceLevel = Math.floor(Math.random() * (95 - 75) + 75); // 75-95%
    const sentiments = ['Positive', 'Confident', 'Professional', 'Enthusiastic'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    // Update metrics
    document.getElementById('wordCount').textContent = wordCount;
    document.getElementById('speakingSpeed').textContent = `${speakingSpeed} WPM`;
    document.getElementById('confidenceLevel').textContent = `${confidenceLevel}%`;
    document.getElementById('sentiment').textContent = sentiment;
    
    // Generate improvement suggestions
    const suggestions = [
        "Great job maintaining eye contact! Consider adding more specific examples to strengthen your responses.",
        "Your speaking pace is excellent. Try to reduce filler words like 'um' and 'uh' for more polished delivery.",
        "Strong content structure. Work on varying your vocal tone to maintain listener engagement.",
        "Excellent use of concrete examples. Consider practicing smoother transitions between main points.",
        "Your confidence level is impressive. Focus on more precise hand gestures to enhance your message."
    ];
    
    const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = randomSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('');
    
    console.log('Mock feedback generated');
}

/**
 * Set up image generation functionality
 */
function setupImageGeneration() {
    const generateButton = document.querySelector('.prompt-input-group .btn');
    if (generateButton) {
        generateButton.addEventListener('click', generateImage);
    }
    
    // Also trigger on Enter key in input
    const promptInput = document.getElementById('imagePrompt');
    if (promptInput) {
        promptInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateImage();
            }
        });
    }
}

/**
 * Generate context image (uses placeholder images)
 */
function generateImage() {
    const promptInput = document.getElementById('imagePrompt');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showMessage('Please enter a prompt for image generation.', 'error');
        return;
    }
    
    console.log('Generating image for prompt:', prompt);
    showMessage('Generating image...', 'success');
    
    // Simulate image generation with placeholder images from Pexels
   const contextImages = {
    'meeting': 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb',
    'office': 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb',
    'interview': 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb',
    'presentation': 'https://images.pexels.com/photos/1181454/pexels-photo-1181454.jpeg?auto=compress&cs=tinysrgb',
    'classroom': 'https://images.pexels.com/photos/1181580/pexels-photo-1181580.jpeg?auto=compress&cs=tinysrgb'
};

    // Select image based on prompt keywords
    let selectedImage = contextImages['office']; // default
    
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('meeting')) {
        selectedImage = contextImages['meeting'];
    } else if (lowerPrompt.includes('interview')) {
        selectedImage = contextImages['interview'];
    } else if (lowerPrompt.includes('presentation')) {
        selectedImage = contextImages['presentation'];
    } else if (lowerPrompt.includes('classroom') || lowerPrompt.includes('class')) {
        selectedImage = contextImages['classroom'];
    }
    
    // Update image display
    const generatedImage = document.getElementById('generatedImage');
    const imageContainer = document.getElementById('generatedImageContainer');
    
    // Simulate loading delay
    setTimeout(() => {
        generatedImage.src = selectedImage;
        generatedImage.alt = `Generated context: ${prompt}`;
        generatedImage.style.display = 'block';
        
        showMessage('Image generated successfully!', 'success');
        console.log('Image generated and displayed');
    }, 2000);
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    if (!currentUser) return;
    
    const stats = currentUser.stats || {
        totalSessions: 0,
        totalTime: 0,
        streak: 0
    };
    
    // Update stats display
    const sessionsToday = document.getElementById('sessionsToday');
    const totalTime = document.getElementById('totalTime');
    const currentStreak = document.getElementById('currentStreak');
    
    if (sessionsToday) {
        // Calculate sessions today (mock data)
        const todaysSessions = Math.min(stats.totalSessions, 3);
        sessionsToday.textContent = todaysSessions;
    }
    
    if (totalTime) {
        totalTime.textContent = `${stats.totalTime} min`;
    }
    
    if (currentStreak) {
        currentStreak.textContent = `${stats.streak} days`;
    }
    
    console.log('Dashboard stats loaded:', stats);
}

/**
 * Initialize new practice session
 */
function initializeSession() {
    currentSession = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        scenario: 'technical-interview',
        progress: 0,
        completed: false
    };
    
    console.log('New session initialized:', currentSession.id);
}

/**
 * Update session progress
 */
function updateSessionProgress(percentage) {
    if (currentSession) {
        currentSession.progress = percentage;
    }
    
    // Update UI
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
    }
    
    // Mark as completed if 100%
    if (percentage >= 100) {
        currentSession.completed = true;
        currentSession.endTime = new Date().toISOString();
        showMessage('Session completed! Great job!', 'success');
        updateSessionProgress(100);
    }
}

/**
 * Save session data to localStorage
 */
function saveSessionData() {
    if (!currentUser || !currentSession) return;
    
    // Update current session
    currentSession.endTime = new Date().toISOString();
    currentSession.duration = recordingTime;
    
    // Get updated user data
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Add session to user's session history
        if (!users[userIndex].sessions) {
            users[userIndex].sessions = [];
        }
        
        users[userIndex].sessions.push(currentSession);
        
        // Update user stats
        users[userIndex].stats.totalSessions++;
        users[userIndex].stats.totalTime += Math.floor(recordingTime / 60); // Convert to minutes
        
        // Save back to localStorage
        localStorage.setItem('groomify_users', JSON.stringify(users));
        
        // Update current user session
        setCurrentUser(users[userIndex]);
        
        console.log('Session data saved:', currentSession);
    }
}

/**
 * Initialize Progress Page functionality
 */
function initializeProgressPage() {
    console.log('Progress page initialized');
    
    // Load user profile data
    loadUserProfile();
    
    // Load session history
    loadSessionHistory();
    
    // Initialize progress chart
    initializeProgressChart();
    
    // Set up chart controls
    setupChartControls();
}

/**
 * Load user profile data
 */
function loadUserProfile() {
    if (!currentUser) return;
    
    // Update profile information
    const memberSince = document.getElementById('memberSince');
    const totalSessions = document.getElementById('totalSessions');
    const practiceHours = document.getElementById('practiceHours');
    
    if (memberSince && currentUser.joinDate) {
        const joinDate = new Date(currentUser.joinDate);
        memberSince.textContent = joinDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }
    
    if (totalSessions) {
        totalSessions.textContent = currentUser.stats?.totalSessions || 0;
    }
    
    if (practiceHours) {
        const hours = Math.floor((currentUser.stats?.totalTime || 0) / 60);
        practiceHours.textContent = hours;
    }
    
    console.log('User profile loaded');
}

/**
 * Load session history
 */
function loadSessionHistory() {
    if (!currentUser || !currentUser.sessions) return;
    
    const sessionsTimeline = document.getElementById('sessionsTimeline');
    if (!sessionsTimeline) return;
    
    // Sort sessions by date (most recent first)
    const sessions = [...currentUser.sessions].sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
    );
    
    // Display recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10);
    
    if (recentSessions.length === 0) {
        sessionsTimeline.innerHTML = `
            <div class="session-item">
                <div class="session-icon">
                    <i class="fas fa-info"></i>
                </div>
                <div class="session-content">
                    <h5>No sessions yet</h5>
                    <p>Start practicing to see your session history here.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate session timeline HTML
    const sessionsHTML = recentSessions.map(session => {
        const date = new Date(session.startTime);
        const timeAgo = getTimeAgo(date);
        const scenarioTitle = getScenarioTitle(session.scenario);
        
        return `
            <div class="session-item">
                <div class="session-icon">
                    <i class="fas fa-microphone"></i>
                </div>
                <div class="session-content">
                    <h5>${scenarioTitle}</h5>
                    <p>${timeAgo} • ${Math.floor(session.duration / 60)} min duration • ${session.progress}% complete</p>
                </div>
            </div>
        `;
    }).join('');
    
    sessionsTimeline.innerHTML = sessionsHTML;
    
    console.log('Session history loaded:', recentSessions.length, 'sessions');
}

/**
 * Get scenario title from scenario ID
 */
function getScenarioTitle(scenarioId) {
    const scenarios = {
        'technical-interview': 'Technical Interview',
        'behavioral-interview': 'Behavioral Interview',
        'group-discussion': 'Group Discussion',
        'project-presentation': 'Project Presentation',
        'sales-pitch': 'Sales Pitch'
    };
    
    return scenarios[scenarioId] || 'Practice Session';
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
}

/**
 * Initialize progress chart (using Canvas API for simple chart)
 */


function initializeProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;
    
    // Sample data for the chart
    const data = [65, 70, 75, 80, 85, 82, 88];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Draw the chart
    drawLineChart(ctx, data, labels, canvas.width, canvas.height);
    
    console.log('Progress chart initialized');
}

/**
 * Draw simple line chart on canvas
 */
function drawLineChart(ctx, data, labels, width, height) {
    const padding = 60;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.strokeStyle = '#2563EB';
    ctx.fillStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.font = '14px Inter';
    
    // Find min and max values for scaling
    const minValue = Math.min(...data) - 10;
    const maxValue = Math.max(...data) + 10;
    const valueRange = maxValue - minValue;
    
    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#2563EB';
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = height - padding + 20;
        ctx.fillText(label, x, y);
    });
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = minValue + (valueRange / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i + 5;
        ctx.fillText(Math.round(value) + '%', padding - 10, y);
    }
}

/**
 * Set up chart controls
 */
function setupChartControls() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            chartButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected period
            const period = this.getAttribute('data-period');
            
            // Update chart (in a real app, this would fetch different data)
            console.log('Chart period changed to:', period);
            
            // For now, just reinitialize with same data
            initializeProgressChart();
        });
    });
}

/**
 * Logout functionality
 */
function logout() {
    console.log('User logging out...');
    
    // Clear current user session
    localStorage.removeItem('groomify_current_user');
    currentUser = null;
    
    // Show logout message
    showMessage('You have been logged out successfully.', 'success');
    
    // Redirect to home page after short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Show temporary message to user
 */
function showMessage(message, type) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('tempMessage');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'tempMessage';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(messageElement);
    }
    
    // Set message content and style
    messageElement.textContent = message;
    
    // Set color based on type
    switch(type) {
        case 'success':
            messageElement.style.backgroundColor = '#10B981';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#EF4444';
            break;
        case 'warning':
            messageElement.style.backgroundColor = '#F59E0B';
            break;
        default:
            messageElement.style.backgroundColor = '#2563EB';
    }
    
    // Show message with animation
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
    }, 10);
    
    // Hide message after delay
    setTimeout(() => {
        messageElement.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 4000);
}

// Make functions globally available for onclick handlers
window.togglePassword = togglePassword;
window.switchTab = switchTab;
window.generateImage = generateImage;
window.logout = logout;