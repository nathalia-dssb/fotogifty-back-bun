import bcrypt from 'bcrypt';

export class PasswordService {
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}