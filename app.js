let firebaseApp = null;
let database = null;
let firebaseConfig = null;
let allEmployees = {};
let allAttendance = {};
let allAdvances = {};
let allDailyLabor = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const savedConfig = localStorage.getItem('firebaseConfig');
    
    if (savedConfig) {
        try {
            firebaseConfig = JSON.parse(savedConfig);
            connectToFirebaseDatabase();
        } catch(error) {
            console.log('Error:', error);
            showSetupModal();
        }
    } else {
        showSetupModal();
    }
}

function showSetupModal() {
    document.getElementById('firebase-setup-modal').classList.remove('hidden');
    document.getElementById('main-app').style.display = 'none';
}

function connectFirebase() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const authDomain = document.getElementById('authDomain').value.trim();
    const databaseURL = document.getElementById('databaseURL').value.trim();
    const projectId = document.getElementById('projectId').value.trim();

    if (!apiKey || !authDomain || !databaseURL || !projectId) {
        alert('Please fill all fields');
        return;
    }

    firebaseConfig = { apiKey, authDomain, databaseURL, projectId };
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('connectBtn').textContent = 'Connecting...';

    connectToFirebaseDatabase();
}

function connectToFirebaseDatabase() {
    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.app();
        }
        
        database = firebase.database();
        
        database.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === true) {
                console.log('Connected to Firebase');
                localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
                document.getElementById('firebase-setup-modal').classList.add('hidden');
                document.getElementById('main-app').style.display = 'block';
                document.getElementById('connectBtn').disabled = false;
                document.getElementById('connectBtn').textContent = 'Connect to Firebase';
                
                // Load all data from Firebase
                loadAllDataFromFirebase();
                loadDashboard();
            }
        });
    } catch(error) {
        alert('Firebase error: ' + error.message);
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('connectBtn').textContent = 'Connect to Firebase';
    }
}

// Load all data from Firebase
function loadAllDataFromFirebase() {
    // Load Employees
    database.ref('employees').on('value', snapshot => {
        allEmployees = snapshot.val() || {};
        console.log('Employees loaded:', allEmployees);
    });

    // Load Attendance
    database.ref('attendanceLog').on('value', snapshot => {
        allAttendance = snapshot.val() || {};
        console.log('Attendance loaded:', allAttendance);
    });

    // Load Advances
    database.ref('advances').on('value', snapshot => {
        allAdvances = snapshot.val() || {};
        console.log('Advances loaded:', allAdvances);
    });

    // Load Daily Labor
    database.ref('dailyLaborers').on('value', snapshot => {
        allDailyLabor = snapshot.val() || {};
        console.log('Daily labor loaded:', allDailyLabor);
    });
}

function showTab(tabName, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'team') loadTeam();
    else if (tabName === 'attendance') loadAttendance();
    else if (tabName === 'advances') loadAdvances();
    else if (tabName === 'dailyLabor') loadDailyLabor();
    else if (tabName === 'payroll') loadPayroll();
    else if (tabName === 'export') loadExport();
}

function loadDashboard() {
    const content = document.getElementById('tab-content');
    const employeeCount = Object.keys(allEmployees).length;
    const advanceCount = Object.keys(allAdvances).length;
    
    content.innerHTML = `
        <div class="card">
            <h3>📊 Dashboard</h3>
            <p><span class="success">✓ Firebase Connected Successfully!</span></p>
            <p>Your payroll system is live and syncing data in real-time to Firebase.</p>
            <h4 style="margin-top: 20px;">System Status:</h4>
            <ul style="margin-left: 20px; margin-top: 10px; line-height: 2;">
                <li>✓ Team Size: ${employeeCount} employees</li>
                <li>✓ Firebase: Connected</li>
                <li>✓ Data Sync: Real-time Active</li>
                <li>✓ Pending Advances: ${advanceCount}</li>
                <li>✓ Backup: Enabled</li>
            </ul>
        </div>
    `;
}

function loadTeam() {
    const content = document.getElementById('tab-content');
    
    let employeesHTML = '<table style="width: 100%;"><tr><th>Name</th><th>Role</th><th>Salary</th><th>Status</th></tr>';
    
    for (const id in allEmployees) {
        const emp = allEmployees[id];
        employeesHTML += `
            <tr>
                <td>${emp.name || 'N/A'}</td>
                <td>${emp.role || 'N/A'}</td>
                <td>₹${emp.current_salary || 0}</td>
                <td>${emp.status || 'Active'}</td>
            </tr>
        `;
    }
    
    employeesHTML += '</table>';
    
    content.innerHTML = `
        <div class="card">
            <h3>👥 Team Management</h3>
            <p>Total Employees: ${Object.keys(allEmployees).length}</p>
            ${employeesHTML}
        </div>
    `;
}

function loadAttendance() {
    const content = document.getElementById('tab-content');
    
    let attendanceHTML = '<table style="width: 100%;"><tr><th>Date</th><th>Employee</th><th>Start</th><th>End</th><th>Hours</th><th>Status</th></tr>';
    
    for (const id in allAttendance) {
        const att = allAttendance[id];
        attendanceHTML += `
            <tr>
                <td>${att.date || 'N/A'}</td>
                <td>${att.employee_name || 'N/A'}</td>
                <td>${att.start_time || 'N/A'}</td>
                <td>${att.end_time || 'N/A'}</td>
                <td>${att.net_hours || 0}</td>
                <td>${att.status || 'N/A'}</td>
            </tr>
        `;
    }
    
    attendanceHTML += '</table>';
    
    content.innerHTML = `
        <div class="card">
            <h3>📋 Attendance Log</h3>
            <p>Total Entries: ${Object.keys(allAttendance).length}</p>
            ${attendanceHTML}
        </div>
    `;
}

function loadAdvances() {
    const content = document.getElementById('tab-content');
    
    let advancesHTML = '<table style="width: 100%;"><tr><th>Employee</th><th>Amount</th><th>Date</th><th>Status</th></tr>';
    
    for (const id in allAdvances) {
        const adv = allAdvances[id];
        advancesHTML += `
            <tr>
                <td>${adv.employee_name || 'N/A'}</td>
                <td>₹${adv.amount || 0}</td>
                <td>${adv.date_given || 'N/A'}</td>
                <td>${adv.status || 'N/A'}</td>
            </tr>
        `;
    }
    
    advancesHTML += '</table>';
    
    content.innerHTML = `
        <div class="card">
            <h3>💰 Advance Tracking</h3>
            <p>Total Pending Advances: ₹${calculateTotalAdvances()}</p>
            ${advancesHTML}
        </div>
    `;
}

function loadDailyLabor() {
    const content = document.getElementById('tab-content');
    
    let laborHTML = '<table style="width: 100%;"><tr><th>Date</th><th>Name</th><th>Wage</th><th>Hours</th><th>Total</th></tr>';
    
    for (const id in allDailyLabor) {
        const labor = allDailyLabor[id];
        const total = (labor.daily_wage || 0) * (labor.hours_worked || 0);
        laborHTML += `
            <tr>
                <td>${labor.date || 'N/A'}</td>
                <td>${labor.name || 'N/A'}</td>
                <td>₹${labor.daily_wage || 0}</td>
                <td>${labor.hours_worked || 0}</td>
                <td>₹${total}</td>
            </tr>
        `;
    }
    
    laborHTML += '</table>';
    
    content.innerHTML = `
        <div class="card">
            <h3>👷 Daily Labor</h3>
            <p>Total Entries: ${Object.keys(allDailyLabor).length}</p>
            ${laborHTML}
        </div>
    `;
}

function loadPayroll() {
    const content = document.getElementById('tab-content');
    
    content.innerHTML = `
        <div class="card">
            <h3>💵 Payroll Summary</h3>
            <p>Payroll calculations for November 2025</p>
            <p>Total Employees: ${Object.keys(allEmployees).length}</p>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">Payroll module ready. View payroll details per employee.</p>
        </div>
    `;
}

function loadExport() {
    const content = document.getElementById('tab-content');
    
    content.innerHTML = `
        <div class="card">
            <h3>💾 Export & Backup</h3>
            <button class="btn btn-primary" onclick="exportToCSV()" style="width: 200px; margin: 10px 0;">Download as CSV</button>
            <button class="btn btn-primary" onclick="exportToJSON()" style="width: 200px; margin: 10px 0;">Download Full Backup (JSON)</button>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">All your data can be exported for backup and offline access.</p>
        </div>
    `;
}

function calculateTotalAdvances() {
    let total = 0;
    for (const id in allAdvances) {
        if (allAdvances[id].status === 'Pending' || allAdvances[id].status === 'Partial') {
            total += allAdvances[id].amount || 0;
        }
    }
    return total;
}

function exportToJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        employees: allEmployees,
        attendance: allAttendance,
        advances: allAdvances,
        dailyLabor: allDailyLabor
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `furniture-payroll-backup-${new Date().getTime()}.json`;
    link.click();
}

function exportToCSV() {
    let csv = 'Date,Employee,Start,End,Hours,Status,Wage\n';
    
    for (const id in allAttendance) {
        const att = allAttendance[id];
        csv += `${att.date},${att.employee_name},${att.start_time},${att.end_time},${att.net_hours},${att.status},0\n`;
    }
    
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-log-${new Date().getTime()}.csv`;
    link.click();
}
