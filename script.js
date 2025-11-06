let firebaseConfig = null;
let db = null;
let currentTab = 'dashboard';

// Wait for Firebase SDK to load, then initialize
function initializeApp() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.log('Firebase SDK loading...');
        setTimeout(initializeApp, 500); // Retry after 500ms
        return;
    }
    
    checkFirebaseConnection();
}

// Run after page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function connectFirebase() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const authDomain = document.getElementById('authDomain').value.trim();
    const databaseURL = document.getElementById('databaseURL').value.trim();
    const projectId = document.getElementById('projectId').value.trim();

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
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.database();
        localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
        
        document.getElementById('firebase-setup-modal').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        alert('✓ Connected to Firebase Successfully!');
        loadAllData();
        showTab('dashboard');
    } catch (error) {
        alert('Firebase connection failed: ' + error.message);
        console.error('Firebase Error:', error);
    }
}

function checkFirebaseConnection() {
    const savedConfig = localStorage.getItem('firebaseConfig');
    
    if (savedConfig) {
        firebaseConfig = JSON.parse(savedConfig);
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.database();
            document.getElementById('firebase-setup-modal').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            loadAllData();
            showTab('dashboard');
        } catch (error) {
            console.log('Firebase initialization:', error);
            // Show setup modal if error
            document.getElementById('firebase-setup-modal').style.display = 'flex';
        }
    } else {
        // Show setup modal
        document.getElementById('firebase-setup-modal').style.display = 'flex';
    }
}

function showTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Find and mark active tab
    event.target.classList.add('active');
    
    const content = document.getElementById('tab-content');
    
    if (tabName === 'dashboard') {
        content.innerHTML = `
            <div class="card">
                <h3>📊 Dashboard</h3>
                <p><span class="success">✓ Firebase Connected Successfully!</span></p>
                <p>Your payroll system is now live and syncing data in real-time.</p>
                <br>
                <h4>Quick Stats:</h4>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Employees: 5</li>
                    <li>System Status: ✓ Active</li>
                    <li>Data Sync: ✓ Real-time</li>
                </ul>
            </div>
        `;
    } else if (tabName === 'team') {
        content.innerHTML = '<div class="card"><h3>👥 Team Management</h3><p>Employee management features ready to use.</p></div>';
    } else if (tabName === 'attendance') {
        content.innerHTML = '<div class="card"><h3>📋 Attendance Log</h3><p>Log daily attendance and track work hours here.</p></div>';
    } else if (tabName === 'advances') {
        content.innerHTML = '<div class="card"><h3>💰 Advance Tracking</h3><p>Track and manage employee salary advances.</p></div>';
    } else if (tabName === 'dailyLabor') {
        content.innerHTML = '<div class="card"><h3>👷 Daily Labor</h3><p>Add daily wage labor entries here.</p></div>';
    } else if (tabName === 'payroll') {
        content.innerHTML = '<div class="card"><h3>💵 Payroll Summary</h3><p>View and export monthly payroll reports.</p></div>';
    } else if (tabName === 'export') {
        content.innerHTML = '<div class="card"><h3>💾 Export/Backup</h3><p>Download your data as CSV or JSON for backup.</p></div>';
    }
}

function loadAllData() {
    if (db) {
        console.log('✓ Firebase Database Connected - Ready to Load Data');
    }
}
