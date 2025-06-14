import { FastifyRequest, FastifyReply } from 'fastify';
import { FriendshipStatus, PrismaClient, Profile, ProfileLanguage, UserGender } from '../../generated/prisma';
import { PrismaClientKnownRequestError } from '../../generated/prisma/runtime/library';

const prisma = new PrismaClient();


export const createProfile = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };
		const {
			nickName,
			bio,
			gender,
			firstName,
			lastName,
			language,
			avatar
		} = req.body as {
			nickName?: string;
			bio?: string;
			gender?: UserGender;
			firstName?: string;
			lastName?: string;
			language?: ProfileLanguage;
			avatar?: string;
		};

		if (!username) {
			return res.code(400).send({ message: 'username is required.' });
		}


		const user = await prisma.user.findUnique({
			where: { username: username }
		});
		if (!user) {
			return res.code(404).send({ message: 'User does not exist.' });
		}

		const existing = await prisma.profile.findUnique({
			where: { userUsername: username }
		});
		if (existing) return res.code(400).send({ message: 'Profile already exists.' });

		const profile = await prisma.profile.create({
			data: {
				userUsername : username,
				...(nickName && { nickName }),
				...(bio && { bio }),
				...(gender && { gender }),
				...(firstName && { firstName }),
				...(lastName && { lastName }),
				...(language && { language }),
				...(avatar && { avatar })
			},
		});
		return res.code(201).send(profile);
	} catch (err) {
		return res.code(500).send({ message: 'Error creating profile', error: err });
	}
};


exports.getProfileByUsername = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		const profile = await prisma.profile.findUnique({
			where: { userUsername: username },
			// omit : {
			// 	createdAt : true,
			// 	updatedAt : true
			// }
		});
		if (!profile) return res.code(404).send({ message: 'Profile not found' });

		return res.send(profile);
	} catch (err) {
		return res.code(500).send({ message: 'Error fetching profile', error: err });
	}
};

exports.updateProfile = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };
		const data = req.body as Partial<Profile>;

		// Remove undefined fields and exclude 'id' so it doesn't get updated
		const updateData = Object.fromEntries(
			Object.entries(data).filter(([key, v]) => v !== undefined && key !== 'id')
		);

		const profile = await prisma.profile.update({
			where: { userUsername: username },
			data: updateData
		});
		return res.send({ message: 'Profile updated', profile });
	} catch (err: unknown) {
		if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
			return res.code(404).send({ message: 'Profile not found' });
		}
		return res.code(500).send({ message: 'Error updating profile', error: err });
	}
};

exports.deleteProfile = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		await prisma.profile.delete({
			where: { userUsername: username }
		});
	} catch (err: unknown) {
		if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
			return res.code(404).send({ message: 'Profile not found' });
		}
		return res.code(500).send({ message: 'Error deleting profile', error: err });
	}
};
