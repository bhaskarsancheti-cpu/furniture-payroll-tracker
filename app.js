let db = null;
let firebaseConfig = null;
let allData = { employees: {}, attendance: {}, advances: {}, dailyLabor: {} };
let editingId = null;
let editingType = null;

document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('fbConfig');
    if (saved) {
        try {
            firebaseConfig = JSON.parse(saved);
            connectFirebase();
        } catch(e) {
            console.error('Config error:', e);
        }
    }
});

function setupFirebase() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const authDomain = document.getElementById('authDomain').value.trim();
    const databaseURL = document.getElementById('databaseURL').value.trim();
    const projectId = document.getElementById('projectId').value.trim();

    if (!apiKey || !authDomain || !databaseURL || !projectId) {
        document.getElementById('setupError').textContent = 'Fill all fields';
        document.getElementById('setupError').style.display = 'block';
        return;
    }

    firebaseConfig = { apiKey, authDomain, databaseURL, projectId };
    document.getElementById('setupBtn').disabled = true;
    connectFirebase();
}

function connectFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();

        db.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === true) {
                localStorage.setItem('fbConfig', JSON.stringify(firebaseConfig));
                document.getElementById('firebase-setup-modal').classList.add('hidden');
                document.getElementById('main-app').style.display = 'block';
                loadAllData();
                renderDashboard();
                document.getElementById('setupBtn').disabled = false;
            }
        });
    } catch(error) {
        document.getElementById('setupError').textContent = 'Error: ' + error.message;
        document.getElementById('setupError').style.display = 'block';
        document.getElementById('setupBtn').disabled = false;
    }
}

function loadAllData() {
    if (!db) return;
    db.ref('employees').on('value', snapshot => { allData.employees = snapshot.val() || {}; updateSelects(); });
    db.ref('attendanceLog').on('value', snapshot => { allData.attendance = snapshot.val() || {}; });
    db.ref('advances').on('value', snapshot => { allData.advances = snapshot.val() || {}; });
    db.ref('dailyLaborers').on('value', snapshot => { allData.dailyLabor = snapshot.val() || {}; });
}

function switchTab(event, tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    editingId = null;
    editingType = null;
    if (tab === 'dashboard') renderDashboard();
    else if (tab === 'team') renderTeam();
    else if (tab === 'attendance') renderAttendance();
    else if (tab === 'advances') renderAdvances();
    else if (tab === 'dailyLabor') renderDailyLabor();
    else if (tab === 'payroll') renderPayroll();
    else if (tab === 'export') renderExport();
}

function renderDashboard() {
    document.getElementById('tab-content').innerHTML = `
        <div class="card">
            <h3>📊 Dashboard</h3>
            <p><span class="success">✓ Firebase Connected</span></p>
            <p>Employees: ${Object.keys(allData.employees).length}</p>
            <p>Attendance Records: ${Object.keys(allData.attendance).length}</p>
            <p>Pending Advances: ₹${calculateAdvances()}</p>
            <p>Daily Labor Entries: ${Object.keys(allData.dailyLabor).length}</p>
        </div>
    `;
}

function renderTeam() {
    let html = `<div class="card"><h3>👥 Team</h3>
        <button onclick="openModal('add-employee-modal')" class="btn btn-add">+ Add Employee</button>
        <table><tr><th>Name</th><th>Role</th><th>Salary</th><th>Status</th><th>Action</th></tr>`;
    
    const emps = Object.entries(allData.employees);
    if (emps.length === 0) html += '<tr><td colspan="5">No employees</td></tr>';
    else emps.forEach(([id, emp]) => {
        if (editingId === id && editingType === 'emp') {
            html += `<tr class="edit-row">
                <td><input type="text" id="edit-name" value="${emp.name}"></td>
                <td><input type="text" id="edit-role" value="${emp.role}"></td>
                <td><input type="number" id="edit-salary" value="${emp.current_salary}"></td>
                <td><input type="text" id="edit-status" value="${emp.status}"></td>
                <td>
                    <button class="btn btn-small btn-save" onclick="saveEmpEdit('${id}')">Save</button>
                    <button class="btn btn-small btn-cancel" onclick="cancelEdit()">Cancel</button>
                </td>
            </tr>`;
        } else {
            html += `<tr>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>₹${emp.current_salary}</td>
                <td>${emp.status}</td>
                <td>
                    <button class="btn btn-small btn-edit" onclick="editEmp('${id}')">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteEmp('${id}')">Delete</button>
                </td>
            </tr>`;
        }
    });
    html += '</table></div>';
    document.getElementById('tab-content').innerHTML = html;
}

function renderAttendance() {
    let html = `<div class="card"><h3>📋 Attendance</h3>
        <button onclick="openModal('add-attendance-modal')" class="btn btn-add">+ Add</button>
        <table><tr><th>Date</th><th>Employee</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr>`;
    
    const atts = Object.entries(allData.attendance);
    if (atts.length === 0) html += '<tr><td colspan="6">No records</td></tr>';
    else atts.forEach(([id, att]) => {
        if (editingId === id && editingType === 'att') {
            html += `<tr class="edit-row">
                <td><input type="date" id="edit-date" value="${att.date}"></td>
                <td>${att.employee_name}</td>
                <td><input type="text" id="edit-start" value="${att.start_time}"></td>
                <td><input type="text" id="edit-end" value="${att.end_time}"></td>
                <td><select id="edit-status"><option>Present</option><option>Absent</option><option>Leave</option><option>Half-day</option></select></td>
                <td>
                    <button class="btn btn-small btn-save" onclick="saveAttEdit('${id}')">Save</button>
                    <button class="btn btn-small btn-cancel" onclick="cancelEdit()">Cancel</button>
                </td>
            </tr>`;
        } else {
            html += `<tr>
                <td>${att.date}</td>
                <td>${att.employee_name}</td>
                <td>${att.start_time}</td>
                <td>${att.end_time}</td>
                <td>${att.status}</td>
                <td>
                    <button class="btn btn-small btn-edit" onclick="editAtt('${id}')">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteAtt('${id}')">Delete</button>
                </td>
            </tr>`;
        }
    });
    html += '</table></div>';
    document.getElementById('tab-content').innerHTML = html;
}

function renderAdvances() {
    let html = `<div class="card"><h3>💰 Advances</h3>
        <button onclick="openModal('add-advance-modal')" class="btn btn-add">+ Add</button>
        <p>Total Pending: ₹${calculateAdvances()}</p>
        <table><tr><th>Employee</th><th>Amount</th><th>Date</th><th>Reason</th><th>Action</th></tr>`;
    
    const advs = Object.entries(allData.advances);
    if (advs.length === 0) html += '<tr><td colspan="5">No advances</td></tr>';
    else advs.forEach(([id, adv]) => {
        if (editingId === id && editingType === 'adv') {
            html += `<tr class="edit-row">
                <td>${adv.employee_name}</td>
                <td><input type="number" id="edit-amount" value="${adv.amount}"></td>
                <td><input type="date" id="edit-date" value="${adv.date_given}"></td>
                <td><input type="text" id="edit-reason" value="${adv.reason}"></td>
                <td>
                    <button class="btn btn-small btn-save" onclick="saveAdvEdit('${id}')">Save</button>
                    <button class="btn btn-small btn-cancel" onclick="cancelEdit()">Cancel</button>
                </td>
            </tr>`;
        } else {
            html += `<tr>
                <td>${adv.employee_name}</td>
                <td>₹${adv.amount}</td>
                <td>${adv.date_given}</td>
                <td>${adv.reason}</td>
                <td>
                    <button class="btn btn-small btn-edit" onclick="editAdv('${id}')">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteAdv('${id}')">Delete</button>
                </td>
            </tr>`;
        }
    });
    html += '</table></div>';
    document.getElementById('tab-content').innerHTML = html;
}

function renderDailyLabor() {
    let html = `<div class="card"><h3>👷 Daily Labor</h3>
        <button onclick="openModal('add-labor-modal')" class="btn btn-add">+ Add</button>
        <table><tr><th>Date</th><th>Name</th><th>Wage</th><th>Hours</th><th>Total</th><th>Action</th></tr>`;
    
    const labors = Object.entries(allData.dailyLabor);
    if (labors.length === 0) html += '<tr><td colspan="6">No entries</td></tr>';
    else labors.forEach(([id, labor]) => {
        const total = labor.daily_wage * labor.hours_worked;
        if (editingId === id && editingType === 'labor') {
            html += `<tr class="edit-row">
                <td><input type="date" id="edit-date" value="${labor.date}"></td>
                <td><input type="text" id="edit-name" value="${labor.name}"></td>
                <td><input type="number" id="edit-wage" value="${labor.daily_wage}"></td>
                <td><input type="number" id="edit-hours" value="${labor.hours_worked}"></td>
                <td>₹${total}</td>
                <td>
                    <button class="btn btn-small btn-save" onclick="saveLaborEdit('${id}')">Save</button>
                    <button class="btn btn-small btn-cancel" onclick="cancelEdit()">Cancel</button>
                </td>
            </tr>`;
        } else {
            html += `<tr>
                <td>${labor.date}</td>
                <td>${labor.name}</td>
                <td>₹${labor.daily_wage}</td>
                <td>${labor.hours_worked}</td>
                <td>₹${total}</td>
                <td>
                    <button class="btn btn-small btn-edit" onclick="editLabor('${id}')">Edit</button>
                    <button class="btn btn-small btn-delete" onclick="deleteLabor('${id}')">Delete</button>
                </td>
            </tr>`;
        }
    });
    html += '</table></div>';
    document.getElementById('tab-content').innerHTML = html;
}

function renderPayroll() {
    document.getElementById('tab-content').innerHTML = `<div class="card"><h3>💵 Payroll</h3>
        <p>Employees: ${Object.keys(allData.employees).length}</p>
        <p>Payroll calculated from attendance and advances data.</p></div>`;
}

function renderExport() {
    document.getElementById('tab-content').innerHTML = `<div class="card"><h3>💾 Export</h3>
        <button class="btn btn-primary" onclick="expJSON()" style="width:200px;margin:10px 0;">Download JSON</button>
        <button class="btn btn-primary" onclick="expCSV()" style="width:200px;margin:10px 0;">Download CSV</button></div>`;
}

// EDIT FUNCTIONS
function editEmp(id) { editingId = id; editingType = 'emp'; renderTeam(); }
function editAtt(id) { editingId = id; editingType = 'att'; renderAttendance(); }
function editAdv(id) { editingId = id; editingType = 'adv'; renderAdvances(); }
function editLabor(id) { editingId = id; editingType = 'labor'; renderDailyLabor(); }
function cancelEdit() { editingId = null; editingType = null; renderTeam(); }

// SAVE EDITS
function saveEmpEdit(id) {
    const name = document.getElementById('edit-name').value.trim();
    const role = document.getElementById('edit-role').value.trim();
    const salary = parseInt(document.getElementById('edit-salary').value);
    const status = document.getElementById('edit-status').value;
    
    if (!name || !role || !salary) { alert('Fill all fields'); return; }
    
    db.ref('employees/' + id).update({ name, role, current_salary: salary, status }).then(() => {
        alert('Saved!');
        editingId = null;
        editingType = null;
        renderTeam();
    });
}

function saveAttEdit(id) {
    const date = document.getElementById('edit-date').value;
    const start = document.getElementById('edit-start').value;
    const end = document.getElementById('edit-end').value;
    const status = document.getElementById('edit-status').value;
    
    if (!date || !start || !end) { alert('Fill all fields'); return; }
    
    db.ref('attendanceLog/' + id).update({ date, start_time: start, end_time: end, status }).then(() => {
        alert('Saved!');
        editingId = null;
        editingType = null;
        renderAttendance();
    });
}

function saveAdvEdit(id) {
    const amount = parseInt(document.getElementById('edit-amount').value);
    const date = document.getElementById('edit-date').value;
    const reason = document.getElementById('edit-reason').value;
    
    if (!amount || !date) { alert('Fill all fields'); return; }
    
    db.ref('advances/' + id).update({ amount, date_given: date, reason }).then(() => {
        alert('Saved!');
        editingId = null;
        editingType = null;
        renderAdvances();
    });
}

function saveLaborEdit(id) {
    const date = document.getElementById('edit-date').value;
    const name = document.getElementById('edit-name').value.trim();
    const wage = parseInt(document.getElementById('edit-wage').value);
    const hours = parseInt(document.getElementById('edit-hours').value);
    
    if (!date || !name || !wage) { alert('Fill all fields'); return; }
    
    db.ref('dailyLaborers/' + id).update({ date, name, daily_wage: wage, hours_worked: hours }).then(() => {
        alert('Saved!');
        editingId = null;
        editingType = null;
        renderDailyLabor();
    });
}

// ADD NEW FUNCTIONS (unchanged)
function saveEmployee() {
    const name = document.getElementById('emp-name').value.trim();
    const role = document.getElementById('emp-role').value.trim();
    const salary = parseInt(document.getElementById('emp-salary').value);
    const hireDate = document.getElementById('emp-hire-date').value;
    const phone = document.getElementById('emp-phone').value.trim();

    if (!name || !role || !salary) { alert('Fill required fields'); return; }

    const id = 'emp_' + Date.now();
    db.ref('employees/' + id).set({ name, role, current_salary: salary, hire_date: hireDate, phone, status: 'Active' }).then(() => {
        alert('Saved!');
        closeModal('add-employee-modal');
        document.getElementById('emp-name').value = '';
        document.getElementById('emp-role').value = '';
        document.getElementById('emp-salary').value = '';
        document.getElementById('emp-hire-date').value = '';
        document.getElementById('emp-phone').value = '';
    });
}

function saveAttendance() {
    const date = document.getElementById('att-date').value;
    const empId = document.getElementById('att-employee').value;
    const startTime = document.getElementById('att-start').value;
    const endTime = document.getElementById('att-end').value;
    const status = document.getElementById('att-status').value;

    if (!date || !empId || !startTime || !endTime) { alert('Fill all fields'); return; }

    const emp = allData.employees[empId];
    if (!emp) { alert('Employee not found'); return; }

    const id = 'att_' + Date.now();
    db.ref('attendanceLog/' + id).set({ date, employee_name: emp.name, start_time: startTime, end_time: endTime, net_hours: 8, status }).then(() => {
        alert('Saved!');
        closeModal('add-attendance-modal');
        document.getElementById('att-date').value = '';
        document.getElementById('att-employee').value = '';
        document.getElementById('att-start').value = '';
        document.getElementById('att-end').value = '';
    });
}

function saveAdvance() {
    const empId = document.getElementById('adv-employee').value;
    const amount = parseInt(document.getElementById('adv-amount').value);
    const date = document.getElementById('adv-date').value;
    const reason = document.getElementById('adv-reason').value;

    if (!empId || !amount || !date) { alert('Fill all fields'); return; }

    const emp = allData.employees[empId];
    if (!emp) { alert('Employee not found'); return; }

    const id = 'adv_' + Date.now();
    db.ref('advances/' + id).set({ employee_name: emp.name, amount, date_given: date, reason, status: 'Pending' }).then(() => {
        alert('Saved!');
        closeModal('add-advance-modal');
        document.getElementById('adv-employee').value = '';
        document.getElementById('adv-amount').value = '';
        document.getElementById('adv-date').value = '';
    });
}

function saveDailyLabor() {
    const date = document.getElementById('labor-date').value;
    const name = document.getElementById('labor-name').value.trim();
    const wage = parseInt(document.getElementById('labor-wage').value);
    const hours = parseInt(document.getElementById('labor-hours').value);

    if (!date || !name || !wage) { alert('Fill all fields'); return; }

    const id = 'labor_' + Date.now();
    db.ref('dailyLaborers/' + id).set({ date, name, daily_wage: wage, hours_worked: hours }).then(() => {
        alert('Saved!');
        closeModal('add-labor-modal');
        document.getElementById('labor-date').value = '';
        document.getElementById('labor-name').value = '';
        document.getElementById('labor-wage').value = '';
        document.getElementById('labor-hours').value = '8';
    });
}

// DELETE FUNCTIONS
function deleteEmp(id) { if (confirm('Delete?')) db.ref('employees/' + id).remove(); }
function deleteAtt(id) { if (confirm('Delete?')) db.ref('attendanceLog/' + id).remove(); }
function deleteAdv(id) { if (confirm('Delete?')) db.ref('advances/' + id).remove(); }
function deleteLabor(id) { if (confirm('Delete?')) db.ref('dailyLaborers/' + id).remove(); }

function updateSelects() {
    const sel1 = document.getElementById('att-employee');
    const sel2 = document.getElementById('adv-employee');
    sel1.innerHTML = '<option value="">Select</option>';
    sel2.innerHTML = '<option value="">Select</option>';
    Object.entries(allData.employees).forEach(([id, emp]) => {
        sel1.innerHTML += `<option value="${id}">${emp.name}</option>`;
        sel2.innerHTML += `<option value="${id}">${emp.name}</option>`;
    });
}

function calculateAdvances() {
    let total = 0;
    Object.values(allData.advances).forEach(adv => {
        if (adv.status === 'Pending' || adv.status === 'Partial') total += adv.amount;
    });
    return total;
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function expJSON() {
    const data = JSON.stringify(allData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function expCSV() {
    let csv = 'Date,Employee,Start,End,Status\n';
    Object.values(allData.attendance).forEach(att => {
        csv += `${att.date},${att.employee_name},${att.start_time},${att.end_time},${att.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-' + Date.now() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}
