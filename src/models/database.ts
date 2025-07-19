import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'project_protector',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
export async function initDatabase(): Promise<void> {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        status ENUM('allowed', 'blocked') DEFAULT 'allowed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE role = ?', ['admin']);

    // Create default admin if none exists
    if (rows.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await pool.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
        [process.env.ADMIN_EMAIL, hashedPassword, 'admin']
      );

      console.log('Default admin user created');
    }

    // Add some sample projects if none exist
    const [projectRows]: any = await pool.execute('SELECT * FROM projects LIMIT 1');
    
    if (projectRows.length === 0) {
      const sampleProjects = [
        { project_id: 'sample-project-1', name: 'Sample Project 1', status: 'allowed' },
        { project_id: 'sample-project-2', name: 'Sample Project 2', status: 'allowed' },
        { project_id: 'sample-project-3', name: 'Sample Project 3', status: 'blocked' }
      ];

      for (const project of sampleProjects) {
        await pool.execute(
          'INSERT INTO projects (project_id, name, status) VALUES (?, ?, ?)',
          [project.project_id, project.name, project.status]
        );
      }

      console.log('Sample projects created');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default pool; 