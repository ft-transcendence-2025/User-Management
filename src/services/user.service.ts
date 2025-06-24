import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { PasswordValidator } from "password-validator-pro";

export class UserServiceError extends Error {
  code: number;
  error?: object;
  constructor(message: string, code: number, error?: object) {
    super(message);
    this.code = code;
    this.error = error;
    Object.setPrototypeOf(this, UserServiceError.prototype);
  }
}

export class UserService {
  private pwValidator: PasswordValidator;

  constructor() {
    this.pwValidator = new PasswordValidator({
      minLength: 8,
      maxLength: 20,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      combineErrors: true, // Set this to true to combine all errors into one message
    });
  }
  async createUser(username: string, password: string, email?: string) {
    const result = this.pwValidator.validate(password);
    if (!result.valid) {
      throw new UserServiceError(
        "Password does not meet security requirements.",
        400,
        result.errors
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { username, password: hashedPassword, email },
      omit: { password: true },
    });
  }

  async findUserByUsername(username: string) {
    return prisma.user.findFirst({
      where: { username },
    });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      omit: { password: true },
    });
  }

  async updateUser(
    username: string,
    data: { email?: string; password?: string }
  ) {
    return prisma.user.update({
      where: { username },
      data,
    });
  }

  async disableUser(username: string) {
    return prisma.user.update({
      where: { username },
      data: { active: false },
    });
  }

  async deleteUser(username: string) {
    return prisma.user.delete({
      where: { username },
      omit: { password: true },
    });
  }
}
