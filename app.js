// Database
let employees = [
    {
        id: 1,
        name: "Dharmendra",
        role: "Carpenter",
        salary_monthly: 27000,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "98765-43210",
        salary_history: [
            {date: "2025-01-01", salary: 27000, reason: "Initial hire"}
        ],
        schedule: {
            monday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            tuesday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            wednesday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            thursday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            friday: {start: "08:30", end: "17:00", break_mins: 30, net_hours: 8},
            saturday: "off",
            sunday: "off"
        },
        expected_monthly_hours: 192
    },
    {
        id: 2,
        name: "Raju",
        role: "Carpenter",
        salary_monthly: 26000,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "98765-43211",
        salary_history: [
            {date: "2025-01-01", salary: 26000, reason: "Initial hire"}
        ],
        schedule: {
            monday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            tuesday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            wednesday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            thursday: {start: "08:30", end: "19:00", break_mins: 30, net_hours: 10},
            friday: {start: "08:30", end: "17:00", break_mins: 30, net_hours: 8},
            saturday: "off",
            sunday: "off"
        },
        expected_monthly_hours: 192
    },
    {
        id: 3,
        name: "Afghan",
        role: "Polisher",
        salary_monthly: 10000,
        hire_date: "2025-11-03",
        status: "Active",
        phone: "98765-43212",
        salary_history: [
            {date: "2025-11-03", salary: 10000, reason: "Initial hire"}
        ],
        schedule: {
            monday: {start: "09:15", end: "19:45", break_mins: 30, net_hours: 10},
            tuesday: {start: "09:15", end: "19:45", break_mins: 30, net_hours: 10},
            wednesday: {start: "09:15", end: "19:45", break_mins: 30, net_hours: 10},
            thursday: {start: "09:15", end: "19:45", break_mins: 30, net_hours: 10},
            friday: {start: "09:15", end: "19:15", break_mins: 60, net_hours: 9},
            saturday: "off",
            sunday: "off"
        },
        expected_monthly_hours: 195
    },
    {
        id: 4,
        name: "Priysha",
        role: "Admin/Owner",
        salary_monthly: 0,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "",
        salary_history: [
            {date: "2025-01-01", salary: 0, reason: "Owner"}
        ]
    },
    {
        id: 5,
        name: "You",
        role: "Admin/Owner",
        salary_monthly: 0,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "",
        salary_history: [
            {date: "2025-01-01", salary: 0, reason: "Owner"}
        ]
    }
];

let attendanceLog = [
    {
        id: 1,
        date: "2025-11-03",
        employee_id: 3,
        employee_name: "Afghan",
        role: "Polisher",
        start_time: "09:15",
        end_time: "19:45",
        break_mins: 30,
        net_hours: 10,
        expected_hours: 10,
        status: "Present",
        overtime_hours: 0,
        notes: "First day"
    },
    {
        id: 2,
        date: "2025-11-04",
        employee_id: 1,
        employee_name: "Dharmendra",
        role: "Carpenter",
        start_time: "08:30",
        end_time: "19:00",
        break_mins: 30,
        net_hours: 10,
        expected_hours: 10,
        status: "Present",
        overtime_hours: 0,
        notes: ""
    },
    {
        id: 3,
        date: "2025-11-04",
        employee_id: 2,
        employee_name: "Raju",
        role: "Carpenter",
        start_time: "08:30",
        end_time: "19:00",
        break_mins: 30,
        net_hours: 10,
        expected_hours: 10,
        status: "Present",
        overtime_hours: 0,
        notes: ""
    },
    {
        id: 4,
        date: "2025-11-05",
        employee_id: 1,
        employee_name: "Dharmendra",
        role: "Carpenter",
        start_time: "08:30",
        end_time: "19:00",
        break_mins: 30,
        net_hours: 10,
        expected_hours: 10,
        status: "Present",
        overtime_hours: 0,
        notes: ""
    },
    {
        id: 5,
        date: "2025-11-06",
        employee_id: 2,
        employee_name: "Raju",
        role: "Carpenter",
        start_time: "08:30",
        end_time: "19:00",
        break_mins: 30,
        net_hours: 0,
        expected_hours: 10,
        status: "Absent",
        overtime_hours: 0,
        notes: "Leave"
    }
];

let dailyLaborers = [];
let advances = [];
let currentEmployee = null;
let selectedMonth = "2025-11";
let nextAttendanceId = 6;
let nextLaborId = 1;
let nextEmployeeId = 6;
let nextAdvanceId = 1;
let deleteTargetId = null;
let removeEmployeeId = null;
let deleteAdvanceId = null;
let currentUser = "You"; // Can be changed to "Priysha"
let firebaseInitialized = false;
let firebaseDB = null;
let firebaseConfig = null;
// In-memory storage for Firebase config (persists for session)
const sessionStore = {
    firebaseConfig: null
};

// Helper Functions
function getDayName(dateStr) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
}

function calculateTimeDiff(start, end) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return (endMinutes - startMinutes) / 60;
}

function getExpectedHours(employee, dateStr) {
    if (!employee.schedule) return 0;
    const dayName = getDayName(dateStr);
    const daySchedule = employee.schedule[dayName];
    if (!daySchedule || daySchedule === 'off') return 0;
    return daySchedule.net_hours || 0;
}

function getBreakMinutes(employee, dateStr) {
    if (!employee.schedule) return 30;
    const dayName = getDayName(dateStr);
    const daySchedule = employee.schedule[dayName];
    if (!daySchedule || daySchedule === 'off') return 30;
    return daySchedule.break_mins || 30;
}

function filterAttendanceByMonth(month) {
    return attendanceLog.filter(entry => entry.date.startsWith(month));
}

function filterLaborByMonth(month) {
    return dailyLaborers.filter(entry => entry.date.startsWith(month));
}

function calculateEmployeeStats(employee, month) {
    const monthAttendance = filterAttendanceByMonth(month).filter(entry => entry.employee_id === employee.id);
    
    let actualHours = 0;
    let overtimeHours = 0;
    let absenceHours = 0;
    let presentDays = 0;
    let absentDays = 0;
    
    monthAttendance.forEach(entry => {
        if (entry.status === 'Present' || entry.status === 'Half-day') {
            actualHours += entry.net_hours;
            presentDays++;
            if (entry.net_hours > entry.expected_hours) {
                overtimeHours += (entry.net_hours - entry.expected_hours);
            }
        } else if (entry.status === 'Absent' || entry.status === 'Leave') {
            absenceHours += entry.expected_hours;
            absentDays++;
        }
    });
    
    const expectedHours = employee.expected_monthly_hours || 0;
    const hourlyRate = expectedHours > 0 ? employee.salary_monthly / expectedHours : 0;
    const deductions = absenceHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    
    // Calculate advance deduction for pending/partial advances
    const advanceDeduction = calculateAdvanceDeduction(employee.id, month);
    
    const finalPay = employee.salary_monthly - deductions + overtimePay - advanceDeduction;
    
    return {
        actualHours,
        overtimeHours,
        absenceHours,
        presentDays,
        absentDays,
        expectedHours,
        deductions,
        overtimePay,
        advanceDeduction,
        finalPay
    };
}

function calculateAdvanceDeduction(employeeId, month) {
    const pendingAdvances = advances.filter(adv => 
        adv.employee_id === employeeId && 
        (adv.status === 'Pending' || adv.status === 'Partial')
    );
    
    return pendingAdvances.reduce((sum, adv) => {
        const remaining = adv.amount - (adv.amount_deducted || 0);
        return sum + remaining;
    }, 0);
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Tab Navigation
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        if (tabName === 'dashboard') {
            renderDashboard();
        } else if (tabName === 'employees') {
            renderEmployeeSelect();
        } else if (tabName === 'employee-management') {
            renderEmployeeManagement();
        } else if (tabName === 'daily-labor') {
            renderDailyLabor();
        } else if (tabName === 'advances') {
            renderAdvances();
        } else if (tabName === 'summary') {
            renderSummary();
        } else if (tabName === 'export') {
            populateExportFilters();
        }
    });
});

// Month Selector
document.getElementById('monthYear').addEventListener('change', (e) => {
    selectedMonth = e.target.value;
    renderDashboard();
    if (currentEmployee) {
        renderEmployeeDetail(currentEmployee);
    }
    renderDailyLabor();
    renderSummary();
});

// Dashboard Rendering
function renderDashboard() {
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    const monthAttendance = filterAttendanceByMonth(selectedMonth);
    const monthLabor = filterLaborByMonth(selectedMonth);
    
    let totalPayroll = 0;
    let totalHours = 0;
    let totalPresent = 0;
    let totalExpected = 0;
    
    salariedEmployees.forEach(emp => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        totalPayroll += stats.finalPay;
        totalHours += stats.actualHours;
        totalPresent += stats.presentDays;
        totalExpected += monthAttendance.filter(e => e.employee_id === emp.id).length;
    });
    
    const laborCost = monthLabor.reduce((sum, labor) => sum + labor.total_pay, 0);
    totalPayroll += laborCost;
    
    const attendanceRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;
    
    document.getElementById('totalPayroll').textContent = formatCurrency(totalPayroll);
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    document.getElementById('totalHours').textContent = Math.round(totalHours);
    document.getElementById('activeEmployees').textContent = salariedEmployees.length;
    
    renderEmployeeCards();
}

function renderEmployeeCards() {
    const container = document.getElementById('employeeCards');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    
    container.innerHTML = salariedEmployees.map(emp => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        return `
            <div class="employee-card" onclick="selectEmployee(${emp.id})">
                <div class="employee-header">
                    <div>
                        <div class="employee-name">${emp.name}</div>
                        <div class="employee-role">${emp.role}</div>
                    </div>
                </div>
                <div class="employee-stats">
                    <div class="stat-row">
                        <span class="stat-row-label">Expected Hours:</span>
                        <span class="stat-row-value">${stats.expectedHours} hrs</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label">Actual Hours:</span>
                        <span class="stat-row-value">${Math.round(stats.actualHours)} hrs</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label">Overtime:</span>
                        <span class="stat-row-value">${Math.round(stats.overtimeHours)} hrs</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label">Base Salary:</span>
                        <span class="stat-row-value">${formatCurrency(emp.salary_monthly)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label"><strong>Final Pay:</strong></span>
                        <span class="stat-row-value"><strong>${formatCurrency(stats.finalPay)}</strong></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Employee Selection
function renderEmployeeSelect() {
    const container = document.getElementById('employeeSelectCards');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    
    container.innerHTML = salariedEmployees.map(emp => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        return `
            <div class="employee-card" onclick="selectEmployee(${emp.id})">
                <div class="employee-header">
                    <div>
                        <div class="employee-name">${emp.name}</div>
                        <div class="employee-role">${emp.role}</div>
                    </div>
                </div>
                <div class="employee-stats">
                    <div class="stat-row">
                        <span class="stat-row-label">Present Days:</span>
                        <span class="stat-row-value">${stats.presentDays}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label">Absent Days:</span>
                        <span class="stat-row-value">${stats.absentDays}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-row-label">Total Hours:</span>
                        <span class="stat-row-value">${Math.round(stats.actualHours)} hrs</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
        currentEmployee = employee;
        showEmployeeDetail();
    }
}

function showEmployeeDetail() {
    document.getElementById('employeesList').style.display = 'none';
    document.getElementById('employeeDetail').style.display = 'block';
    renderEmployeeDetail(currentEmployee);
}

function showEmployeesList() {
    document.getElementById('employeesList').style.display = 'block';
    document.getElementById('employeeDetail').style.display = 'none';
    currentEmployee = null;
}

function renderEmployeeDetail(employee) {
    const stats = calculateEmployeeStats(employee, selectedMonth);
    
    // Header
    const headerHTML = `
        <div class="employee-header">
            <div>
                <div class="employee-name">${employee.name}</div>
                <div class="employee-role">${employee.role} • Base Salary: ${formatCurrency(employee.salary_monthly)}</div>
            </div>
        </div>
        <div class="schedule-info">
            ${Object.entries(employee.schedule || {}).map(([day, schedule]) => {
                if (schedule === 'off') {
                    return `<div class="schedule-day"><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> Off</div>`;
                } else {
                    return `<div class="schedule-day"><strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${schedule.start} - ${schedule.end} (${schedule.net_hours}h)</div>`;
                }
            }).join('')}
        </div>
    `;
    document.getElementById('employeeDetailHeader').innerHTML = headerHTML;
    
    // Calendar
    renderEmployeeCalendar(employee);
    
    // Attendance Records
    renderAttendanceRecords(employee);
    
    // Payroll Summary
    const payrollHTML = `
        <h3>Monthly Payroll Breakdown</h3>
        <div class="payroll-row">
            <span>Base Salary</span>
            <span>${formatCurrency(employee.salary_monthly)}</span>
        </div>
        <div class="payroll-row">
            <span>Expected Hours</span>
            <span>${stats.expectedHours} hrs</span>
        </div>
        <div class="payroll-row">
            <span>Actual Hours Worked</span>
            <span>${Math.round(stats.actualHours)} hrs</span>
        </div>
        <div class="payroll-row">
            <span>Absence Hours</span>
            <span>${Math.round(stats.absenceHours)} hrs</span>
        </div>
        <div class="payroll-row">
            <span>Overtime Hours</span>
            <span>${Math.round(stats.overtimeHours)} hrs</span>
        </div>
        <div class="payroll-row">
            <span>Absence Deductions</span>
            <span>-${formatCurrency(stats.deductions)}</span>
        </div>
        <div class="payroll-row">
            <span>Overtime Pay (1.5x)</span>
            <span>+${formatCurrency(stats.overtimePay)}</span>
        </div>
        <div class="payroll-row">
            <span><strong>Final Pay</strong></span>
            <span><strong>${formatCurrency(stats.finalPay)}</strong></span>
        </div>
    `;
    document.getElementById('employeePayrollSummary').innerHTML = payrollHTML;
}

function renderEmployeeCalendar(employee) {
    const container = document.getElementById('employeeCalendar');
    const [year, month] = selectedMonth.split('-');
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let calendarHTML = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    
    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
        const dayName = getDayName(dateStr);
        const attendance = attendanceLog.find(a => a.date === dateStr && a.employee_id === employee.id);
        
        let className = 'calendar-day default';
        if (employee.schedule && employee.schedule[dayName] === 'off') {
            className = 'calendar-day weekend';
        } else if (attendance) {
            if (attendance.status === 'Present') {
                className = attendance.overtime_hours > 0 ? 'calendar-day overtime' : 'calendar-day present';
            } else if (attendance.status === 'Absent') {
                className = 'calendar-day absent';
            } else if (attendance.status === 'Leave' || attendance.status === 'Half-day') {
                className = 'calendar-day leave';
            }
        }
        
        calendarHTML += `<div class="${className}">${day}</div>`;
    }
    
    container.innerHTML = calendarHTML;
}

function renderAttendanceRecords(employee) {
    const container = document.getElementById('attendanceRecords');
    const records = filterAttendanceByMonth(selectedMonth)
        .filter(entry => entry.employee_id === employee.id)
        .sort((a, b) => b.date.localeCompare(a.date));
    
    if (records.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-secondary);">No attendance records for this month.</p>';
        return;
    }
    
    container.innerHTML = records.map(record => {
        const modifiedBadge = record.last_modified ? `<span class="modified-badge">Modified ${record.last_modified.split(' ')[0]}</span>` : '';
        return `
        <div class="attendance-item">
            <div class="attendance-date">${formatDate(record.date)}</div>
            <div class="attendance-details">
                <div class="attendance-time">${record.start_time} - ${record.end_time} • ${record.net_hours} hrs (Expected: ${record.expected_hours} hrs)${modifiedBadge}</div>
                ${record.notes ? `<div class="attendance-time">Notes: ${record.notes}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-12);">
                <div class="status-dropdown">
                    <span class="status-badge status-${record.status.toLowerCase()} status-editable" onclick="toggleStatusMenu(event, ${record.id})">
                        ${record.status}
                        <span style="font-size: 10px;">▼</span>
                    </span>
                </div>
                <div class="action-icons">
                    <button class="icon-btn edit" onclick="openEditModal(${record.id})" title="Edit entry">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn delete" onclick="openDeleteModal(${record.id})" title="Delete entry">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Attendance Modal
function openAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    modal.classList.add('active');
    
    // Populate employee dropdown
    const employeeSelect = document.getElementById('entryEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
    
    // Set current employee if viewing detail
    if (currentEmployee) {
        employeeSelect.value = currentEmployee.id;
        updateComputedValues();
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').value = today;
}

function closeAttendanceModal() {
    const modal = document.getElementById('attendanceModal');
    modal.classList.remove('active');
    document.getElementById('attendanceForm').reset();
}

function updateComputedValues() {
    const employeeId = parseInt(document.getElementById('entryEmployee').value);
    const dateStr = document.getElementById('entryDate').value;
    const startTime = document.getElementById('entryStartTime').value;
    const endTime = document.getElementById('entryEndTime').value;
    const status = document.getElementById('entryStatus').value;
    
    if (!employeeId || !dateStr) return;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const breakMins = getBreakMinutes(employee, dateStr);
    const expectedHours = getExpectedHours(employee, dateStr);
    
    document.getElementById('computedBreak').textContent = breakMins + ' mins';
    document.getElementById('computedExpectedHours').textContent = expectedHours + ' hrs';
    
    if (startTime && endTime && status !== 'Absent') {
        const totalHours = calculateTimeDiff(startTime, endTime);
        const netHours = Math.max(0, totalHours - (breakMins / 60));
        document.getElementById('computedNetHours').textContent = netHours.toFixed(1) + ' hrs';
    } else {
        document.getElementById('computedNetHours').textContent = '0 hrs';
    }
}

// Event listeners for computed values
document.getElementById('entryEmployee').addEventListener('change', updateComputedValues);
document.getElementById('entryDate').addEventListener('change', updateComputedValues);
document.getElementById('entryStartTime').addEventListener('change', updateComputedValues);
document.getElementById('entryEndTime').addEventListener('change', updateComputedValues);
document.getElementById('entryStatus').addEventListener('change', updateComputedValues);

// Attendance Form Submit
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('entryEmployee').value);
    const dateStr = document.getElementById('entryDate').value;
    const startTime = document.getElementById('entryStartTime').value;
    const endTime = document.getElementById('entryEndTime').value;
    const status = document.getElementById('entryStatus').value;
    const notes = document.getElementById('entryNotes').value;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const breakMins = getBreakMinutes(employee, dateStr);
    const expectedHours = getExpectedHours(employee, dateStr);
    
    let netHours = 0;
    if (status !== 'Absent' && status !== 'Leave') {
        const totalHours = calculateTimeDiff(startTime, endTime);
        netHours = Math.max(0, totalHours - (breakMins / 60));
    }
    
    const overtimeHours = Math.max(0, netHours - expectedHours);
    
    // Check if entry exists for this date and employee
    const existingIndex = attendanceLog.findIndex(a => a.date === dateStr && a.employee_id === employeeId);
    
    const entry = {
        id: existingIndex >= 0 ? attendanceLog[existingIndex].id : nextAttendanceId++,
        date: dateStr,
        employee_id: employeeId,
        employee_name: employee.name,
        role: employee.role,
        start_time: startTime,
        end_time: endTime,
        break_mins: breakMins,
        net_hours: parseFloat(netHours.toFixed(2)),
        expected_hours: expectedHours,
        status: status,
        overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        notes: notes,
        created_by: currentUser,
        created_date: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        attendanceLog[existingIndex] = entry;
    } else {
        attendanceLog.push(entry);
    }
    
    await syncDataToFirebase();
    closeAttendanceModal();
    showToast(`Attendance entry saved for ${employee.name} on ${formatDate(dateStr)}`, 'success');
    
    // Refresh current view
    if (currentEmployee) {
        renderEmployeeDetail(currentEmployee);
    }
    renderDashboard();
});

// Daily Labor
function renderDailyLabor() {
    const monthLabor = filterLaborByMonth(selectedMonth);
    const totalCost = monthLabor.reduce((sum, labor) => sum + labor.total_pay, 0);
    
    document.getElementById('totalLaborCost').textContent = formatCurrency(totalCost);
    
    const tbody = document.getElementById('dailyLaborTableBody');
    if (monthLabor.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-secondary);">No daily labor records for this month.</td></tr>';
        return;
    }
    
    tbody.innerHTML = monthLabor.map(labor => `
        <tr>
            <td>${formatDate(labor.date)}</td>
            <td>${labor.name}</td>
            <td>${formatCurrency(labor.wage)}</td>
            <td>${labor.hours} hrs</td>
            <td><strong>${formatCurrency(labor.total_pay)}</strong></td>
            <td>${labor.notes || '-'}</td>
        </tr>
    `).join('');
}

// Set default date for daily labor form
const laborDateInput = document.getElementById('laborDate');
if (laborDateInput) {
    laborDateInput.value = new Date().toISOString().split('T')[0];
}

// Daily Labor Form Submit - FIXED
document.getElementById('dailyLaborForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const date = document.getElementById('laborDate').value.trim();
    const name = document.getElementById('laborName').value.trim();
    const wage = parseFloat(document.getElementById('laborWage').value);
    const hours = parseFloat(document.getElementById('laborHours').value);
    const notes = document.getElementById('laborNotes').value.trim();
    
    // Validation
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }
    
    if (!name || name.length === 0) {
        showToast('Please enter laborer name', 'error');
        return;
    }
    
    if (!wage || wage <= 0) {
        showToast('Please enter a valid wage amount', 'error');
        return;
    }
    
    if (!hours || hours <= 0) {
        showToast('Please enter valid hours worked', 'error');
        return;
    }
    
    const totalPay = (wage / 8) * hours; // Pro-rated based on 8-hour day
    
    const entry = {
        id: nextLaborId++,
        date: date,
        name: name,
        wage: wage,
        hours: hours,
        total_pay: totalPay,
        notes: notes,
        created_date: new Date().toISOString(),
        created_by: currentUser
    };
    
    dailyLaborers.push(entry);
    
    // Sync to Firebase BEFORE clearing form
    await syncDataToFirebase();
    
    // Show success message
    showToast(`Daily labor entry added: ${name} on ${formatDate(date)}, ${formatCurrency(totalPay)}`, 'success');
    
    // Clear form AFTER successful save
    setTimeout(() => {
        document.getElementById('dailyLaborForm').reset();
        document.getElementById('laborDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('laborWage').value = '750';
        document.getElementById('laborHours').value = '8';
    }, 1000);
    
    renderDailyLabor();
});

// Summary
function renderSummary() {
    const tbody = document.getElementById('summaryTableBody');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    
    const rows = salariedEmployees.map(emp => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        return `
            <tr>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.role}</td>
                <td>${stats.expectedHours} hrs</td>
                <td>${Math.round(stats.actualHours)} hrs</td>
                <td>${formatCurrency(emp.salary_monthly)}</td>
                <td>${formatCurrency(stats.deductions)}</td>
                <td>${formatCurrency(stats.overtimePay)}</td>
                <td><strong>${formatCurrency(stats.finalPay)}</strong></td>
            </tr>
        `;
    });
    
    // Add daily labor summary
    const monthLabor = filterLaborByMonth(selectedMonth);
    const laborCost = monthLabor.reduce((sum, labor) => sum + labor.total_pay, 0);
    const laborHours = monthLabor.reduce((sum, labor) => sum + labor.hours, 0);
    
    if (monthLabor.length > 0) {
        rows.push(`
            <tr style="background: var(--color-bg-2);">
                <td><strong>Daily Laborers</strong></td>
                <td>Various</td>
                <td>-</td>
                <td>${Math.round(laborHours)} hrs</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><strong>${formatCurrency(laborCost)}</strong></td>
            </tr>
        `);
    }
    
    // Add total row
    const totalPayroll = salariedEmployees.reduce((sum, emp) => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        return sum + stats.finalPay;
    }, 0) + laborCost;
    
    rows.push(`
        <tr style="background: var(--color-bg-3); font-weight: bold;">
            <td colspan="8" style="text-align: right;"><strong>TOTAL PAYROLL</strong></td>
            <td><strong>${formatCurrency(totalPayroll)}</strong></td>
        </tr>
    `);
    
    tbody.innerHTML = rows.join('');
}

// Advances Functions
function renderAdvances() {
    // Update stats
    const pendingAdvances = advances.filter(adv => adv.status === 'Pending' || adv.status === 'Partial');
    const totalPending = pendingAdvances.reduce((sum, adv) => sum + (adv.amount - (adv.amount_deducted || 0)), 0);
    const uniqueEmployees = new Set(pendingAdvances.map(adv => adv.employee_id)).size;
    
    // Calculate oldest pending
    let oldestDays = 0;
    if (pendingAdvances.length > 0) {
        const today = new Date();
        const oldest = pendingAdvances.reduce((oldest, adv) => {
            const advDate = new Date(adv.date_given);
            return advDate < oldest ? advDate : oldest;
        }, new Date());
        oldestDays = Math.floor((today - oldest) / (1000 * 60 * 60 * 24));
    }
    
    // Calculate settled this month
    const [year, month] = selectedMonth.split('-');
    const settledThisMonth = advances.filter(adv => {
        if (adv.status !== 'Settled' || !adv.settled_date) return false;
        return adv.settled_date.startsWith(selectedMonth);
    });
    const totalSettled = settledThisMonth.reduce((sum, adv) => sum + adv.amount, 0);
    
    document.getElementById('totalPendingAdvances').textContent = formatCurrency(totalPending);
    document.getElementById('employeesWithAdvances').textContent = uniqueEmployees;
    document.getElementById('oldestAdvance').textContent = oldestDays > 0 ? oldestDays + ' days' : '-';
    document.getElementById('settledThisMonth').textContent = formatCurrency(totalSettled);
    
    // Populate filter dropdowns
    const employeeFilter = document.getElementById('advanceFilterEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    employeeFilter.innerHTML = '<option value="">All Employees</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
    
    // Filter advances
    const filterEmployeeId = employeeFilter.value;
    const filterStatus = document.getElementById('advanceFilterStatus').value;
    
    let filteredAdvances = [...advances];
    if (filterEmployeeId) {
        filteredAdvances = filteredAdvances.filter(adv => adv.employee_id === parseInt(filterEmployeeId));
    }
    if (filterStatus) {
        filteredAdvances = filteredAdvances.filter(adv => adv.status === filterStatus);
    }
    
    // Sort by date descending
    filteredAdvances.sort((a, b) => b.date_given.localeCompare(a.date_given));
    
    const tbody = document.getElementById('advancesTableBody');
    
    if (filteredAdvances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--color-text-secondary);">No advances found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredAdvances.map(adv => {
        const employee = employees.find(e => e.id === adv.employee_id);
        const employeeName = employee ? employee.name : 'Unknown';
        const deducted = adv.amount_deducted || 0;
        const balance = adv.amount - deducted;
        const today = new Date();
        const givenDate = new Date(adv.date_given);
        const daysPending = Math.floor((today - givenDate) / (1000 * 60 * 60 * 24));
        
        let statusClass = 'status-badge';
        if (adv.status === 'Pending') statusClass = 'status-badge' + ' ' + 'status-leave';
        if (adv.status === 'Partial') statusClass = 'status-badge' + ' ' + 'status-overtime';
        if (adv.status === 'Settled') statusClass = 'status-badge' + ' ' + 'status-present';
        
        return `
            <tr style="${adv.status === 'Settled' ? 'opacity: 0.7;' : ''}">
                <td>${formatDate(adv.date_given)}</td>
                <td><strong>${employeeName}</strong></td>
                <td>${formatCurrency(adv.amount)}</td>
                <td>${adv.reason || '-'}</td>
                <td><span class="${statusClass}">${adv.status}</span></td>
                <td>${formatCurrency(deducted)}</td>
                <td><strong>${formatCurrency(balance)}</strong></td>
                <td>${adv.status === 'Settled' ? '-' : daysPending + ' days'}</td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="openEditAdvanceModal(${adv.id})" title="Edit advance">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        ${adv.status !== 'Settled' ? `
                        <button class="icon-btn" style="color: var(--color-success);" onclick="markAdvanceSettled(${adv.id})" title="Mark as settled">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        ` : ''}
                        <button class="icon-btn delete" onclick="openDeleteAdvanceModal(${adv.id})" title="Delete advance">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddAdvanceModal() {
    const modal = document.getElementById('addAdvanceModal');
    const employeeSelect = document.getElementById('advanceEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    
    employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
    
    document.getElementById('advanceDate').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
}

function closeAddAdvanceModal() {
    document.getElementById('addAdvanceModal').classList.remove('active');
    document.getElementById('addAdvanceForm').reset();
}

document.getElementById('addAdvanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('advanceEmployee').value);
    const amount = parseFloat(document.getElementById('advanceAmount').value);
    const dateGiven = document.getElementById('advanceDate').value;
    const reason = document.getElementById('advanceReason').value;
    const notes = document.getElementById('advanceNotes').value;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const advance = {
        id: nextAdvanceId++,
        employee_id: employeeId,
        employee_name: employee.name,
        amount: amount,
        date_given: dateGiven,
        reason: reason,
        status: 'Pending',
        amount_deducted: 0,
        notes: notes,
        created_date: new Date().toISOString(),
        created_by: currentUser
    };
    
    advances.push(advance);
    await syncDataToFirebase();
    closeAddAdvanceModal();
    showToast(`Advance of ${formatCurrency(amount)} recorded for ${employee.name} on ${formatDate(dateGiven)}`, 'success');
    renderAdvances();
});

function openEditAdvanceModal(advanceId) {
    const advance = advances.find(adv => adv.id === advanceId);
    if (!advance) return;
    
    const modal = document.getElementById('editAdvanceModal');
    const employeeSelect = document.getElementById('editAdvanceEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    
    employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
    
    document.getElementById('editAdvanceId').value = advance.id;
    document.getElementById('editAdvanceEmployee').value = advance.employee_id;
    document.getElementById('editAdvanceAmount').value = advance.amount;
    document.getElementById('editAdvanceDate').value = advance.date_given;
    document.getElementById('editAdvanceReason').value = advance.reason || 'Personal';
    document.getElementById('editAdvanceStatus').value = advance.status;
    document.getElementById('editAdvanceDeducted').value = advance.amount_deducted || 0;
    document.getElementById('editAdvanceNotes').value = advance.notes || '';
    
    modal.classList.add('active');
}

function closeEditAdvanceModal() {
    document.getElementById('editAdvanceModal').classList.remove('active');
    document.getElementById('editAdvanceForm').reset();
}

document.getElementById('editAdvanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const advanceId = parseInt(document.getElementById('editAdvanceId').value);
    const advIndex = advances.findIndex(adv => adv.id === advanceId);
    if (advIndex === -1) return;
    
    const employeeId = parseInt(document.getElementById('editAdvanceEmployee').value);
    const amount = parseFloat(document.getElementById('editAdvanceAmount').value);
    const dateGiven = document.getElementById('editAdvanceDate').value;
    const reason = document.getElementById('editAdvanceReason').value;
    const status = document.getElementById('editAdvanceStatus').value;
    const deducted = parseFloat(document.getElementById('editAdvanceDeducted').value) || 0;
    const notes = document.getElementById('editAdvanceNotes').value;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    advances[advIndex] = {
        ...advances[advIndex],
        employee_id: employeeId,
        employee_name: employee.name,
        amount: amount,
        date_given: dateGiven,
        reason: reason,
        status: status,
        amount_deducted: deducted,
        notes: notes,
        settled_date: status === 'Settled' ? new Date().toISOString().split('T')[0] : null
    };
    
    await syncDataToFirebase();
    closeEditAdvanceModal();
    showToast('Advance updated successfully', 'success');
    renderAdvances();
});

async function markAdvanceSettled(advanceId) {
    if (!confirm('Mark this advance as fully settled?')) return;
    
    const advIndex = advances.findIndex(adv => adv.id === advanceId);
    if (advIndex === -1) return;
    
    advances[advIndex].status = 'Settled';
    advances[advIndex].amount_deducted = advances[advIndex].amount;
    advances[advIndex].settled_date = new Date().toISOString().split('T')[0];
    
    await syncDataToFirebase();
    showToast('Advance marked as settled', 'success');
    renderAdvances();
}

function openDeleteAdvanceModal(advanceId) {
    const advance = advances.find(adv => adv.id === advanceId);
    if (!advance) return;
    
    deleteAdvanceId = advanceId;
    
    const modal = document.getElementById('deleteAdvanceModal');
    const message = document.getElementById('deleteAdvanceMessage');
    
    message.textContent = `Are you sure you want to delete the advance of ${formatCurrency(advance.amount)} for ${advance.employee_name} given on ${formatDate(advance.date_given)}?`;
    
    modal.classList.add('active');
}

function closeDeleteAdvanceModal() {
    document.getElementById('deleteAdvanceModal').classList.remove('active');
    deleteAdvanceId = null;
}

async function confirmDeleteAdvance() {
    if (deleteAdvanceId === null) return;
    
    const advIndex = advances.findIndex(adv => adv.id === deleteAdvanceId);
    if (advIndex === -1) return;
    
    const advance = advances[advIndex];
    advances.splice(advIndex, 1);
    
    await syncDataToFirebase();
    closeDeleteAdvanceModal();
    showToast(`Advance deleted for ${advance.employee_name}`, 'success');
    renderAdvances();
}

// Edit Modal Functions
function openEditModal(entryId) {
    const entry = attendanceLog.find(e => e.id === entryId);
    if (!entry) return;
    
    const modal = document.getElementById('editAttendanceModal');
    modal.classList.add('active');
    
    // Populate form
    document.getElementById('editEntryId').value = entry.id;
    document.getElementById('editEntryDate').value = entry.date;
    document.getElementById('editEntryStartTime').value = entry.start_time;
    document.getElementById('editEntryEndTime').value = entry.end_time;
    document.getElementById('editEntryStatus').value = entry.status;
    document.getElementById('editEntryNotes').value = entry.notes || '';
    
    // Populate employee dropdown
    const employeeSelect = document.getElementById('editEntryEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    employeeSelect.innerHTML = '<option value="">Select Employee</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
    employeeSelect.value = entry.employee_id;
    
    updateEditComputedValues();
}

function closeEditModal() {
    const modal = document.getElementById('editAttendanceModal');
    modal.classList.remove('active');
    document.getElementById('editAttendanceForm').reset();
}

function updateEditComputedValues() {
    const employeeId = parseInt(document.getElementById('editEntryEmployee').value);
    const dateStr = document.getElementById('editEntryDate').value;
    const startTime = document.getElementById('editEntryStartTime').value;
    const endTime = document.getElementById('editEntryEndTime').value;
    const status = document.getElementById('editEntryStatus').value;
    
    if (!employeeId || !dateStr) return;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const breakMins = getBreakMinutes(employee, dateStr);
    const expectedHours = getExpectedHours(employee, dateStr);
    
    document.getElementById('editComputedBreak').textContent = breakMins + ' mins';
    document.getElementById('editComputedExpectedHours').textContent = expectedHours + ' hrs';
    
    if (startTime && endTime && status !== 'Absent' && status !== 'Leave') {
        const totalHours = calculateTimeDiff(startTime, endTime);
        const netHours = Math.max(0, totalHours - (breakMins / 60));
        document.getElementById('editComputedNetHours').textContent = netHours.toFixed(1) + ' hrs';
    } else {
        document.getElementById('editComputedNetHours').textContent = '0 hrs';
    }
}

// Event listeners for edit form
document.getElementById('editEntryEmployee').addEventListener('change', updateEditComputedValues);
document.getElementById('editEntryDate').addEventListener('change', updateEditComputedValues);
document.getElementById('editEntryStartTime').addEventListener('change', updateEditComputedValues);
document.getElementById('editEntryEndTime').addEventListener('change', updateEditComputedValues);
document.getElementById('editEntryStatus').addEventListener('change', updateEditComputedValues);

// Edit Form Submit
document.getElementById('editAttendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const entryId = parseInt(document.getElementById('editEntryId').value);
    const employeeId = parseInt(document.getElementById('editEntryEmployee').value);
    const dateStr = document.getElementById('editEntryDate').value;
    const startTime = document.getElementById('editEntryStartTime').value;
    const endTime = document.getElementById('editEntryEndTime').value;
    const status = document.getElementById('editEntryStatus').value;
    const notes = document.getElementById('editEntryNotes').value;
    
    const entryIndex = attendanceLog.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return;
    
    const oldEntry = {...attendanceLog[entryIndex]};
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const breakMins = getBreakMinutes(employee, dateStr);
    const expectedHours = getExpectedHours(employee, dateStr);
    
    let netHours = 0;
    if (status !== 'Absent' && status !== 'Leave') {
        const totalHours = calculateTimeDiff(startTime, endTime);
        netHours = Math.max(0, totalHours - (breakMins / 60));
    }
    
    const overtimeHours = Math.max(0, netHours - expectedHours);
    
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);
    
    attendanceLog[entryIndex] = {
        ...attendanceLog[entryIndex],
        date: dateStr,
        employee_id: employeeId,
        employee_name: employee.name,
        role: employee.role,
        start_time: startTime,
        end_time: endTime,
        break_mins: breakMins,
        net_hours: parseFloat(netHours.toFixed(2)),
        expected_hours: expectedHours,
        status: status,
        overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        notes: notes,
        last_modified: timestamp,
        modified_by: currentUser
    };
    
    await syncDataToFirebase();
    closeEditModal();
    
    // Build change summary
    let changes = [];
    if (oldEntry.start_time !== startTime) changes.push(`Start Time: ${oldEntry.start_time} → ${startTime}`);
    if (oldEntry.end_time !== endTime) changes.push(`End Time: ${oldEntry.end_time} → ${endTime}`);
    if (oldEntry.status !== status) changes.push(`Status: ${oldEntry.status} → ${status}`);
    if (oldEntry.net_hours !== netHours) changes.push(`Net Hours: ${oldEntry.net_hours} → ${netHours.toFixed(1)}`);
    
    const changeText = changes.length > 0 ? ' • ' + changes.join(', ') : '';
    showToast(`Updated entry for ${employee.name} on ${formatDate(dateStr)}${changeText}`, 'success');
    
    // Refresh current view
    if (currentEmployee) {
        renderEmployeeDetail(currentEmployee);
    }
    renderDashboard();
});

// Delete Modal Functions
function openDeleteModal(entryId) {
    const entry = attendanceLog.find(e => e.id === entryId);
    if (!entry) return;
    
    deleteTargetId = entryId;
    
    const modal = document.getElementById('deleteConfirmModal');
    const message = document.getElementById('deleteConfirmMessage');
    
    message.textContent = `Are you sure you want to delete the attendance entry for ${entry.employee_name} on ${formatDate(entry.date)} (${entry.net_hours} hours worked, ${entry.status})?`;
    
    modal.classList.add('active');
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.classList.remove('active');
    deleteTargetId = null;
}

async function confirmDelete() {
    if (deleteTargetId === null) return;
    
    const entryIndex = attendanceLog.findIndex(e => e.id === deleteTargetId);
    if (entryIndex === -1) return;
    
    const entry = attendanceLog[entryIndex];
    const employeeName = entry.employee_name;
    const date = entry.date;
    
    // Remove entry
    attendanceLog.splice(entryIndex, 1);
    
    await syncDataToFirebase();
    closeDeleteModal();
    showToast(`Entry deleted for ${employeeName} on ${formatDate(date)}`, 'success');
    
    // Refresh current view
    if (currentEmployee) {
        renderEmployeeDetail(currentEmployee);
    }
    renderDashboard();
}

// Inline Status Edit Functions
let activeStatusMenu = null;

function toggleStatusMenu(event, entryId) {
    event.stopPropagation();
    
    // Close any existing menu
    if (activeStatusMenu) {
        activeStatusMenu.remove();
        activeStatusMenu = null;
    }
    
    const entry = attendanceLog.find(e => e.id === entryId);
    if (!entry) return;
    
    const statusOptions = ['Present', 'Absent', 'Leave', 'Half-day'];
    
    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.innerHTML = statusOptions.map(status => 
        `<div class="status-option" onclick="changeStatus(${entryId}, '${status}')">${status}</div>`
    ).join('');
    
    const target = event.currentTarget.parentElement;
    target.appendChild(menu);
    activeStatusMenu = menu;
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeStatusMenu);
    }, 0);
}

function closeStatusMenu() {
    if (activeStatusMenu) {
        activeStatusMenu.remove();
        activeStatusMenu = null;
    }
    document.removeEventListener('click', closeStatusMenu);
}

async function changeStatus(entryId, newStatus) {
    const entryIndex = attendanceLog.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return;
    
    const entry = attendanceLog[entryIndex];
    const oldStatus = entry.status;
    
    if (oldStatus === newStatus) {
        closeStatusMenu();
        return;
    }
    
    // Recalculate net hours based on status
    let netHours = entry.net_hours;
    if (newStatus === 'Absent' || newStatus === 'Leave') {
        netHours = 0;
    } else if (oldStatus === 'Absent' || oldStatus === 'Leave') {
        // Restore hours from time calculation
        const employee = employees.find(e => e.id === entry.employee_id);
        if (employee) {
            const totalHours = calculateTimeDiff(entry.start_time, entry.end_time);
            netHours = Math.max(0, totalHours - (entry.break_mins / 60));
        }
    }
    
    const overtimeHours = Math.max(0, netHours - entry.expected_hours);
    
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);
    
    attendanceLog[entryIndex] = {
        ...entry,
        status: newStatus,
        net_hours: parseFloat(netHours.toFixed(2)),
        overtime_hours: parseFloat(overtimeHours.toFixed(2)),
        last_modified: timestamp,
        modified_by: currentUser
    };
    
    await syncDataToFirebase();
    closeStatusMenu();
    showToast(`Changed status for ${entry.employee_name} on ${formatDate(entry.date)}: ${oldStatus} → ${newStatus}`, 'success');
    
    // Refresh current view
    if (currentEmployee) {
        renderEmployeeDetail(currentEmployee);
    }
    renderDashboard();
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--color-success)' : 'var(--color-error)';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Employee Management Functions
function renderEmployeeManagement() {
    const activeEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Active');
    const inactiveEmployees = employees.filter(e => e.salary_monthly > 0 && e.status === 'Inactive');
    const totalPayroll = activeEmployees.reduce((sum, emp) => sum + emp.salary_monthly, 0);
    const avgSalary = activeEmployees.length > 0 ? totalPayroll / activeEmployees.length : 0;
    
    document.getElementById('mgmtActiveEmployees').textContent = activeEmployees.length;
    document.getElementById('mgmtTotalPayroll').textContent = formatCurrency(totalPayroll);
    document.getElementById('mgmtInactiveEmployees').textContent = inactiveEmployees.length;
    document.getElementById('mgmtAvgSalary').textContent = formatCurrency(avgSalary);
    
    const tbody = document.getElementById('employeeManagementTableBody');
    const allEmployees = employees.filter(e => e.salary_monthly > 0);
    
    if (allEmployees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-secondary);">No employees found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = allEmployees.map(emp => {
        const statusClass = emp.status === 'Active' ? 'status-present' : 'status-badge';
        const statusStyle = emp.status === 'Inactive' ? 'background: var(--color-secondary); color: var(--color-text-secondary);' : '';
        return `
            <tr style="${emp.status === 'Inactive' ? 'opacity: 0.6;' : ''}">
                <td><strong>${emp.name}</strong></td>
                <td>${emp.role}</td>
                <td>${formatCurrency(emp.salary_monthly)}</td>
                <td>${formatDate(emp.hire_date)}</td>
                <td><span class="${statusClass}" style="${statusStyle}">${emp.status}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="openEditSalaryModal(${emp.id})" title="Edit salary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" style="color: var(--color-info);" onclick="openSalaryHistoryModal(${emp.id})" title="Salary history">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </button>
                        ${emp.status === 'Active' ? `
                        <button class="icon-btn delete" onclick="openRemoveEmployeeModal(${emp.id})" title="Deactivate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        ` : `
                        <button class="icon-btn" style="color: var(--color-success);" onclick="restoreEmployee(${emp.id})" title="Restore">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                        </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Edit Salary Modal
function openEditSalaryModal(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const modal = document.getElementById('editSalaryModal');
    document.getElementById('salaryEmployeeId').value = employee.id;
    document.getElementById('salaryEmployeeName').textContent = employee.name + ' (' + employee.role + ')';
    document.getElementById('salaryCurrentAmount').textContent = formatCurrency(employee.salary_monthly);
    document.getElementById('salaryNewAmount').value = employee.salary_monthly;
    document.getElementById('salaryEffectiveDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('salaryReason').value = '';
    
    modal.classList.add('active');
}

function closeEditSalaryModal() {
    document.getElementById('editSalaryModal').classList.remove('active');
    document.getElementById('editSalaryForm').reset();
}

document.getElementById('editSalaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = parseInt(document.getElementById('salaryEmployeeId').value);
    const newSalary = parseFloat(document.getElementById('salaryNewAmount').value);
    const effectiveDate = document.getElementById('salaryEffectiveDate').value;
    const reason = document.getElementById('salaryReason').value || 'Salary update';
    
    const empIndex = employees.findIndex(e => e.id === employeeId);
    if (empIndex === -1) return;
    
    const employee = employees[empIndex];
    const oldSalary = employee.salary_monthly;
    
    if (newSalary === oldSalary) {
        showToast('New salary is same as current salary', 'error');
        return;
    }
    
    // Update salary
    employees[empIndex].salary_monthly = newSalary;
    
    // Add to salary history
    if (!employees[empIndex].salary_history) {
        employees[empIndex].salary_history = [];
    }
    employees[empIndex].salary_history.push({
        date: effectiveDate,
        salary: newSalary,
        previous_salary: oldSalary,
        reason: reason
    });
    
    // Recalculate expected monthly hours based on schedule
    const schedule = employee.schedule;
    if (schedule) {
        let totalHours = 0;
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            if (schedule[day] && schedule[day] !== 'off') {
                totalHours += schedule[day].net_hours || 0;
            }
        });
        const weeksInMonth = 4;
        employees[empIndex].expected_monthly_hours = totalHours * weeksInMonth;
    }
    
    await syncDataToFirebase();
    closeEditSalaryModal();
    
    const changeType = newSalary > oldSalary ? 'increased' : 'decreased';
    showToast(`Salary ${changeType} for ${employee.name}: ${formatCurrency(oldSalary)} → ${formatCurrency(newSalary)}, effective ${formatDate(effectiveDate)}`, 'success');
    
    renderEmployeeManagement();
    renderDashboard();
    if (currentEmployee && currentEmployee.id === employeeId) {
        currentEmployee = employees[empIndex];
        renderEmployeeDetail(currentEmployee);
    }
});

// Salary History Modal
function openSalaryHistoryModal(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const modal = document.getElementById('salaryHistoryModal');
    const content = document.getElementById('salaryHistoryContent');
    
    const history = employee.salary_history || [];
    
    if (history.length === 0) {
        content.innerHTML = '<p style="color: var(--color-text-secondary);">No salary history available.</p>';
    } else {
        const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
        content.innerHTML = `
            <h3 style="margin-bottom: var(--space-16);">${employee.name} - ${employee.role}</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Previous Salary</th>
                            <th>New Salary</th>
                            <th>Change</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedHistory.map((item, index) => {
                            const prevSalary = item.previous_salary || (index < sortedHistory.length - 1 ? sortedHistory[index + 1].salary : 0);
                            const change = item.previous_salary ? item.salary - item.previous_salary : 0;
                            const changeText = change > 0 ? `+${formatCurrency(change)}` : change < 0 ? formatCurrency(change) : '-';
                            const changeColor = change > 0 ? 'var(--color-success)' : change < 0 ? 'var(--color-error)' : 'var(--color-text-secondary)';
                            return `
                                <tr>
                                    <td>${formatDate(item.date)}</td>
                                    <td>${prevSalary > 0 ? formatCurrency(prevSalary) : '-'}</td>
                                    <td><strong>${formatCurrency(item.salary)}</strong></td>
                                    <td style="color: ${changeColor}; font-weight: var(--font-weight-medium);">${changeText}</td>
                                    <td>${item.reason || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeSalaryHistoryModal() {
    document.getElementById('salaryHistoryModal').classList.remove('active');
}

// Add Employee Modal
function openAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    document.getElementById('newEmpHireDate').value = new Date().toISOString().split('T')[0];
    renderScheduleInputs();
    modal.classList.add('active');
}

function closeAddEmployeeModal() {
    document.getElementById('addEmployeeModal').classList.remove('active');
    document.getElementById('addEmployeeForm').reset();
}

function renderScheduleInputs() {
    const container = document.getElementById('scheduleInputs');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    container.innerHTML = days.map((day, index) => {
        const isWeekend = index >= 5;
        return `
            <div style="background: var(--color-bg-1); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-12);">
                <div style="display: flex; align-items: center; gap: var(--space-12); margin-bottom: var(--space-12);">
                    <input type="checkbox" id="day${day}Working" ${!isWeekend ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;" onchange="toggleDaySchedule('${day}')">
                    <label for="day${day}Working" style="font-weight: var(--font-weight-medium); cursor: pointer;">${day}</label>
                </div>
                <div id="day${day}Schedule" style="display: ${!isWeekend ? 'grid' : 'none'}; grid-template-columns: repeat(4, 1fr); gap: var(--space-12);">
                    <div>
                        <label class="form-label" style="font-size: var(--font-size-xs);">Start</label>
                        <input type="time" id="day${day}Start" class="form-control" value="08:30" style="font-size: var(--font-size-sm); padding: var(--space-6) var(--space-8);">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: var(--font-size-xs);">End</label>
                        <input type="time" id="day${day}End" class="form-control" value="${index === 4 ? '17:00' : '19:00'}" style="font-size: var(--font-size-sm); padding: var(--space-6) var(--space-8);">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: var(--font-size-xs);">Break (min)</label>
                        <input type="number" id="day${day}Break" class="form-control" value="30" min="0" style="font-size: var(--font-size-sm); padding: var(--space-6) var(--space-8);">
                    </div>
                    <div>
                        <label class="form-label" style="font-size: var(--font-size-xs);">Net Hours</label>
                        <input type="number" id="day${day}Hours" class="form-control" value="${index === 4 ? '8' : '10'}" min="0" step="0.5" style="font-size: var(--font-size-sm); padding: var(--space-6) var(--space-8);">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleDaySchedule(day) {
    const checkbox = document.getElementById(`day${day}Working`);
    const schedule = document.getElementById(`day${day}Schedule`);
    schedule.style.display = checkbox.checked ? 'grid' : 'none';
}

document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('newEmpName').value.trim();
    const role = document.getElementById('newEmpRole').value;
    const salary = parseFloat(document.getElementById('newEmpSalary').value);
    const hireDate = document.getElementById('newEmpHireDate').value;
    const phone = document.getElementById('newEmpPhone').value.trim();
    
    if (!name || !role) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Build schedule
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};
    let totalWeeklyHours = 0;
    
    days.forEach((day, index) => {
        const dayName = dayNames[index];
        const working = document.getElementById(`day${dayName}Working`).checked;
        
        if (working) {
            const start = document.getElementById(`day${dayName}Start`).value;
            const end = document.getElementById(`day${dayName}End`).value;
            const breakMins = parseInt(document.getElementById(`day${dayName}Break`).value);
            const netHours = parseFloat(document.getElementById(`day${dayName}Hours`).value);
            
            schedule[day] = {
                start: start,
                end: end,
                break_mins: breakMins,
                net_hours: netHours
            };
            totalWeeklyHours += netHours;
        } else {
            schedule[day] = 'off';
        }
    });
    
    const newEmployee = {
        id: nextEmployeeId++,
        name: name,
        role: role,
        salary_monthly: salary,
        hire_date: hireDate,
        status: 'Active',
        phone: phone,
        schedule: schedule,
        expected_monthly_hours: totalWeeklyHours * 4,
        salary_history: [
            {date: hireDate, salary: salary, reason: 'Initial hire'}
        ]
    };
    
    employees.push(newEmployee);
    
    await syncDataToFirebase();
    closeAddEmployeeModal();
    showToast(`Employee ${name} added successfully as ${role}`, 'success');
    
    renderEmployeeManagement();
    renderDashboard();
});

// Remove Employee Modal
function openRemoveEmployeeModal(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    removeEmployeeId = employeeId;
    
    const modal = document.getElementById('removeEmployeeModal');
    const message = document.getElementById('removeEmployeeMessage');
    
    message.textContent = `Are you sure you want to deactivate ${employee.name} (${employee.role})?`;
    
    modal.classList.add('active');
}

function closeRemoveEmployeeModal() {
    document.getElementById('removeEmployeeModal').classList.remove('active');
    removeEmployeeId = null;
}

async function confirmRemoveEmployee() {
    if (removeEmployeeId === null) return;
    
    const empIndex = employees.findIndex(e => e.id === removeEmployeeId);
    if (empIndex === -1) return;
    
    const employee = employees[empIndex];
    employees[empIndex].status = 'Inactive';
    
    await syncDataToFirebase();
    closeRemoveEmployeeModal();
    showToast(`Employee ${employee.name} has been deactivated`, 'success');
    
    renderEmployeeManagement();
    renderDashboard();
    
    if (currentEmployee && currentEmployee.id === removeEmployeeId) {
        showEmployeesList();
    }
}

async function restoreEmployee(employeeId) {
    const empIndex = employees.findIndex(e => e.id === employeeId);
    if (empIndex === -1) return;
    
    const employee = employees[empIndex];
    employees[empIndex].status = 'Active';
    
    await syncDataToFirebase();
    showToast(`Employee ${employee.name} has been restored`, 'success');
    
    renderEmployeeManagement();
    renderDashboard();
}

// Firebase Integration
function initializeFirebase() {
    const savedConfig = getFirebaseConfigFromMemory();
    if (!savedConfig) {
        renderDashboard();
        setTimeout(() => {
            showFirebaseSetupModal();
        }, 500);
        return;
    }
    
    try {
        if (typeof firebase !== 'undefined') {
            // Check if already initialized
            if (!firebaseInitialized) {
                const app = firebase.initializeApp(savedConfig);
                firebaseDB = firebase.database();
                firebaseConfig = savedConfig;
                firebaseInitialized = true;
                loadDataFromFirebase();
            }
        } else {
            console.warn('Firebase SDK not loaded');
            renderDashboard();
            setTimeout(() => {
                showFirebaseSetupModal();
            }, 500);
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        
        // Check if error is due to already initialized app
        if (error.code === 'app/duplicate-app') {
            try {
                firebaseDB = firebase.database();
                firebaseConfig = savedConfig;
                firebaseInitialized = true;
                loadDataFromFirebase();
                return;
            } catch (retryError) {
                console.error('Firebase retry error:', retryError);
            }
        }
        
        showToast('Firebase connection failed. Please check credentials.', 'error');
        renderDashboard();
        setTimeout(() => {
            showFirebaseSetupModal();
        }, 1000);
    }
}

function getFirebaseConfigFromMemory() {
    // Return from memory or session store
    if (firebaseConfig) {
        return firebaseConfig;
    }
    
    if (sessionStore.firebaseConfig) {
        firebaseConfig = sessionStore.firebaseConfig;
        return sessionStore.firebaseConfig;
    }
    
    return null;
}

function saveFirebaseConfigToMemory(config) {
    // Save to both memory and session store
    firebaseConfig = config;
    sessionStore.firebaseConfig = config;
}

function clearFirebaseConfig() {
    firebaseConfig = null;
    sessionStore.firebaseConfig = null;
}

function showFirebaseSetupModal() {
    document.getElementById('firebaseSetupModal').classList.add('active');
}

function closeFirebaseSetupModal() {
    document.getElementById('firebaseSetupModal').classList.remove('active');
}

document.getElementById('firebaseConfigForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const apiKey = document.getElementById('firebaseApiKey').value.trim();
    const authDomain = document.getElementById('firebaseAuthDomain').value.trim();
    const databaseURL = document.getElementById('firebaseDbUrl').value.trim();
    const projectId = document.getElementById('firebaseProjectId').value.trim();
    
    if (!apiKey || !authDomain || !databaseURL || !projectId) {
        showToast('Please fill in all Firebase configuration fields', 'error');
        return;
    }
    
    const config = {
        apiKey: apiKey,
        authDomain: authDomain,
        databaseURL: databaseURL,
        projectId: projectId
    };
    
    // Save config to localStorage
    saveFirebaseConfigToMemory(config);
    
    // Close modal
    closeFirebaseSetupModal();
    
    // Show success message
    showToast('Firebase credentials saved successfully!', 'success');
    
    // Initialize Firebase with new config
    initializeFirebase();
});

function loadDataFromFirebase() {
    if (!firebaseInitialized) return;
    
    showToast('Loading data from Firebase...', 'success');
    
    const dbRef = firebaseDB.ref('furniture-payroll-tracker');
    
    // Set up real-time listeners for live updates
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.employees) employees = data.employees;
            if (data.attendanceLog) attendanceLog = data.attendanceLog;
            if (data.dailyLaborers) dailyLaborers = data.dailyLaborers;
            if (data.advances) advances = data.advances;
            
            nextEmployeeId = Math.max(...employees.map(e => e.id), 5) + 1;
            nextAttendanceId = Math.max(...attendanceLog.map(a => a.id), 5) + 1;
            nextLaborId = dailyLaborers.length > 0 ? Math.max(...dailyLaborers.map(l => l.id), 0) + 1 : 1;
            nextAdvanceId = advances.length > 0 ? Math.max(...advances.map(a => a.id), 0) + 1 : 1;
            
            // Refresh all views
            renderDashboard();
            if (currentEmployee) {
                renderEmployeeDetail(currentEmployee);
            }
            
            // Check which tab is active and refresh it
            const activeTab = document.querySelector('.tab.active');
            if (activeTab) {
                const tabName = activeTab.dataset.tab;
                if (tabName === 'employee-management') {
                    renderEmployeeManagement();
                } else if (tabName === 'daily-labor') {
                    renderDailyLabor();
                } else if (tabName === 'advances') {
                    renderAdvances();
                } else if (tabName === 'summary') {
                    renderSummary();
                }
            }
            
            console.log('Data loaded and real-time listener established');
        } else {
            // No data exists, sync initial data
            syncDataToFirebase();
            showToast('Firebase connected. Initial data synced.', 'success');
        }
    }, (error) => {
        console.error('Firebase load error:', error);
        showToast('Failed to load data from Firebase: ' + error.message, 'error');
    });
}

async function syncDataToFirebase() {
    if (!firebaseInitialized) {
        console.warn('Firebase not initialized, skipping sync');
        return;
    }
    
    try {
        await firebaseDB.ref('furniture-payroll-tracker').set({
            employees: employees,
            attendanceLog: attendanceLog,
            dailyLaborers: dailyLaborers,
            advances: advances,
            lastUpdated: new Date().toISOString()
        });
        console.log('Data synced to Firebase successfully');
    } catch (error) {
        console.error('Firebase sync error:', error);
        showToast('Failed to sync data to Firebase', 'error');
    }
}

// Export Functions
function downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function exportAttendanceCSV(employeeId, status, dateFrom, dateTo) {
    let data = [...attendanceLog];
    
    if (employeeId) {
        data = data.filter(a => a.employee_id === parseInt(employeeId));
    }
    if (status) {
        data = data.filter(a => a.status === status);
    }
    if (dateFrom) {
        data = data.filter(a => a.date >= dateFrom);
    }
    if (dateTo) {
        data = data.filter(a => a.date <= dateTo);
    }
    
    const headers = ['Date', 'Employee', 'Role', 'Start Time', 'End Time', 'Net Hours', 'Expected Hours', 'Status', 'Notes', 'Last Modified'];
    const rows = data.map(entry => [
        entry.date,
        entry.employee_name,
        entry.role,
        entry.start_time,
        entry.end_time,
        entry.net_hours,
        entry.expected_hours,
        entry.status,
        entry.notes || '',
        entry.last_modified || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filename = `attendance_log_${selectedMonth}.csv`;
    downloadCSV(csv, filename);
    showToast(`Downloaded: ${filename}`, 'success');
}

function exportPayrollSummaryCSV() {
    const headers = ['Month', 'Employee', 'Total Hours', 'Expected Hours', 'Absence Hours', 'Base Salary', 'Deduction', 'Overtime Pay', 'Final Pay'];
    const rows = employees.filter(e => e.salary_monthly > 0).map(emp => {
        const stats = calculateEmployeeStats(emp, selectedMonth);
        return [
            selectedMonth,
            emp.name,
            Math.round(stats.actualHours),
            stats.expectedHours,
            Math.round(stats.absenceHours),
            emp.salary_monthly,
            Math.round(stats.deductions),
            Math.round(stats.overtimePay),
            Math.round(stats.finalPay)
        ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filename = `payroll_summary_${selectedMonth}.csv`;
    downloadCSV(csv, filename);
    showToast(`Downloaded: ${filename}`, 'success');
}

function exportEmployeeMasterCSV() {
    const headers = ['Name', 'Role', 'Current Salary', 'Hire Date', 'Status', 'Phone', 'Expected Monthly Hours'];
    const rows = employees.filter(e => e.salary_monthly > 0).map(emp => [
        emp.name,
        emp.role,
        emp.salary_monthly,
        emp.hire_date,
        emp.status,
        emp.phone || '',
        emp.expected_monthly_hours || 0
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filename = 'employees_master.csv';
    downloadCSV(csv, filename);
    showToast(`Downloaded: ${filename}`, 'success');
}

function exportSalaryHistoryCSV() {
    const headers = ['Employee', 'Date of Change', 'Previous Salary', 'New Salary', 'Reason', 'Change Amount'];
    const rows = [];
    
    employees.filter(e => e.salary_monthly > 0).forEach(emp => {
        if (emp.salary_history && emp.salary_history.length > 0) {
            emp.salary_history.forEach(item => {
                rows.push([
                    emp.name,
                    item.date,
                    item.previous_salary || 0,
                    item.salary,
                    item.reason || '',
                    item.previous_salary ? (item.salary - item.previous_salary) : 0
                ]);
            });
        }
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filename = 'salary_history.csv';
    downloadCSV(csv, filename);
    showToast(`Downloaded: ${filename}`, 'success');
}

function exportDailyLaborCSV() {
    const monthLabor = filterLaborByMonth(selectedMonth);
    const headers = ['Date', 'Laborer Name', 'Daily Wage', 'Hours Worked', 'Total Paid', 'Notes'];
    const rows = monthLabor.map(labor => [
        labor.date,
        labor.name,
        labor.wage,
        labor.hours,
        labor.total_pay,
        labor.notes || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filename = `daily_labor_${selectedMonth}.csv`;
    downloadCSV(csv, filename);
    showToast(`Downloaded: ${filename}`, 'success');
}

function exportFullBackup() {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backup = {
        employees: employees,
        attendanceLog: attendanceLog,
        dailyLaborers: dailyLaborers,
        advances: advances,
        metadata: {
            exportDate: new Date().toISOString(),
            selectedMonth: selectedMonth,
            version: '1.0'
        }
    };
    
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `furniture_payroll_backup_${timestamp}.json`;
    link.click();
    showToast('Full backup downloaded successfully', 'success');
}

async function importBackup() {
    const fileInput = document.getElementById('restoreBackupFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a backup file', 'error');
        return;
    }
    
    if (!confirm('This will overwrite all current data. Are you sure you want to continue?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (backup.employees) employees = backup.employees;
            if (backup.attendanceLog) attendanceLog = backup.attendanceLog;
            if (backup.dailyLaborers) dailyLaborers = backup.dailyLaborers;
            if (backup.advances) advances = backup.advances;
            
            nextEmployeeId = Math.max(...employees.map(e => e.id), 5) + 1;
            nextAttendanceId = Math.max(...attendanceLog.map(a => a.id), 5) + 1;
            nextLaborId = dailyLaborers.length > 0 ? Math.max(...dailyLaborers.map(l => l.id), 0) + 1 : 1;
            nextAdvanceId = advances.length > 0 ? Math.max(...advances.map(a => a.id), 0) + 1 : 1;
            
            await syncDataToFirebase();
            renderDashboard();
            showToast('Data restored successfully from backup', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showToast('Invalid backup file or corrupted data', 'error');
        }
    };
    reader.readAsText(file);
}

// Export Tab Event Listeners
document.getElementById('exportAttendanceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const employeeId = document.getElementById('exportAttendanceEmployee').value;
    const status = document.getElementById('exportAttendanceStatus').value;
    const dateFrom = document.getElementById('exportAttendanceFrom').value;
    const dateTo = document.getElementById('exportAttendanceTo').value;
    exportAttendanceCSV(employeeId, status, dateFrom, dateTo);
});

document.getElementById('downloadPayrollCSV').addEventListener('click', exportPayrollSummaryCSV);
document.getElementById('downloadEmployeeMasterCSV').addEventListener('click', exportEmployeeMasterCSV);
document.getElementById('downloadSalaryHistoryCSV').addEventListener('click', exportSalaryHistoryCSV);
document.getElementById('downloadDailyLaborCSV').addEventListener('click', exportDailyLaborCSV);
document.getElementById('downloadFullBackup').addEventListener('click', exportFullBackup);
document.getElementById('restoreBackupBtn').addEventListener('click', importBackup);

// Populate export filters
function populateExportFilters() {
    const employeeSelect = document.getElementById('exportAttendanceEmployee');
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    employeeSelect.innerHTML = '<option value="">All Employees</option>' +
        salariedEmployees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
    
    // Set date range to current month
    const [year, month] = selectedMonth.split('-');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    document.getElementById('exportAttendanceFrom').value = firstDay;
    document.getElementById('exportAttendanceTo').value = lastDay;
}

// Load sample advance data
advances = [
    {
        id: 1,
        employee_id: 2,
        employee_name: "Raju",
        amount: 3000,
        date_given: "2025-11-06",
        reason: "Personal",
        status: "Pending",
        amount_deducted: 0,
        notes: "Personal advance requested",
        created_date: "2025-11-06T14:30:00",
        created_by: "You"
    }
];
nextAdvanceId = 2;

// Reset Firebase Credentials Function
function resetFirebaseCredentials() {
    if (!confirm('This will clear your saved Firebase credentials and you will need to re-enter them. Continue?')) {
        return;
    }
    
    clearFirebaseConfig();
    firebaseInitialized = false;
    firebaseDB = null;
    
    showToast('Firebase credentials cleared. Please re-enter your configuration.', 'success');
    
    setTimeout(() => {
        showFirebaseSetupModal();
    }, 500);
}

// Initial render
initializeFirebase();
renderDashboard();