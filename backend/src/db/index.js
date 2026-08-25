const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useInMemory = false;

const fs = require('fs');
const path = require('path');

const MOCK_FILE = path.join(__dirname, 'mock_store.json');

// In-Memory & Persistent File Store (Fallback when PostgreSQL daemon is unreachable)
const mockDb = {
  users: [],
  attendance: [],
  userIdCounter: 1,
  attendanceIdCounter: 1,
};

function saveMockData() {
  try {
    fs.writeFileSync(MOCK_FILE, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist mock database to disk:', err.message);
  }
}

function loadMockData() {
  try {
    if (fs.existsSync(MOCK_FILE)) {
      const content = fs.readFileSync(MOCK_FILE, 'utf8');
      const data = JSON.parse(content);
      if (data && data.users && data.users.length > 0) {
        mockDb.users = data.users;
        mockDb.attendance = data.attendance || [];
        mockDb.userIdCounter = data.userIdCounter || (data.users.length + 1);
        mockDb.attendanceIdCounter = data.attendanceIdCounter || (data.attendance ? data.attendance.length + 1 : 1);
        console.log(`💾 Loaded ${mockDb.users.length} users and ${mockDb.attendance.length} attendance records from persistent disk storage.`);
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to load mock store:', err.message);
  }
  return false;
}

// Helper to seed mock database
async function seedMockData() {
  if (loadMockData()) return;
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const empHash = await bcrypt.hash('emp123', 10);
  const now = new Date().toISOString();

  mockDb.users.push(
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminHash,
      phone: '9876543210',
      department: 'Management',
      position: 'HR Manager',
      role: 'ADMIN',
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@example.com',
      password: empHash,
      phone: '9876543211',
      department: 'Engineering',
      position: 'Software Developer',
      role: 'EMPLOYEE',
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: empHash,
      phone: '9876543212',
      department: 'Design',
      position: 'UI/UX Designer',
      role: 'EMPLOYEE',
      created_at: now,
      updated_at: now
    }
  );
  mockDb.userIdCounter = 4;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  
  mockDb.attendance.push(
    {
      id: 1,
      user_id: 2,
      attendance_date: todayStr,
      check_in: nowIso,
      check_out: null,
      status: 'PRESENT',
      created_at: nowIso
    }
  );
  mockDb.attendanceIdCounter = 2;

  saveMockData();
}

// Helper to auto-create database if missing
async function ensureDatabaseExists(dbUrl) {
  try {
    const parsed = new URL(dbUrl);
    const dbName = parsed.pathname.replace(/^\//, '');
    if (!dbName || dbName === 'postgres') return;

    parsed.pathname = '/postgres';
    const defaultPool = new Pool({
      connectionString: parsed.toString(),
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 3000,
    });

    const client = await defaultPool.connect();
    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkRes.rows.length === 0) {
      console.log(`🔨 Database "${dbName}" does not exist. Creating automatically...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    }

    client.release();
    await defaultPool.end();
  } catch (err) {
    // If unable to connect to default postgres DB, main pool will handle reporting connection errors
  }
}

// Initialize Database Connection
async function initDb() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/attendance_db';
  
  await ensureDatabaseExists(dbUrl);

  pool = new Pool({
    connectionString: dbUrl,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 3000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL Database successfully.');
    
    // Auto create tables if they do not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        position VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        attendance_date DATE NOT NULL,
        check_in TIMESTAMP WITH TIME ZONE,
        check_out TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_date UNIQUE(user_id, attendance_date)
      );
    `);
    client.release();
  } catch (err) {
    console.warn('⚠️  PostgreSQL connection failed:', err.message);
    console.warn('🔄 Falling back to zero-config In-Memory Database engine for immediate testing.');
    useInMemory = true;
    await seedMockData();
  }
}

// Helper Query Execution abstraction matching pg Pool.query API signature
async function query(text, params = []) {
  if (!useInMemory && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      // If pool failed unexpectedly, fallback to in-memory mode
      console.error('PostgreSQL Query Error:', err.message);
      throw err;
    }
  }

  // --- In-Memory Query Router ---
  const rawSql = text.trim();
  const sql = rawSql.replace(/\s+/g, ' ');
  
  // 1. SELECT users BY email
  if (sql.includes('FROM users WHERE email =')) {
    const email = params[0];
    const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [ { ...user } ] : [] };
  }

  // 2. SELECT user BY id
  if (sql.includes('FROM users WHERE id =')) {
    const id = parseInt(params[0], 10);
    const user = mockDb.users.find(u => u.id === id);
    return { rows: user ? [ { ...user } ] : [] };
  }

  // 3. SELECT all users with filters
  if (sql.includes('FROM users') && !sql.includes('COUNT(')) {
    let result = [...mockDb.users];
    
    // Check parameters if passed
    if (params.length > 0) {
      // Basic match logic for parameters passed
      let paramIdx = 0;
      if (sql.includes('search') || sql.includes('ILIKE')) {
        const searchVal = String(params[paramIdx] || '').replace(/%/g, '').toLowerCase();
        paramIdx++;
        if (searchVal) {
          result = result.filter(u => 
            u.name.toLowerCase().includes(searchVal) || 
            u.email.toLowerCase().includes(searchVal)
          );
        }
      }
      if (sql.includes('department =')) {
        const deptVal = params[paramIdx];
        paramIdx++;
        if (deptVal) {
          result = result.filter(u => u.department === deptVal);
        }
      }
      if (sql.includes('role =')) {
        const roleVal = params[paramIdx];
        paramIdx++;
        if (roleVal) {
          result = result.filter(u => u.role === roleVal);
        }
      }
    }

    // Default order by id desc
    result.sort((a, b) => b.id - a.id);
    return { rows: result };
  }

  // 4. INSERT INTO users
  if (sql.includes('INSERT INTO users')) {
    // params: [name, email, password, phone, department, position, role]
    const [name, email, password, phone, department, position, role] = params;
    
    // Check unique email
    const exists = mockDb.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const error = new Error('duplicate key value violates unique constraint "users_email_key"');
      error.code = '23505';
      throw error;
    }

    const newUser = {
      id: mockDb.userIdCounter++,
      name,
      email,
      password,
      phone: phone || '',
      department: department || '',
      position: position || '',
      role: role || 'EMPLOYEE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.users.push(newUser);
    saveMockData();
    return { rows: [{ ...newUser }] };
  }

  // 5. UPDATE users
  if (sql.includes('UPDATE users')) {
    const id = parseInt(params[params.length - 1], 10);
    const userIndex = mockDb.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { rows: [] };

    // Handle password update vs standard update
    if (params.length === 7) { // name, email, phone, department, position, role, id
      const [name, email, phone, department, position, role] = params;
      mockDb.users[userIndex] = {
        ...mockDb.users[userIndex],
        name, email, phone, department, position, role,
        updated_at: new Date().toISOString()
      };
    } else if (params.length === 8) { // name, email, password, phone, department, position, role, id
      const [name, email, password, phone, department, position, role] = params;
      mockDb.users[userIndex] = {
        ...mockDb.users[userIndex],
        name, email, password, phone, department, position, role,
        updated_at: new Date().toISOString()
      };
    }

    saveMockData();
    return { rows: [{ ...mockDb.users[userIndex] }] };
  }

  // 6. DELETE FROM users
  if (sql.includes('DELETE FROM users')) {
    const id = parseInt(params[0], 10);
    const index = mockDb.users.findIndex(u => u.id === id);
    if (index !== -1) {
      const deleted = mockDb.users.splice(index, 1);
      // Also delete attendance for user
      mockDb.attendance = mockDb.attendance.filter(a => a.user_id !== id);
      saveMockData();
      return { rows: deleted };
    }
    return { rows: [] };
  }

  // 7. ATTENDANCE: Check if checked in today
  if (sql.includes('FROM attendance WHERE user_id =') && sql.includes('attendance_date =')) {
    const userId = parseInt(params[0], 10);
    const date = params[1];
    const rec = mockDb.attendance.find(a => a.user_id === userId && a.attendance_date === date);
    return { rows: rec ? [{ ...rec }] : [] };
  }

  // 8. INSERT INTO attendance (Check In)
  if (sql.includes('INSERT INTO attendance')) {
    const [userId, date, checkIn, status] = params;
    // Check unique constraint
    const exists = mockDb.attendance.some(a => a.user_id === parseInt(userId, 10) && a.attendance_date === date);
    if (exists) {
      const error = new Error('duplicate key value violates unique constraint "unique_user_date"');
      error.code = '23505';
      throw error;
    }

    const newAttendance = {
      id: mockDb.attendanceIdCounter++,
      user_id: parseInt(userId, 10),
      attendance_date: date,
      check_in: checkIn,
      check_out: null,
      status: status || 'PRESENT',
      created_at: new Date().toISOString()
    };
    mockDb.attendance.push(newAttendance);
    saveMockData();
    return { rows: [{ ...newAttendance }] };
  }

  // 9. UPDATE attendance (Check Out)
  if (sql.includes('UPDATE attendance SET check_out =')) {
    const [checkOutTime, id] = params;
    const recIndex = mockDb.attendance.findIndex(a => a.id === parseInt(id, 10));
    if (recIndex !== -1) {
      mockDb.attendance[recIndex].check_out = checkOutTime;
      saveMockData();
      return { rows: [{ ...mockDb.attendance[recIndex] }] };
    }
    return { rows: [] };
  }

  // 10. DASHBOARD STATS (Checked BEFORE generic attendance queries)
  if (sql.includes('COUNT(') || sql.includes('total_employees') || sql.includes('dashboard')) {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const totalEmployees = mockDb.users.filter(u => u.role === 'EMPLOYEE').length;
    const todayRecords = mockDb.attendance.filter(a => String(a.attendance_date).slice(0, 10) === todayStr);
    const presentToday = todayRecords.filter(a => a.status === 'PRESENT').length;
    const checkedIn = todayRecords.filter(a => a.check_in !== null).length;
    const absentToday = Math.max(0, totalEmployees - presentToday);

    return {
      rows: [{
        total_employees: totalEmployees.toString(),
        present_today: presentToday.toString(),
        absent_today: absentToday.toString(),
        checked_in: checkedIn.toString()
      }]
    };
  }

  // 11. GET Attendance History (Admin or Employee)
  if (sql.includes('FROM attendance') || sql.includes('JOIN users')) {
    let list = mockDb.attendance.map(a => {
      const u = mockDb.users.find(usr => usr.id === a.user_id) || {};
      return {
        ...a,
        employee_name: u.name || 'Unknown',
        employee_email: u.email || '',
        department: u.department || ''
      };
    });

    if (params.length > 0) {
      // Handle filtering
      let pIdx = 0;
      if (sql.includes('a.user_id =')) {
        const uid = parseInt(params[pIdx++], 10);
        list = list.filter(a => a.user_id === uid);
      }
      if (sql.includes('a.attendance_date =')) {
        const dt = params[pIdx++];
        list = list.filter(a => String(a.attendance_date).slice(0, 10) === dt);
      }
      if (sql.includes('a.status =')) {
        const st = params[pIdx++];
        list = list.filter(a => a.status === st);
      }
    }

    list.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
    return { rows: list };
  }

  return { rows: [] };
}

module.exports = {
  initDb,
  query,
  get isInMemory() { return useInMemory; },
  mockDb
};
