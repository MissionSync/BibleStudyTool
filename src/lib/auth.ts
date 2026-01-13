import { account } from './appwrite';
import { ID } from 'appwrite';

export interface User {
  $id: string;
  email: string;
  name: string;
}

/**
 * Create a new user account
 */
export async function signUp(email: string, password: string, name: string): Promise<User> {
  try {
    const response = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Auto-login after signup
    await login(email, password);

    return {
      $id: response.$id,
      email: response.email,
      name: response.name,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();

    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to login');
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await account.get();
    return {
      $id: user.$id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
}
