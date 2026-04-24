import { UserRepository } from '../repositories/UserRepository';
import { User } from '../types/database';
import bcrypt from 'bcryptjs';

const userRepository = new UserRepository();

export class AuthService {
  /**
   * Attempts to log in a user with the given username and password.
   * Returns the User object if successful, or throws an error.
   */
  async login(username: string, password: string): Promise<User> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.password) {
       throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    // Return user without password for safety in state
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}

export const authService = new AuthService();
