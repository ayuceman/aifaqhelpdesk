import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from './databaseService';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  trialStartDate?: string;
  trialEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  plan: string;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  async signup(signupData: SignupData): Promise<{ user: User; token: string }> {
    const { email, password, name } = signupData;

    // Check if user already exists
    const existingUser = databaseService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Generate user ID
    const userId = databaseService.generateId();

    // Create user
    const userData = {
      id: userId,
      email,
      passwordHash,
      name,
      plan: 'free' as const
    };

    databaseService.createUser(userData);

    // Get created user (without password hash)
    const user = databaseService.getUserById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      plan: user.plan
    });

    // Create default project for new user
    const projectId = databaseService.generateId();
    const projectSlug = this.generateSlug(name);
    
    databaseService.createProject({
      id: projectId,
      userId: user.id,
      name: 'My First Project',
      slug: projectSlug,
      description: 'Your first FAQ project'
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        trialStartDate: user.trial_start_date,
        trialEndDate: user.trial_end_date,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { email, password } = credentials;

    // Get user by email
    const user = databaseService.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      plan: user.plan
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        trialStartDate: user.trial_start_date,
        trialEndDate: user.trial_end_date,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = databaseService.getUserById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      trialStartDate: user.trial_start_date,
      trialEndDate: user.trial_end_date,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async updateUserPlan(userId: string, plan: string): Promise<void> {
    databaseService.updateUser(userId, { plan });
  }

  async startTrial(userId: string, planId: string): Promise<void> {
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

    // Get the plan details to set appropriate trial limits
    const { paymentService } = await import('./paymentService');
    const plans = await paymentService.getPricingPlans();
    const selectedPlan = plans.find(p => p.id === planId);
    
    if (!selectedPlan) {
      throw new Error('Invalid plan selected for trial');
    }

    databaseService.updateUser(userId, {
      plan: 'trial',
      trialStartDate: startDate,
      trialEndDate: endDate,
      // Store the trial plan ID for reference
      trialPlanId: planId
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  }
}

export const authService = new AuthService();
