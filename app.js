// Database
const employees = [
    {
        id: 1,
        name: "Dharmendra",
        role: "Carpenter",
        salary_monthly: 27000,
        hire_date: "2025-01-01",
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
        hire_date: "2025-01-01"
    },
    {
        id: 5,
        name: "You",
        role: "Admin/Owner",
        salary_monthly: 0,
        hire_date: "2025-01-01"
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
let currentEmployee = null;
let selectedMonth = "2025-11";
let nextAttendanceId = 6;
let nextLaborId = 1;
let deleteTargetId = null;
let currentUser = "You"; // Can be changed to "Priysha"

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
    const finalPay = employee.salary_monthly - deductions + overtimePay;
    
    return {
        actualHours,
        overtimeHours,
        absenceHours,
        presentDays,
        absentDays,
        expectedHours,
        deductions,
        overtimePay,
        finalPay
    };
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
        } else if (tabName === 'daily-labor') {
            renderDailyLabor();
        } else if (tabName === 'summary') {
            renderSummary();
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
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    
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
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
    
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
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
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
document.getElementById('attendanceForm').addEventListener('submit', (e) => {
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
        notes: notes
    };
    
    if (existingIndex >= 0) {
        attendanceLog[existingIndex] = entry;
    } else {
        attendanceLog.push(entry);
    }
    
    closeAttendanceModal();
    
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

// Daily Labor Form Submit
document.getElementById('dailyLaborForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('laborDate').value;
    const name = document.getElementById('laborName').value;
    const wage = parseFloat(document.getElementById('laborWage').value);
    const hours = parseFloat(document.getElementById('laborHours').value);
    const notes = document.getElementById('laborNotes').value;
    
    const totalPay = (wage / 8) * hours; // Pro-rated based on 8-hour day
    
    const entry = {
        id: nextLaborId++,
        date: date,
        name: name,
        wage: wage,
        hours: hours,
        total_pay: totalPay,
        notes: notes
    };
    
    dailyLaborers.push(entry);
    
    document.getElementById('dailyLaborForm').reset();
    document.getElementById('laborDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('laborWage').value = '750';
    document.getElementById('laborHours').value = '8';
    
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
            <td colspan="7" style="text-align: right;"><strong>TOTAL PAYROLL</strong></td>
            <td><strong>${formatCurrency(totalPayroll)}</strong></td>
        </tr>
    `);
    
    tbody.innerHTML = rows.join('');
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
    const salariedEmployees = employees.filter(e => e.salary_monthly > 0);
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
document.getElementById('editAttendanceForm').addEventListener('submit', (e) => {
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

function confirmDelete() {
    if (deleteTargetId === null) return;
    
    const entryIndex = attendanceLog.findIndex(e => e.id === deleteTargetId);
    if (entryIndex === -1) return;
    
    const entry = attendanceLog[entryIndex];
    const employeeName = entry.employee_name;
    const date = entry.date;
    
    // Remove entry
    attendanceLog.splice(entryIndex, 1);
    
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

function changeStatus(entryId, newStatus) {
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

// Initial render
renderDashboard();