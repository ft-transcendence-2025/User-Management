import { FastifyRequest, FastifyReply } from "fastify";
import {
  FriendshipService,
  FriendshipServiceError,
} from "../services/friendshipt.service";

const friendshipService = new FriendshipService();

export const sendFriendRequest = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const { fromUserId, toUserId } = req.body as {
      fromUserId: string;
      toUserId: string;
    };
    const result = await friendshipService.sendFriendRequest(
      fromUserId,
      toUserId
    );
    return res.code(201).send(result);
  } catch (err) {
    if (err instanceof FriendshipServiceError) {
      return res.code(err.code).send({ message: err.message });
    }
    return res.code(500).send({ message: "Internal server error", error: err });
  }
};

export const getFriendRequests = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const { username } = req.params as { username: string };
    const requests = await friendshipService.getFriendRequests(username);
    return res.send(requests);
  } catch (err) {
    if (err instanceof FriendshipServiceError) {
      return res.code(err.code).send({ message: err.message });
    }
    return res.code(500).send({ message: "Internal server error", error: err });
  }
};

export const respondToFriendRequest = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const { friendshipId } = req.params as { friendshipId: string };
    const { accept } = req.body as { accept: boolean };
    const result = await friendshipService.respondToFriendRequest(
      friendshipId,
      accept
    );
    return res.send(result);
  } catch (err) {
    if (err instanceof FriendshipServiceError) {
      return res.code(err.code).send({ message: err.message });
    }
    return res.code(500).send({ message: "Internal server error", error: err });
  }
};

export const listFriends = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username } = req.params as { username: string };
    const friends = await friendshipService.listFriends(username);
    return res.send(friends);
  } catch (err) {
    if (err instanceof FriendshipServiceError) {
      return res.code(err.code).send({ message: err.message });
    }
    return res.code(500).send({ message: "Internal server error", error: err });
  }
};

export const removeFriend = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { userId, friendId } = req.body as {
      userId: string;
      friendId: string;
    };
    const result = await friendshipService.removeFriend(userId, friendId);
    return res.send(result);
  } catch (err) {
    if (err instanceof FriendshipServiceError) {
      return res.code(err.code).send({ message: err.message });
    }
    return res.code(500).send({ message: "Internal server error", error: err });
  }
};
