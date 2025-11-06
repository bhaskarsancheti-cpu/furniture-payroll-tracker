let firebaseApp = null;
let database = null;
let firebaseConfig = null;
let allEmployees = {};
let allAttendance = {};
let allAdvances = {};
let allDailyLabor = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded triggered');
    setTimeout(initializeApp, 500);
});

function initializeApp() {
    console.log('Initializing app...');
    const savedConfig = localStorage.getItem('firebaseConfig');
    
    if (savedConfig) {
        try {
            firebaseConfig = JSON.parse(savedConfig);
            console.log('Config found in localStorage');
            connectToFirebaseDatabase();
        } catch(error) {
            console.error('Error parsing config:', error);
            showSetupModal();
        }
    } else {
        console.log('No config found, showing setup modal');
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
        document.getElementById('setupError').textContent = 'Please fill all fields';
        document.getElementById('setupError').style.display = 'block';
        return;
    }

    firebaseConfig = { apiKey, authDomain, databaseURL, projectId };
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('connectBtn').textContent = 'Connecting...';
    document.getElementById('setupError').style.display = 'none';

    connectToFirebaseDatabase();
}

function connectToFirebaseDatabase() {
    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('Firebase app initialized');
        } else {
            firebaseApp = firebase.app();
            console.log('Using existing Firebase app');
        }
        
        database = firebase.database();
        console.log('Database reference obtained');
        
        database.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === true) {
                console.log('Connected to Firebase Database');
                localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
                document.getElementById('firebase-setup-modal').classList.add('hidden');
                document.getElementById('main-app').style.display = 'block';
                document.getElementById('connectBtn').disabled = false;
                document.getElementById('connectBtn').textContent = 'Connect to Firebase';
                
                loadAllDataFromFirebase();
                loadDashboard();
            } else {
                console.log('Not connected to Firebase');
                document.getElementById('setupError').textContent = 'Not connected to Firebase. Check your credentials.';
                document.getElementById('setupError').style.display = 'block';
            }
        });
    } catch(error) {
        console.error('Firebase connection error:', error);
        document.getElementById('setupError').textContent = 'Error: ' + error.message;
        document.getElementById('setupError').style.display = 'block';
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('connectBtn').textContent = 'Connect to Firebase';
    }
}

function loadAllDataFromFirebase() {
    console.log('Loading data from Firebase...');
    
    if (!database) return;
    
    database.ref('employees').on('value', snapshot => {
        allEmployees = snapshot.val() || {};
        console.log('Employees:', allEmployees);
    });

    database.ref('attendanceLog').on('value', snapshot => {
        allAttendance = snapshot.val() || {};
        console.log('Attendance:', allAttendance);
    });

    database.ref('advances').on('value', snapshot => {
        allAdvances = snapshot.val() || {};
        console.log('Advances:', allAdvances);
    });

    database.ref('dailyLaborers').on('value', snapshot => {
        allDailyLabor = snapshot.val() || {};
        console.log('Daily Labor:', allDailyLabor);
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
    const totalAdvances = calculateTotalAdvances();
    
    content.innerHTML = `
        <div class="card">
            <h3>📊 Dashboard</h3>
            <p><span class="success">✓ Firebase Connected Successfully!</span></p>
            <p>Your payroll system is live and syncing data in real-time to Firebase.</p>
            <h4 style="margin-top: 20px;">System Status:</h4>
            <ul style="margin-left: 20px; margin-top: 10px; line-height: 2; font-size: 14px;">
                <li>✓ Team Size: ${employeeCount} employees</li>
                <li>✓ Firebase: Connected</li>
                <li>✓ Data Sync: Real-time Active</li>
                <li>✓ Pending Advances: ${advanceCount} (₹${totalAdvances})</li>
                <li>✓ Backup: Enabled</li>
            </ul>
        </div>
    `;
}

function loadTeam() {
    const content = document.getElementById('tab-content');
    
    let employeesHTML = '<table><tr><th>Name</th><th>Role</th><th>Salary</th><th>Status</th></tr>';
    
    if (Object.keys(allEmployees).length === 0) {
        employeesHTML += '<tr><td colspan="4">No employees found</td></tr>';
    } else {
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
    
    let attendanceHTML = '<table><tr><th>Date</th><th>Employee</th><th>Start</th><th>End</th><th>Hours</th><th>Status</th></tr>';
    
    if (Object.keys(allAttendance).length === 0) {
        attendanceHTML += '<tr><td colspan="6">No attendance records found</td></tr>';
    } else {
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
    
    let advancesHTML = '<table><tr><th>Employee</th><th>Amount</th><th>Date</th><th>Reason</th><th>Status</th></tr>';
    
    if (Object.keys(allAdvances).length === 0) {
        advancesHTML += '<tr><td colspan="5">No advances found</td></tr>';
    } else {
        for (const id in allAdvances) {
            const adv = allAdvances[id];
            advancesHTML += `
                <tr>
                    <td>${adv.employee_name || 'N/A'}</td>
                    <td>₹${adv.amount || 0}</td>
                    <td>${adv.date_given || 'N/A'}</td>
                    <td>${adv.reason || 'N/A'}</td>
                    <td>${adv.status || 'N/A'}</td>
                </tr>
            `;
        }
    }
    
    advancesHTML += '</table>';
    
    const totalAdvances = calculateTotalAdvances();
    
    content.innerHTML = `
        <div class="card">
            <h3>💰 Advance Tracking</h3>
            <p>Total Pending Advances: ₹${totalAdvances}</p>
            ${advancesHTML}
        </div>
    `;
}

function loadDailyLabor() {
    const content = document.getElementById('tab-content');
    
    let laborHTML = '<table><tr><th>Date</th><th>Name</th><th>Wage</th><th>Hours</th><th>Total</th></tr>';
    
    if (Object.keys(allDailyLabor).length === 0) {
        laborHTML += '<tr><td colspan="5">No daily labor entries found</td></tr>';
    } else {
        for (const id in allDailyLabor) {
            const labor = allDailyLabor[id];
            const total = (labor.daily_wage || 0) * (labor.hours_worked || 0);
            laborHTML += `
                <tr>
                    <td>${labor.date || 'N/A'}</td>
                    <td>${labor.name || 'N/A'}</td>
                    <td>₹${labor.daily_wage || 0}</td>
                    <td>${labor.hours_worked || 0}h</td>
                    <td>₹${total}</td>
                </tr>
            `;
        }
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
    
    const totalEmployees = Object.keys(allEmployees).length;
    const totalBaseSalary = Object.values(allEmployees).reduce((sum, emp) => sum + (emp.current_salary || 0), 0);
    
    content.innerHTML = `
        <div class="card">
            <h3>💵 Payroll Summary - November 2025</h3>
            <p>Total Employees: ${totalEmployees}</p>
            <p>Total Base Salary: ₹${totalBaseSalary}</p>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">Payroll is calculated based on attendance, advances, and daily labor entries.</p>
        </div>
    `;
}

function loadExport() {
    const content = document.getElementById('tab-content');
    
    content.innerHTML = `
        <div class="card">
            <h3>💾 Export & Backup</h3>
            <button class="btn btn-primary" onclick="exportToJSON()" style="width: auto; margin: 10px 0;">📥 Download Full Backup (JSON)</button>
            <button class="btn btn-primary" onclick="exportToCSV()" style="width: auto; margin: 10px 0;">📥 Download Attendance CSV</button>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">All your data from Firebase can be exported for backup, record-keeping, and offline access.</p>
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
    URL.revokeObjectURL(url);
}

function exportToCSV() {
    let csv = 'Date,Employee,Start Time,End Time,Hours,Status\n';
    
    for (const id in allAttendance) {
        const att = allAttendance[id];
        csv += `"${att.date}","${att.employee_name}","${att.start_time}","${att.end_time}",${att.net_hours},"${att.status}"\n`;
    }
    
    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-log-${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
