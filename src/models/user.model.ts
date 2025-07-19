import pool from './database';
import bcrypt from 'bcrypt';

export interface User {
  id?: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
  created_at?: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? rows[0] as User : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length ? rows[0] as User : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

export async function createUser(user: User): Promise<number> {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // Create user with hashed password
    const [result]: any = await pool.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [user.email, hashedPassword, user.role]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return isValid ? user : null;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  try {
    const [rows] = await pool.execute('SELECT id, email, role, created_at FROM users');
    return rows as Omit<User, 'password'>[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

export async function updateUserPassword(id: number, newPassword: string): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result]: any = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
} 