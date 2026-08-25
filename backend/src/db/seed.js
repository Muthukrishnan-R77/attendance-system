const bcrypt = require('bcryptjs');
const db = require('./index');

async function seedDatabase() {
  console.log('🌱 Starting Database Seed process...');

  try {
    await db.initDb();

    // Hash sample passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('emp123', 10);

    // 1. Seed Admin User
    const adminRes = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      ['admin@example.com']
    );

    if (adminRes.rows.length === 0) {
      await db.query(
        `INSERT INTO users (name, email, password, phone, department, position, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'Admin User',
          'admin@example.com',
          adminPassword,
          '9876543210',
          'Management',
          'System Administrator',
          'ADMIN'
        ]
      );
      console.log('✅ Admin user created: admin@example.com / admin123');
    } else {
      console.log('ℹ️ Admin user admin@example.com already exists.');
    }

    // 2. Seed Employee 1
    const emp1Res = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      ['john@example.com']
    );

    if (emp1Res.rows.length === 0) {
      await db.query(
        `INSERT INTO users (name, email, password, phone, department, position, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'John Doe',
          'john@example.com',
          employeePassword,
          '9876543211',
          'Engineering',
          'Software Developer',
          'EMPLOYEE'
        ]
      );
      console.log('✅ Employee created: john@example.com / emp123');
    } else {
      console.log('ℹ️ Employee john@example.com already exists.');
    }

    // 3. Seed Employee 2
    let emp2Id;
    const emp2Res = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      ['jane@example.com']
    );

    if (emp2Res.rows.length === 0) {
      const insertedEmp2 = await db.query(
        `INSERT INTO users (name, email, password, phone, department, position, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          'Jane Smith',
          'jane@example.com',
          employeePassword,
          '9876543212',
          'Design',
          'UI/UX Designer',
          'EMPLOYEE'
        ]
      );
      emp2Id = insertedEmp2.rows[0].id;
      console.log('✅ Employee created: jane@example.com / emp123');
    } else {
      emp2Id = emp2Res.rows[0].id;
      console.log('ℹ️ Employee jane@example.com already exists.');
    }

    // 4. Seed Sample Attendance for Today
    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const emp1ResForId = await db.query(`SELECT id FROM users WHERE email = $1`, ['john@example.com']);
    if (emp1ResForId.rows.length > 0) {
      const emp1Id = emp1ResForId.rows[0].id;
      const attCheck = await db.query(`SELECT id FROM attendance WHERE user_id = $1 AND attendance_date = $2`, [emp1Id, todayStr]);
      if (attCheck.rows.length === 0) {
        await db.query(
          `INSERT INTO attendance (user_id, attendance_date, check_in, check_out, status)
           VALUES ($1, $2, $3, NULL, 'PRESENT')`,
          [emp1Id, todayStr, nowIso]
        );
        console.log('✅ Sample attendance record created for John Doe');
      }
    }

    console.log('✨ Seed process complete successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
