import { Request, Response } from 'express';
import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import * as userModel from '../models/user.model';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
const JWT_EXPIRES_IN = '24h' as const;

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Validate user credentials
    const user = await userModel.validateUser(email, password);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const tokenPayload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const options: SignOptions = { 
      expiresIn: JWT_EXPIRES_IN 
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, options);

    // Return success with token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Create new user
    const userId = await userModel.createUser({ email, password, role });

    // Generate JWT token
    const tokenPayload = { 
      userId, 
      email, 
      role 
    };
    
    const options: SignOptions = { 
      expiresIn: JWT_EXPIRES_IN 
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, options);

    // Return success with token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    // User ID should be available from auth middleware
    const userId = (req as any).user.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    // Get user details
    const user = await userModel.getUserById(userId);
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    // Return user data (without password)
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 