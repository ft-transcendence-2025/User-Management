/**
 * Profile Validation
 *
 * Validates profile fields to match frontend:
 * - nickName: 0-30 characters
 * - firstName: 0-30 characters
 * - lastName: 0-30 characters
 * - bio: 0-256 characters
 */

export class ProfileValidator {
  static validate(data: {
    nickName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
  }): { valid: boolean; errorMessage?: string } {
    // Validate nickName
    if (
      data.nickName !== undefined &&
      data.nickName !== null &&
      typeof data.nickName === "string" &&
      data.nickName.length > 30
    ) {
      return {
        valid: false,
        errorMessage: "Nickname must not exceed 30 characters",
      };
    }

    // Validate firstName
    if (
      data.firstName !== undefined &&
      data.firstName !== null &&
      typeof data.firstName === "string" &&
      data.firstName.length > 30
    ) {
      return {
        valid: false,
        errorMessage: "First name must not exceed 30 characters",
      };
    }

    // Validate lastName
    if (
      data.lastName !== undefined &&
      data.lastName !== null &&
      typeof data.lastName === "string" &&
      data.lastName.length > 30
    ) {
      return {
        valid: false,
        errorMessage: "Last name must not exceed 30 characters",
      };
    }

    // Validate bio
    if (
      data.bio !== undefined &&
      data.bio !== null &&
      typeof data.bio === "string" &&
      data.bio.length > 256
    ) {
      return {
        valid: false,
        errorMessage: "Bio must not exceed 256 characters",
      };
    }

    return { valid: true };
  }
}
