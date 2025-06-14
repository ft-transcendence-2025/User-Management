import { FastifyRequest, FastifyReply } from 'fastify';
import { FriendshipStatus, PrismaClient } from '../../generated/prisma';
import { PrismaClientKnownRequestError } from '../../generated/prisma/runtime/library';

const prisma = new PrismaClient();

exports.sendFriendRequest = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { fromUserId, toUserId } = req.body as { fromUserId: string; toUserId: string };

		if (fromUserId === toUserId) return res.code(400).send({ message: "You can't add yourself" });
		const existing = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ requesterUsername: fromUserId, addresseeUsername: toUserId },
					{ requesterUsername: toUserId, addresseeUsername: fromUserId }
				]
			}
		});
		if (existing) return res.code(400).send({ message: 'Friendship already exists or pending' });
		console.info({message : "requested : Create friendship", body : req.body});
		
		await prisma.friendship.create({
			data: {
				requesterUsername: fromUserId,
				addresseeUsername: toUserId
				// status: FriendshipStatus.PENDING
			}
		});
		return res.code(201).send({ message: 'Friend request sent' });

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.getFriendRequests = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		const requests = await prisma.friendship.findMany({
			where: {
				addresseeUsername: username,
				status: 'PENDING'
			},
			include: {
				requester: { select: { id: true, username: true } }
			}
		});

		return res.send(requests);

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.respondToFriendRequest = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { friendshipId } = req.params as { friendshipId: string };
		const { accept } = req.body as { accept: boolean };

		const status = accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED;

		await prisma.friendship.update({
			where: { id: friendshipId },
			data: { status }
		});

		return res.send({ message: `Friend request ${status.toLowerCase()}` });

	} catch (err) {
		if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
			return res.code(404).send({ message: 'Friend request not found' });
		}
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.listFriends = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		const friends = await prisma.friendship.findMany({
			where: {
				OR: [
					{ requesterUsername: username },
					{ addresseeUsername: username }
				],
				status: 'ACCEPTED'
			},
			include: {
				requester: { select: { id: true, username: true } },
				addressee: { select: { id: true, username: true } }
			}
		});

		const result = friends.map((f) => {
			const friendUser = f.requesterUsername == username ? f.addressee : f.requester;
			return { id: friendUser.id, username: friendUser.username };
		});

		return res.send(result);

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

exports.removeFriend = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { userId, friendId } = req.body as { userId: string; friendId: string };

		await prisma.friendship.deleteMany({
			where: {
				OR: [
					{ requesterUsername: userId, addresseeUsername: friendId },
					{ requesterUsername: friendId, addresseeUsername: userId }
				],
				status: 'ACCEPTED'
			}
		});

		return res.send({ message: 'Friend removed' });

	} catch (err) {
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};
