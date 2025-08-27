import prisma from "../lib/prisma";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { FriendshipStatus } from "../../generated/prisma";

export class FriendshipServiceError extends Error {
  code: number;
  error?: object;
  constructor(message: string, code: number, error?: object) {
    super(message);
    this.code = code;
    this.error = error;
    Object.setPrototypeOf(this, FriendshipServiceError.prototype);
  }
}

export class FriendshipService {
  async sendFriendRequest(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new FriendshipServiceError("You can't add yourself", 400);
    }
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterUsername: fromUserId, addresseeUsername: toUserId },
          { requesterUsername: toUserId, addresseeUsername: fromUserId },
        ],
      },
    });
    if (existing) {
      throw new FriendshipServiceError(
        "Friendship already exists or pending",
        400
      );
    }
    await prisma.friendship.create({
      data: {
        requesterUsername: fromUserId,
        addresseeUsername: toUserId,
        status: FriendshipStatus.PENDING,
      },
    });
    return { message: "Friend request sent" };
  }

  async getFriendRequests(username: string) {
    return prisma.friendship.findMany({
      where: {
        addresseeUsername: username,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: { select: { id: true, username: true } },
      },
    });
  }

  async getBlockedUsersList(username: string) {
    const usersList = await prisma.friendship.findMany({
      where: {
        OR: [
          { addresseeUsername: username },
          { requesterUsername: username }
        ],
        status: FriendshipStatus.BLOCKED,
      },
      // include: {
      //   requester: { select: { username: true } },
      // },
      omit: {
        id: true,
        // requesterUsername: true,
        // addresseeUsername: true,
        createdAt: true,
        updateAt: true,
        status: true
      }
    });

    return usersList.map((user) => {
      return {
        username: (username != user.requesterUsername) ? user.requesterUsername : user.addresseeUsername
      };
    })
  }

  async respondToFriendRequest(friendshipId: string, status: FriendshipStatus) {
    try {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status },
      });
      return { message: `Friend request ${status.toLowerCase()}` };
    } catch (err: any) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new FriendshipServiceError("Friend request not found", 404);
      }
      throw new FriendshipServiceError(
        "Error updating friend request",
        500,
        err
      );
    }
  }

  async listFriends(username: string) {
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterUsername: username }, { addresseeUsername: username }],
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        requester: { select: { id: true, username: true } },
        addressee: { select: { id: true, username: true } },
      },
    });

    return friends.map((f) => {
      const friendUser =
        f.requesterUsername == username ? f.addressee : f.requester;
      return { id: friendUser.id, username: friendUser.username };
    });
  }

  async removeFriend(userId: string, friendId: string) {
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterUsername: userId, addresseeUsername: friendId },
          { requesterUsername: friendId, addresseeUsername: userId },
        ],
        status: FriendshipStatus.ACCEPTED,
      },
    });
    return { message: "Friend removed" };
  }
}
