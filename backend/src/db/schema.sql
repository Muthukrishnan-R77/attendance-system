-- Drop existing tables if re-creating
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
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

-- Create attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_date UNIQUE(user_id, attendance_date)
);

-- Indexes for search & query speed
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, attendance_date);
