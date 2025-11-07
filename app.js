// app.js — Attendance & Payroll Tracker
if (window.__ATTENDANCE_APP_LOADED) {
  console.log('Attendance app already loaded — skipping duplicate initialization.');
} else {
  window.__ATTENDANCE_APP_LOADED = true;

  if (typeof window.firebaseConfig === 'undefined') {
    window.firebaseConfig = {
      apiKey: "AIzaSyAfubcZ88pji8lkh3ESiS_r6SgD1I7sHrk",
      authDomain: "furniture-payroll-tracker.firebaseapp.com",
      projectId: "furniture-payroll-tracker",
      storageBucket: "furniture-payroll-tracker.firebasestorage.app",
      messagingSenderId: "59740955717",
      appId: "1:59740955717:web:42ecf5bdc38fddf3bbaf2c"
    };
  }
  const firebaseConfig = window.firebaseConfig;

  (function () {
    const hasFirebase = firebaseConfig && firebaseConfig.projectId;
    let db = null;
    let dataSeeded = false;

    let employees = [
      {
        id: 1,
        name: "Dharmendra",
        role: "Carpenter",
        salary_monthly: 27000,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "98765-43210",
        salary_history: [{ date: "2025-01-01", salary: 27000, reason: "Initial hire" }],
        schedule: {
          monday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          tuesday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          wednesday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          thursday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          friday: { start: "08:30", end: "17:00", break_mins: 30, net_hours: 8 },
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
        salary_history: [{ date: "2025-01-01", salary: 26000, reason: "Initial hire" }],
        schedule: {
          monday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          tuesday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          wednesday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          thursday: { start: "08:30", end: "19:00", break_mins: 30, net_hours: 10 },
          friday: { start: "08:30", end: "17:00", break_mins: 30, net_hours: 8 },
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
        salary_history: [{ date: "2025-11-03", salary: 10000, reason: "Initial hire" }],
        schedule: {
          monday: { start: "09:15", end: "19:45", break_mins: 30, net_hours: 10 },
          tuesday: { start: "09:15", end: "19:45", break_mins: 30, net_hours: 10 },
          wednesday: { start: "09:15", end: "19:45", break_mins: 30, net_hours: 10 },
          thursday: { start: "09:15", end: "19:45", break_mins: 30, net_hours: 10 },
          friday: { start: "09:15", end: "19:15", break_mins: 60, net_hours: 9 },
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
        salary_history: [{ date: "2025-01-01", salary: 0, reason: "Owner" }]
      },
      {
        id: 5,
        name: "You",
        role: "Admin/Owner",
        salary_monthly: 0,
        hire_date: "2025-01-01",
        status: "Active",
        phone: "",
        salary_history: [{ date: "2025-01-01", salary: 0, reason: "Owner" }]
      }
    ];

    let attendanceLog = [
      { id: 1, date: "2025-11-03", employee_id: 3, employee_name: "Afghan", role: "Polisher", start_time: "09:15", end_time: "19:45", break_mins: 30, net_hours: 10, expected_hours: 10, status: "Present", overtime_hours: 0, notes: "First day" },
      { id: 2, date: "2025-11-04", employee_id: 1, employee_name: "Dharmendra", role: "Carpenter", start_time: "08:30", end_time: "19:00", break_mins: 30, net_hours: 10, expected_hours: 10, status: "Present", overtime_hours: 0, notes: "" },
      { id: 3, date: "2025-11-04", employee_id: 2, employee_name: "Raju", role: "Carpenter", start_time: "08:30", end_time: "19:00", break_mins: 30, net_hours: 10, expected_hours: 10, status: "Present", overtime_hours: 0, notes: "" },
      { id: 4, date: "2025-11-05", employee_id: 1, employee_name: "Dharmendra", role: "Carpenter", start_time: "08:30", end_time: "19:00", break_mins: 30, net_hours: 10, expected_hours: 10, status: "Present", overtime_hours: 0, notes: "" },
      { id: 5, date: "2025-11-06", employee_id: 2, employee_name: "Raju", role: "Carpenter", start_time: "08:30", end_time: "19:00", break_mins: 30, net_hours: 0, expected_hours: 10, status: "Absent", overtime_hours: 0, notes: "Leave" }
    ];

    let dailyLaborers = [];
    let advances = [];
    let nextAttendanceId = 6;
    let nextLaborId = 1;
    let nextEmployeeId = 6;
    let nextAdvanceId = 1;
    let currentEmployee = null;
    let selectedMonth = document.getElementById('monthYear') ? document.getElementById('monthYear').value : (new Date().toISOString().slice(0,7));
    let currentUser = "You";
    let firebaseConnected = false;

    // Preserve initial data for seeding
    const INITIAL_EMPLOYEES = JSON.parse(JSON.stringify(employees));
    const INITIAL_ATTENDANCE = JSON.parse(JSON.stringify(attendanceLog));

    // Utility functions
    function getDayName(dateStr) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const date = new Date(dateStr + 'T00:00:00');
      return days[date.getDay()];
    }

    function calculateTimeDiff(start, end) {
      if (!start || !end) return 0;
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      return (endMinutes - startMinutes) / 60;
    }

    function getExpectedHours(employee, dateStr) {
      if (!employee || !employee.schedule) return 0;
      const dayName = getDayName(dateStr);
      const daySchedule = employee.schedule[dayName];
      if (!daySchedule || daySchedule === 'off') return 0;
      return daySchedule.net_hours || 0;
    }

    function getBreakMinutes(employee, dateStr) {
      if (!employee || !employee.schedule) return 30;
      const dayName = getDayName(dateStr);
      const daySchedule = employee.schedule[dayName];
      if (!daySchedule || daySchedule === 'off') return 30;
      return daySchedule.break_mins || 30;
    }

    function filterAttendanceByMonth(month) {
      return attendanceLog.filter(entry => entry.date && entry.date.startsWith(month));
    }

    function filterLaborByMonth(month) {
      return dailyLaborers.filter(entry => entry.date && entry.date.startsWith(month));
    }

    function formatCurrency(amount) {
      return '₹' + Math.round((amount || 0)).toLocaleString('en-IN');
    }

    function formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function calculateAdvanceDeduction(employeeId) {
      const pendingAdvances = advances.filter(adv => Number(adv.employee_id) === Number(employeeId) && (adv.status === 'Pending' || adv.status === 'Partial'));
      return pendingAdvances.reduce((sum, adv) => {
        const remaining = (adv.amount || 0) - (adv.amount_deducted || 0);
        return sum + remaining;
      }, 0);
    }

    function calculateEmployeeStats(employee, month) {
      const monthAttendance = filterAttendanceByMonth(month).filter(entry => Number(entry.employee_id) === Number(employee.id));
      let actualHours = 0, overtimeHours = 0, absenceHours = 0, presentDays = 0, absentDays = 0;

      monthAttendance.forEach(entry => {
        if (entry.status === 'Present' || entry.status === 'Half-day') {
          actualHours += (entry.net_hours || 0);
          presentDays++;
          if ((entry.net_hours || 0) > (entry.expected_hours || 0)) {
            overtimeHours += ((entry.net_hours || 0) - (entry.expected_hours || 0));
          }
        } else if (entry.status === 'Absent' || entry.status === 'Leave') {
          absenceHours += (entry.expected_hours || 0);
          absentDays++;
        }
      });

      const expectedHours = employee.expected_monthly_hours || 0;
      const hourlyRate = expectedHours > 0 ? (employee.salary_monthly || 0) / expectedHours : 0;
      const deductions = absenceHours * hourlyRate;
      const overtimePay = overtimeHours * hourlyRate * 1.5;
      const advanceDeduction = calculateAdvanceDeduction(employee.id);

      const finalPay = (employee.salary_monthly || 0) - deductions + overtimePay - advanceDeduction;

      return { actualHours, overtimeHours, absenceHours, presentDays, absentDays, expectedHours, deductions, overtimePay, advanceDeduction, finalPay };
    }

    // Renderers
    window.renderDashboard = function () {
      try {
        const salariedEmployees = employees.filter(e => (e.salary_monthly || 0) > 0 && e.status !== 'Inactive');
        const monthAttendance = filterAttendanceByMonth(selectedMonth);
        const monthLabor = filterLaborByMonth(selectedMonth);

        let totalPayroll = 0, totalHours = 0, totalPresent = 0, totalExpected = 0;
        salariedEmployees.forEach(emp => {
          const stats = calculateEmployeeStats(emp, selectedMonth);
          totalPayroll += stats.finalPay;
          totalHours += stats.actualHours;
          totalPresent += stats.presentDays;
          totalExpected += monthAttendance.filter(a => a.employee_id === emp.id).length;
        });

        const laborCost = monthLabor.reduce((sum, labor) => sum + (labor.total_pay || 0), 0);
        totalPayroll += laborCost;

        const attendanceRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

        document.getElementById('totalPayroll').textContent = formatCurrency(totalPayroll);
        document.getElementById('attendanceRate').textContent = attendanceRate + '%';
        document.getElementById('totalHours').textContent = Math.round(totalHours);
        document.getElementById('activeEmployees').textContent = salariedEmployees.length;

        renderEmployeeCards();
      } catch (err) {
        console.error('renderDashboard error', err);
      }
    };

    window.renderEmployeeCards = function () {
      try {
        const container = document.getElementById('employeeCards');
        if (!container) return;
        const salariedEmployees = employees.filter(e => (e.salary_monthly || 0) > 0 && e.status !== 'Inactive');
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
                <div class="stat-row"><span class="stat-row-label">Expected Hours:</span><span class="stat-row-value">${stats.expectedHours} hrs</span></div>
                <div class="stat-row"><span class="stat-row-label">Actual Hours:</span><span class="stat-row-value">${Math.round(stats.actualHours)} hrs</span></div>
                <div class="stat-row"><span class="stat-row-label">Overtime:</span><span class="stat-row-value">${Math.round(stats.overtimeHours)} hrs</span></div>
                <div class="stat-row"><span class="stat-row-label">Base Salary:</span><span class="stat-row-value">${formatCurrency(emp.salary_monthly||0)}</span></div>
                <div class="stat-row"><span class="stat-row-label"><strong>Final Pay:</strong></span><span class="stat-row-value"><strong>${formatCurrency(stats.finalPay)}</strong></span></div>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('renderEmployeeCards error', err);
      }
    };

    window.renderEmployeeSelect = function () {
      try {
        const container = document.getElementById('employeeSelectCards');
        if (!container) return;
        const salariedEmployees = employees.filter(e => (e.salary_monthly || 0) > 0 && e.status !== 'Inactive');
        
        if (salariedEmployees.length === 0) {
          container.innerHTML = '<p style="color:var(--muted);text-align:center">No employees found. Add employees first.</p>';
          return;
        }
        
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
                <div class="stat-row"><span class="stat-row-label">Present Days:</span><span class="stat-row-value">${stats.presentDays}</span></div>
                <div class="stat-row"><span class="stat-row-label">Absent Days:</span><span class="stat-row-value">${stats.absentDays}</span></div>
                <div class="stat-row"><span class="stat-row-label">Total Hours:</span><span class="stat-row-value">${Math.round(stats.actualHours)} hrs</span></div>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('renderEmployeeSelect error', err);
      }
    };

    window.renderDailyLabor = function () {
      try {
        const monthLabor = filterLaborByMonth(selectedMonth);
        const totalCost = monthLabor.reduce((sum, labor) => sum + (labor.total_pay || 0), 0);
        
        const costEl = document.getElementById('totalLaborCost');
        if (costEl) costEl.textContent = formatCurrency(totalCost);

        const tbody = document.getElementById('dailyLaborTableBody');
        if (!tbody) return;

        if (monthLabor.length === 0) {
          tbody.innerHTML = '<p style="color:var(--muted);text-align:center">No daily labor entries for this month.</p>';
          return;
        }

        const tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Daily Wage</th>
                <th>Hours</th>
                <th>Total Pay</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${monthLabor.map(labor => `
                <tr>
                  <td>${formatDate(labor.date)}</td>
                  <td><strong>${labor.name}</strong></td>
                  <td>${formatCurrency(labor.wage)}</td>
                  <td>${labor.hours} hrs</td>
                  <td><strong>${formatCurrency(labor.total_pay)}</strong></td>
                  <td>${labor.notes || '-'}</td>
                  <td>
                    <button class="icon-btn delete" onclick="deleteDailyLabor(${labor.id})" title="Delete">🗑</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        tbody.innerHTML = tableHTML;
      } catch (err) {
        console.error('renderDailyLabor error', err);
      }
    };

    window.deleteDailyLabor = function(laborId) {
      if (!confirm('Delete this daily labor entry?')) return;
      if (hasFirebase && firebaseConnected) {
        deleteDocSafe('dailyLabor', laborId);
      } else {
        dailyLaborers = dailyLaborers.filter(l => Number(l.id) !== Number(laborId));
        renderDailyLabor();
        renderDashboard();
        showToast('Deleted (local)', 'success');
      }
    };

    window.selectEmployee = function (employeeId) {
      const e = employees.find(x => Number(x.id) === Number(employeeId));
      if (!e) return;
      currentEmployee = e;
      showEmployeeDetail();
    };

    window.showEmployeeDetail = function () {
      document.getElementById('employeesList') && (document.getElementById('employeesList').style.display = 'none');
      document.getElementById('employeeDetail') && (document.getElementById('employeeDetail').style.display = 'block');
      renderEmployeeDetail(currentEmployee);
    };

    window.showEmployeesList = function () {
      document.getElementById('employeesList') && (document.getElementById('employeesList').style.display = 'block');
      document.getElementById('employeeDetail') && (document.getElementById('employeeDetail').style.display = 'none');
      currentEmployee = null;
    };

    window.renderEmployeeDetail = function (employee) {
      try {
        if (!employee) return;
        const stats = calculateEmployeeStats(employee, selectedMonth);
        const headerHTML = `
          <div class="employee-header">
            <div>
              <div class="employee-name">${employee.name}</div>
              <div class="employee-role">${employee.role} • Base Salary: ${formatCurrency(employee.salary_monthly||0)}</div>
            </div>
          </div>
          <div class="schedule-info">
            ${Object.entries(employee.schedule || {}).map(([day, schedule]) => {
              if (schedule === 'off') return `<div class="schedule-day"><strong>${day.charAt(0).toUpperCase()+day.slice(1)}:</strong> Off</div>`;
              return `<div class="schedule-day"><strong>${day.charAt(0).toUpperCase()+day.slice(1)}:</strong> ${schedule.start} - ${schedule.end} (${schedule.net_hours}h)</div>`;
            }).join('')}
          </div>
        `;
        const headerEl = document.getElementById('employeeDetailHeader');
        if (headerEl) headerEl.innerHTML = headerHTML;
        renderEmployeeCalendar(employee);
        renderAttendanceRecords(employee);

        const payrollHTML = `
          <h3>Monthly Payroll Breakdown</h3>
          <div class="payroll-row"><span>Base Salary</span><span>${formatCurrency(employee.salary_monthly||0)}</span></div>
          <div class="payroll-row"><span>Expected Hours</span><span>${stats.expectedHours} hrs</span></div>
          <div class="payroll-row"><span>Actual Hours Worked</span><span>${Math.round(stats.actualHours)} hrs</span></div>
          <div class="payroll-row"><span>Absence Hours</span><span>${Math.round(stats.absenceHours)} hrs</span></div>
          <div class="payroll-row"><span>Overtime Hours</span><span>${Math.round(stats.overtimeHours)} hrs</span></div>
          <div class="payroll-row"><span>Absence Deductions</span><span>-${formatCurrency(stats.deductions)}</span></div>
          <div class="payroll-row"><span>Overtime Pay (1.5x)</span><span>+${formatCurrency(stats.overtimePay)}</span></div>
          <div class="payroll-row"><span><strong>Final Pay</strong></span><span><strong>${formatCurrency(stats.finalPay)}</strong></span></div>
        `;
        const payrollEl = document.getElementById('employeePayrollSummary');
        if (payrollEl) payrollEl.innerHTML = payrollHTML;

      } catch (err) {
        console.error('renderEmployeeDetail error', err);
      }
    };

    window.renderEmployeeCalendar = function (employee) {
      try {
        const container = document.getElementById('employeeCalendar');
        if (!container) return;
        const [year, month] = (selectedMonth || (new Date().toISOString().slice(0,7))).split('-');
        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        const lastDay = new Date(parseInt(year), parseInt(month), 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        let calendarHTML = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
        for (let i=0;i<startDayOfWeek;i++) calendarHTML += '<div class="calendar-day empty"></div>';
        for (let day=1; day<=daysInMonth; day++) {
          const dateStr = `${year}-${month}-${String(day).padStart(2,'0')}`;
          const dayName = getDayName(dateStr);
          const attendance = attendanceLog.find(a => a.date === dateStr && Number(a.employee_id) === Number(employee.id));
          let className = 'calendar-day default';
          if (employee.schedule && employee.schedule[dayName] === 'off') className = 'calendar-day weekend';
          else if (attendance) {
            if (attendance.status === 'Present') className = attendance.overtime_hours > 0 ? 'calendar-day overtime' : 'calendar-day present';
            else if (attendance.status === 'Absent') className = 'calendar-day absent';
            else if (attendance.status === 'Leave' || attendance.status === 'Half-day') className = 'calendar-day leave';
          }
          calendarHTML += `<div class="${className}">${day}</div>`;
        }
        container.innerHTML = calendarHTML;
      } catch (err) {
        console.error('renderEmployeeCalendar error', err);
      }
    };

    window.renderAttendanceRecords = function (employee) {
      try {
        const container = document.getElementById('attendanceRecords');
        if (!container) return;
        const records = filterAttendanceByMonth(selectedMonth).filter(entry => Number(entry.employee_id) === Number(employee.id)).sort((a,b) => b.date.localeCompare(a.date));
        if (!records || records.length === 0) { 
          container.innerHTML = '<p style="color:var(--muted)">No attendance records for this month.</p>'; 
          return; 
        }
        container.innerHTML = records.map(record => {
          const modifiedBadge = record.last_modified ? `<span class="modified-badge">Modified ${record.last_modified.split('T')[0]}</span>` : '';
          return `
            <div class="attendance-item">
              <div class="attendance-date">${formatDate(record.date)}</div>
              <div class="attendance-details">
                <div class="attendance-time">${record.start_time || '-'} - ${record.end_time || '-'} • ${record.net_hours || 0} hrs (Expected: ${record.expected_hours || 0} hrs)${modifiedBadge}</div>
                ${record.notes ? `<div class="attendance-time">Notes: ${record.notes}</div>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <div class="status-dropdown">
                  <span class="status-badge status-${(record.status||'').toLowerCase().replace('-','')} status-editable" onclick="toggleStatusMenu(event, ${record.id})">
                    ${record.status || 'Unknown'} <span style="font-size:10px;">▼</span>
                  </span>
                </div>
                <div class="action-icons">
                  <button class="icon-btn edit" onclick="openEditModal(${record.id})" title="Edit entry">✎</button>
                  <button class="icon-btn delete" onclick="openDeleteModal(${record.id})" title="Delete entry">🗑</button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error('renderAttendanceRecords error', err);
      }
    };

    // Attendance modal
    function openAttendanceModal() {
      const modal = document.getElementById('attendanceModal');
      if (modal) modal.classList.add('active');
      const employeeSelect = document.getElementById('entryEmployee');
      if (employeeSelect) {
        employeeSelect.innerHTML = '<option value="">Select Employee</option>' + employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
        if (currentEmployee) employeeSelect.value = currentEmployee.id;
      }
      const today = new Date().toISOString().split('T')[0];
      const entryDate = document.getElementById('entryDate');
      if (entryDate) entryDate.value = today;
      updateComputedValues();
    }
    window.openAttendanceModal = openAttendanceModal;

    function closeAttendanceModal() {
      const modal = document.getElementById('attendanceModal');
      if (modal) modal.classList.remove('active');
      const form = document.getElementById('attendanceForm');
      if (form) form.reset();
    }
    window.closeAttendanceModal = closeAttendanceModal;

    function updateComputedValues() {
      const employeeId = parseInt(document.getElementById('entryEmployee').value || 0);
      const dateStr = document.getElementById('entryDate').value;
      const startTime = document.getElementById('entryStartTime').value;
      const endTime = document.getElementById('entryEndTime').value;
      const status = document.getElementById('entryStatus').value;
      if (!employeeId || !dateStr) return;
      const employee = employees.find(e => Number(e.id) === Number(employeeId));
      if (!employee) return;
      const breakMins = getBreakMinutes(employee, dateStr);
      const expectedHours = getExpectedHours(employee, dateStr);
      const cb = document.getElementById('computedBreak');
      const ce = document.getElementById('computedExpectedHours');
      const cn = document.getElementById('computedNetHours');
      if (cb) cb.textContent = breakMins + ' mins';
      if (ce) ce.textContent = expectedHours + ' hrs';
      if (startTime && endTime && status !== 'Absent') {
        const tot = calculateTimeDiff(startTime, endTime);
        const net = Math.max(0, tot - (breakMins / 60));
        if (cn) cn.textContent = net.toFixed(1) + ' hrs';
      } else {
        if (cn) cn.textContent = '0 hrs';
      }
    }

    (function attachAttendanceFormHandlers() {
      const entryEmployee = document.getElementById('entryEmployee');
      const entryDate = document.getElementById('entryDate');
      const entryStartTime = document.getElementById('entryStartTime');
      const entryEndTime = document.getElementById('entryEndTime');
      const entryStatus = document.getElementById('entryStatus');

      if (entryEmployee) entryEmployee.addEventListener('change', updateComputedValues);
      if (entryDate) entryDate.addEventListener('change', updateComputedValues);
      if (entryStartTime) entryStartTime.addEventListener('change', updateComputedValues);
      if (entryEndTime) entryEndTime.addEventListener('change', updateComputedValues);
      if (entryStatus) entryStatus.addEventListener('change', updateComputedValues);

      const form = document.getElementById('attendanceForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeId = Number(document.getElementById('entryEmployee').value);
        const dateStr = document.getElementById('entryDate').value;
        const startTime = document.getElementById('entryStartTime').value;
        const endTime = document.getElementById('entryEndTime').value;
        const status = document.getElementById('entryStatus').value;
        const notes = document.getElementById('entryNotes').value || '';
        if (!employeeId || !dateStr) { showToast('Select employee and date', 'error'); return; }
        const employee = employees.find(e => Number(e.id) === Number(employeeId));
        if (!employee) { showToast('Employee not found', 'error'); return; }
        const breakMins = getBreakMinutes(employee, dateStr);
        const expectedHours = getExpectedHours(employee, dateStr);
        let netHours = 0;
        if (status !== 'Absent' && status !== 'Leave') {
          const total = calculateTimeDiff(startTime, endTime);
          netHours = Math.max(0, total - (breakMins / 60));
        }
        const overtimeHours = Math.max(0, netHours - expectedHours);
        const existing = attendanceLog.find(a => a.date === dateStr && Number(a.employee_id) === Number(employeeId));
        const id = existing ? existing.id : nextAttendanceId++;
        const entry = {
          id,
          date: dateStr,
          employee_id: Number(employeeId),
          employee_name: employee.name,
          role: employee.role,
          start_time: startTime || '',
          end_time: endTime || '',
          break_mins: breakMins,
          net_hours: parseFloat(netHours.toFixed(2)),
          expected_hours: expectedHours,
          status,
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
          notes,
          last_modified: new Date().toISOString(),
          recorded_by: currentUser
        };

        if (hasFirebase && firebaseConnected) {
          try {
            await db.collection('attendance').doc(String(id)).set(entry);
            showToast('Attendance saved', 'success');
          } catch (err) {
            console.error('Firestore attendance write failed', err);
            showToast('Save failed: ' + (err.message || err), 'error');
          }
        } else {
          const idx = attendanceLog.findIndex(a => a.id === id);
          if (idx >= 0) attendanceLog[idx] = entry; else attendanceLog.push(entry);
          renderDashboard();
          if (currentEmployee) renderEmployeeDetail(currentEmployee);
          showToast('Attendance saved (local)', 'success');
        }
        closeAttendanceModal();
      });
    })();

    // Daily labor form
    (function attachDailyLabHandler() {
      const laborForm = document.getElementById('dailyLaborForm');
      if (!laborForm) return;
      const laborDate = document.getElementById('laborDate');
      if (laborDate) laborDate.value = new Date().toISOString().split('T')[0];
      laborForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('laborDate').value.trim();
        const name = document.getElementById('laborName').value.trim();
        const wage = parseFloat(document.getElementById('laborWage').value);
        const hours = parseFloat(document.getElementById('laborHours').value);
        const notes = document.getElementById('laborNotes').value.trim();
        if (!date || !name || !wage || !hours) { showToast('Please enter valid data', 'error'); return; }
        const totalPay = (wage / 8) * hours;
        const id = nextLaborId++;
        const entry = { id, date, name, wage, hours, total_pay: totalPay, notes, created_date: new Date().toISOString(), created_by: currentUser };
        if (hasFirebase && firebaseConnected) {
          try { 
            await db.collection('dailyLabor').doc(String(id)).set(entry); 
            showToast('Daily labor saved', 'success');
          }
          catch (err) { 
            console.error('dailyLabor write failed', err); 
            showToast('Save failed', 'error'); 
            return; 
          }
        } else {
          dailyLaborers.push(entry);
          renderDailyLabor();
          renderDashboard();
          showToast('Daily labor saved (local)', 'success');
        }
        setTimeout(() => {
          document.getElementById('dailyLaborForm').reset();
          if (laborDate) laborDate.value = new Date().toISOString().split('T')[0];
          document.getElementById('laborWage').value = '750';
          document.getElementById('laborHours').value = '8';
        }, 100);
      });
    })();

    // Advances
    window.renderAdvances = function () {
      try {
        const empFilter = document.getElementById('advanceFilterEmployee');
        if (empFilter) empFilter.innerHTML = '<option value="">All Employees</option>' + employees.filter(e => (e.salary_monthly || 0) > 0).map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');

        const filterEmployeeId = empFilter ? empFilter.value : '';
        const filterStatus = (document.getElementById('advanceFilterStatus') && document.getElementById('advanceFilterStatus').value) || '';
        let filtered = [...advances];
        if (filterEmployeeId) filtered = filtered.filter(a => Number(a.employee_id) === Number(filterEmployeeId));
        if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
        filtered.sort((a,b) => (b.date_given || '').localeCompare(a.date_given || ''));
        
        const tbody = document.getElementById('advancesTableBody');
        if (!tbody) return;
        
        if (filtered.length === 0) { 
          tbody.innerHTML = '<p style="color:var(--muted);text-align:center">No advances found.</p>'; 
          return; 
        }

        const tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Deducted</th>
                <th>Balance</th>
                <th>Days Pending</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(adv => {
                const employee = employees.find(e => Number(e.id) === Number(adv.employee_id));
                const employeeName = employee ? employee.name : 'Unknown';
                const deducted = adv.amount_deducted || 0;
                const balance = (adv.amount || 0) - deducted;
                const daysPending = Math.floor((new Date() - new Date(adv.date_given)) / (1000*60*60*24));
                let statusClass = 'status-badge';
                if (adv.status === 'Pending') statusClass += ' status-leave';
                if (adv.status === 'Partial') statusClass += ' status-overtime';
                if (adv.status === 'Settled') statusClass += ' status-present';
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
                        <button class="icon-btn edit" onclick="openEditAdvanceModal(${adv.id})" title="Edit">✎</button>
                        <button class="icon-btn delete" onclick="openDeleteAdvanceModal(${adv.id})" title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
        tbody.innerHTML = tableHTML;
      } catch (err) {
        console.error('renderAdvances error', err);
      }
    };

    window.openAddAdvanceModal = function () {
      const modal = document.getElementById('addAdvanceModal');
      if (modal) modal.classList.add('active');
      const empSelect = document.getElementById('advanceEmployee');
      if (empSelect) empSelect.innerHTML = '<option value="">Select Employee</option>' + employees.filter(e => (e.salary_monthly || 0) > 0).map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
      const ad = document.getElementById('advanceDate');
      if (ad) ad.value = new Date().toISOString().split('T')[0];
    };

    (function attachAddAdvanceForm() {
      const form = document.getElementById('addAdvanceForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employee_id = Number(document.getElementById('advanceEmployee').value);
        const amount = parseFloat(document.getElementById('advanceAmount').value);
        const reason = document.getElementById('advanceReason').value.trim();
        const date_given = document.getElementById('advanceDate').value || new Date().toISOString().slice(0,10);
        if (!employee_id || !amount) { showToast('Select employee and amount', 'error'); return; }
        const id = nextAdvanceId++;
        const entry = { id, employee_id, amount, amount_deducted: 0, reason, date_given, status: 'Pending', created_by: currentUser };
        if (hasFirebase && firebaseConnected) {
          try { 
            await db.collection('advances').doc(String(id)).set(entry); 
            showToast('Advance saved', 'success');
          }
          catch (err) { 
            console.error('advance write failed', err); 
            showToast('Save failed', 'error'); 
            return; 
          }
        } else {
          advances.push(entry);
          renderAdvances();
          renderDashboard();
          showToast('Advance saved (local)', 'success');
        }
        form.reset();
        document.getElementById('addAdvanceModal') && document.getElementById('addAdvanceModal').classList.remove('active');
      });
    })();

    // Summary
    window.renderSummary = function () {
      try {
        const tbody = document.getElementById('summaryTableBody');
        if (!tbody) return;
        const salariedEmployees = employees.filter(e => (e.salary_monthly || 0) > 0);
        const rows = salariedEmployees.map(emp => {
          const s = calculateEmployeeStats(emp, selectedMonth);
          return `<tr><td><strong>${emp.name}</strong></td><td>${emp.role}</td><td>${s.expectedHours} hrs</td><td>${Math.round(s.actualHours)} hrs</td><td>${formatCurrency(emp.salary_monthly||0)}</td><td>${formatCurrency(s.deductions)}</td><td>${formatCurrency(s.overtimePay)}</td><td><strong>${formatCurrency(s.finalPay)}</strong></td></tr>`;
        });
        const monthLabor = dailyLaborers.filter(l => l.date && l.date.startsWith(selectedMonth));
        const laborCost = monthLabor.reduce((s,l)=>s+(l.total_pay||0),0);
        const laborHours = monthLabor.reduce((s,l)=>s+(l.hours||0),0);
        if (monthLabor.length > 0) rows.push(`<tr style="background:#f5f5f5;"><td><strong>Daily Laborers</strong></td><td>Various</td><td>-</td><td>${Math.round(laborHours)} hrs</td><td>-</td><td>-</td><td>-</td><td><strong>${formatCurrency(laborCost)}</strong></td></tr>`);
        const totalPayroll = employees.filter(e => (e.salary_monthly||0)>0).reduce((s,emp)=>s+calculateEmployeeStats(emp, selectedMonth).finalPay,0) + laborCost;
        rows.push(`<tr style="background:var(--accent);color:#fff;font-weight:bold;"><td colspan="7" style="text-align:right;"><strong>TOTAL PAYROLL</strong></td><td><strong>${formatCurrency(totalPayroll)}</strong></td></tr>`);
        tbody.innerHTML = rows.join('');
      } catch (err) {
        console.error('renderSummary error', err);
      }
    };

    // Export backup
    (function attachDownloadBackup() {
      const btn = document.getElementById('downloadBackupBtn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const snapshot = { employees, attendanceLog, dailyLaborers, advances, generated_at: new Date().toISOString() };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `attendance-backup-${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      });
    })();

    // Toast
    function showToast(msg, type = 'success') {
      const t = document.querySelector('.toast');
      if (!t) return;
      t.textContent = msg;
      t.style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2400);
    }
    window.showToast = showToast;

    // Firestore connect with IMMEDIATE seeding
    async function connectFirestore() {
      if (!hasFirebase) {
        console.warn('No firebaseConfig — running local-only.');
        try { renderDashboard(); renderEmployeeSelect(); renderDailyLabor(); renderSummary(); renderAdvances(); } catch (e) {}
        return;
      }

      try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseConnected = true;

        // CHECK AND SEED IMMEDIATELY before setting up listeners
        const employeesSnapshot = await db.collection('employees').limit(1).get();
        
        if (employeesSnapshot.empty && !dataSeeded) {
          console.log('🔄 Firestore is empty. Seeding now...');
          dataSeeded = true;
          
          const batch = db.batch();
          
          INITIAL_EMPLOYEES.forEach(emp => {
            const docRef = db.collection('employees').doc(String(emp.id));
            batch.set(docRef, emp);
          });
          
          INITIAL_ATTENDANCE.forEach(att => {
            const docRef = db.collection('attendance').doc(String(att.id));
            batch.set(docRef, att);
          });
          
          await batch.commit();
          console.log('✅ Firestore seeded successfully!');
          showToast('Database populated with sample data', 'success');
          
          // Small delay to let Firestore propagate
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // NOW set up realtime listeners AFTER seeding is complete
        db.collection('employees').onSnapshot(snapshot => {
          const docs = [];
          snapshot.forEach(doc => docs.push({ id: (/^\d+$/.test(doc.id) ? Number(doc.id) : doc.id), ...doc.data() }));
          
          // Only update if we have data
          if (docs.length > 0) {
            employees = docs.sort((a,b) => (Number(a.id||0) - Number(b.id||0)));
            nextEmployeeId = (employees.reduce((m,e)=>Math.max(m,Number(e.id||0)),0) || 0) + 1;
            try { renderDashboard(); renderEmployeeSelect(); renderSummary(); } catch(e){}
          }
        });

        db.collection('attendance').onSnapshot(snapshot => {
          const docs = [];
          snapshot.forEach(doc => docs.push({ id: (/^\d+$/.test(doc.id) ? Number(doc.id) : doc.id), ...doc.data() }));
          attendanceLog = docs.sort((a,b) => {
            if (a.date === b.date) return (a.id||0) - (b.id||0);
            return a.date < b.date ? 1 : -1;
          });
          nextAttendanceId = (attendanceLog.reduce((m,a)=>Math.max(m,Number(a.id||0)),0) || 0) + 1;
          try { renderDashboard(); if (currentEmployee) renderEmployeeDetail(currentEmployee); } catch(e){}
        });

        db.collection('dailyLabor').onSnapshot(snapshot => {
          const docs = [];
          snapshot.forEach(doc => docs.push({ id: (/^\d+$/.test(doc.id) ? Number(doc.id) : doc.id), ...doc.data() }));
          dailyLaborers = docs.sort((a,b) => (a.date < b.date ? 1 : -1));
          nextLaborId = (dailyLaborers.reduce((m,a)=>Math.max(m,Number(a.id||0)),0) || 0) + 1;
          try { renderDailyLabor(); renderSummary(); renderDashboard(); } catch(e){}
        });

        db.collection('advances').onSnapshot(snapshot => {
          const docs = [];
          snapshot.forEach(doc => docs.push({ id: (/^\d+$/.test(doc.id) ? Number(doc.id) : doc.id), ...doc.data() }));
          advances = docs.sort((a,b) => (a.date_given < b.date_given ? 1 : -1));
          nextAdvanceId = (advances.reduce((m,a)=>Math.max(m,Number(a.id||0)),0) || 0) + 1;
          try { renderAdvances(); renderDashboard(); } catch(e){}
        });

        console.log('✅ Connected to Firestore. Realtime listeners attached.');

      } catch (err) {
        console.error('Firestore connect failed:', err);
        showToast('Firestore failed — local-only', 'error');
        firebaseConnected = false;
        try { renderDashboard(); renderEmployeeSelect(); renderDailyLabor(); renderSummary(); renderAdvances(); } catch (e) {}
      }
    }

    async function setDocSafe(collectionName, id, data) {
      if (!hasFirebase || !firebaseConnected) {
        console.warn('setDocSafe local fallback', collectionName, id);
        const col = collectionName;
        if (col === 'employees') {
          const idx = employees.findIndex(x => Number(x.id) === Number(id));
          if (idx >= 0) employees[idx] = data; else employees.push(data);
        } else if (col === 'attendance') {
          const idx = attendanceLog.findIndex(x => Number(x.id) === Number(id));
          if (idx >= 0) attendanceLog[idx] = data; else attendanceLog.push(data);
        } else if (col === 'dailyLabor') {
          const idx = dailyLaborers.findIndex(x => Number(x.id) === Number(id));
          if (idx >= 0) dailyLaborers[idx] = data; else dailyLaborers.push(data);
        } else if (col === 'advances') {
          const idx = advances.findIndex(x => Number(x.id) === Number(id));
          if (idx >= 0) advances[idx] = data; else advances.push(data);
        }
        try { renderDashboard(); if(currentEmployee) renderEmployeeDetail(currentEmployee); renderDailyLabor(); renderSummary(); renderAdvances(); } catch(e){}
        return;
      }
      try {
        await db.collection(collectionName).doc(String(id)).set(data);
      } catch (err) {
        console.error('Firestore write error', err);
        showToast('Save failed: ' + (err.message || err), 'error');
      }
    }

    async function deleteDocSafe(collectionName, id) {
      if (!hasFirebase || !firebaseConnected) {
        if (collectionName === 'attendance') attendanceLog = attendanceLog.filter(x => Number(x.id) !== Number(id));
        if (collectionName === 'dailyLabor') dailyLaborers = dailyLaborers.filter(x => Number(x.id) !== Number(id));
        if (collectionName === 'advances') advances = advances.filter(x => Number(x.id) !== Number(id));
        try { renderDashboard(); renderDailyLabor(); renderAdvances(); renderSummary(); } catch(e){}
        return;
      }
      try { await db.collection(collectionName).doc(String(id)).delete(); }
      catch (err) { console.error('Firestore delete failed', err); showToast('Delete failed', 'error'); }
    }

    window.openEditModal = function (attendanceId) {
      const record = attendanceLog.find(a => Number(a.id) === Number(attendanceId));
      if (!record) return showToast('Record not found', 'error');
      openAttendanceModal();
      setTimeout(() => {
        document.getElementById('entryEmployee').value = record.employee_id;
        document.getElementById('entryDate').value = record.date;
        document.getElementById('entryStartTime').value = record.start_time || '';
        document.getElementById('entryEndTime').value = record.end_time || '';
        document.getElementById('entryStatus').value = record.status || 'Present';
        document.getElementById('entryNotes').value = record.notes || '';
        updateComputedValues();
      }, 100);
    };

    window.openDeleteModal = function (attendanceId) {
      if (!confirm('Delete this attendance entry?')) return;
      if (hasFirebase && firebaseConnected) deleteDocSafe('attendance', attendanceId);
      else {
        attendanceLog = attendanceLog.filter(a => Number(a.id) !== Number(attendanceId));
        renderDashboard(); if (currentEmployee) renderEmployeeDetail(currentEmployee);
        showToast('Deleted (local)', 'success');
      }
    };

    window.openEditAdvanceModal = function (advId) {
      const adv = advances.find(a => Number(a.id) === Number(advId));
      if (!adv) return showToast('Advance not found', 'error');
      const newAmount = prompt('Edit amount', adv.amount);
      if (newAmount === null) return;
      adv.amount = Number(newAmount);
      if (hasFirebase && firebaseConnected) setDocSafe('advances', adv.id, adv);
      else { renderAdvances(); showToast('Advance updated (local)', 'success'); }
    };

    window.openDeleteAdvanceModal = function (advId) {
      if (!confirm('Delete this advance?')) return;
      if (hasFirebase && firebaseConnected) deleteDocSafe('advances', advId);
      else { advances = advances.filter(a => Number(a.id) !== Number(advId)); renderAdvances(); renderDashboard(); showToast('Deleted (local)', 'success'); }
    };

    window.toggleStatusMenu = function (ev, attendanceId) {
      ev.stopPropagation();
      const record = attendanceLog.find(a => Number(a.id) === Number(attendanceId));
      if (!record) return;
      const sel = prompt('Set status (Present, Half-day, Leave, Absent):', record.status || 'Present');
      if (!sel) return;
      record.status = sel;
      if (hasFirebase && firebaseConnected) setDocSafe('attendance', record.id, record);
      else { renderAttendanceRecords(currentEmployee); renderDashboard(); showToast('Status updated (local)', 'success'); }
    };

    const monthInput = document.getElementById('monthYear');
    if (monthInput) {
      monthInput.addEventListener('change', (e) => {
        selectedMonth = e.target.value;
        try { renderDashboard(); if (currentEmployee) renderEmployeeDetail(currentEmployee); renderDailyLabor(); renderSummary(); renderAdvances(); } catch (err) {}
      });
    }

    try { renderDashboard(); renderEmployeeCards(); renderEmployeeSelect(); renderDailyLabor(); renderSummary(); renderAdvances(); } catch (e) {}

    if (hasFirebase) {
      try {
        if (!window.firebase) throw new Error('Firebase SDK not loaded. Add firebase scripts to index.html.');
        connectFirestore();
      } catch (err) {
        console.error(err);
        showToast('Firebase SDK missing or connect failed. Running local-only.', 'error');
      }
    } else {
      console.log('No Firebase config: running local-only.');
    }

    window._APP = {
      get employees() { return employees; },
      get attendance() { return attendanceLog; },
      get advances() { return advances; },
      get dailyLaborers() { return dailyLaborers; }
    };

  })();
}
