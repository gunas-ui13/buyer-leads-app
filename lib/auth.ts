import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  password?: string; // Optional for demo purposes
}

// File path for user data
const USERS_FILE = path.join(process.cwd(), 'lib', 'users.json');

// Load users from file
function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  
  // Return default admin user if file doesn't exist or is corrupted
  return [
    {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      password: '123456'
    }
  ];
}

// Save users to file
function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Get all users
function getUsers(): User[] {
  return loadUsers();
}

// Add a new user to the users array
export function addUser(user: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Check if email already exists
export function userExists(email: string): boolean {
  const users = getUsers();
  return users.some(user => user.email === email);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user-id')?.value;
  
  if (!userId) return null;
  
  const users = getUsers();
  return users.find(user => user.id === userId) || null;
}

export async function login(email: string, password: string): Promise<User | null> {
  // Find user by email
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  // Check password (in production, this would verify password hash)
  if (user.password && user.password !== password) return null;
  
  // For admin, also check the specific admin credentials
  if (user.role === 'admin' && email === 'admin@example.com' && password !== '123456') return null;
  
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user-id');
}

export function requireAuth(requiredRole?: 'user' | 'admin') {
  return async function authMiddleware() {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
    
    return user;
  };
}
