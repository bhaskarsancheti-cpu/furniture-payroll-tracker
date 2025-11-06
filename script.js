let firebaseConfig = null;
let db = null;
let currentTab = 'dashboard';

// Initialize app on load
document.addEventListener('DOMContentLoaded', function() {
    checkFirebaseConnection();
});

function connectFirebase() {
    const apiKey = document.getElementById('apiKey').value;
    const authDomain = document.getElementById('authDomain').value;
    const databaseURL = document.getElementById('databaseURL').value;
    const projectId = document.getElementById('projectId').value;

    if (!apiKey || !authDomain || !databaseURL || !projectId) {
        alert('Please fill all fields');
        return;
    }

    firebaseConfig = {
        apiKey: apiKey,
        authDomain: authDomain,
        databaseURL: databaseURL,
        projectId: projectId
    };

    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
        
        document.getElementById('firebase-setup-modal').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        alert('✓ Connected to Firebase');
        loadAllData();
        showTab('dashboard');
    } catch (error) {
        alert('Firebase connection failed: ' + error.message);
    }
}

function checkFirebaseConnection() {
    const savedConfig = localStorage.getItem('firebaseConfig');
    
    if (savedConfig) {
        firebaseConfig = JSON.parse(savedConfig);
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            document.getElementById('firebase-setup-modal').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            loadAllData();
            showTab('dashboard');
        } catch (error) {
            console.log('Firebase already initialized or error:', error);
        }
    }
}

function showTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('tab-content');
    
    if (tabName === 'dashboard') {
        content.innerHTML = '<div class="card"><h3>Dashboard</h3><p>✓ App Connected to Firebase</p><p>Start logging attendance and tracking payroll!</p></div>';
    } else if (tabName === 'team') {
        content.innerHTML = '<div class="card"><h3>Team Management</h3><p>Employee management features available here.</p></div>';
    } else if (tabName === 'attendance') {
        content.innerHTML = '<div class="card"><h3>Attendance Log</h3><p>Log daily attendance here.</p></div>';
    } else if (tabName === 'advances') {
        content.innerHTML = '<div class="card"><h3>Advance Tracking</h3><p>Track employee advances here.</p></div>';
    } else if (tabName === 'dailyLabor') {
        content.innerHTML = '<div class="card"><h3>Daily Labor</h3><p>Add daily labor entries here.</p></div>';
    } else if (tabName === 'payroll') {
        content.innerHTML = '<div class="card"><h3>Payroll Summary</h3><p>View monthly payroll here.</p></div>';
    } else if (tabName === 'export') {
        content.innerHTML = '<div class="card"><h3>Export/Backup</h3><p>Export and backup your data here.</p></div>';
    }
}

function loadAllData() {
    if (db) {
        console.log('Firebase connected and ready to load data');
    }
}
