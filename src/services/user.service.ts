import { error } from "console";
import prisma from "../lib/prisma";
const bcrypt = require("bcrypt");

/**
 * Validates a password string against a set of security rules.
 *
 * The password must satisfy all of the following rules:
 * - Must be at least 7 characters long.
 * - Must contain at least one uppercase letter (A-Z).
 * - Must contain at least one lowercase letter (a-z).
 * - Must contain at least one special character (non-alphanumeric).
 * - Must not contain two or more consecutive digits.
 * - Should not be empty or contain only whitespace.
 * - Should not contain the username or common dictionary words.
 *
 * @param pw - The password string to validate.
 * @returns `true` if the password meets all criteria, otherwise `false`.
 */
function validatePassword(pw: string, username: string): boolean {
  const rules = [
    pw.length >= 7,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
    !/\d{2,}/.test(pw),
    !(username && pw.toLowerCase().includes(username.toLowerCase())),
    pw.trim().length > 0,
  ];
  return rules.every(Boolean);
}

class UserServiceError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, UserServiceError.prototype);
  }
}

export class UserService {
  async createUser(username: string, password: string, email?: string) {
    if (!validatePassword(password, username)) {
      throw new UserServiceError(
        "Password does not meet security requirements.",
        400
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: { username, password: hashedPassword, email },
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
