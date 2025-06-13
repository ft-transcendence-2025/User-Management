import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../server";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
const bcrypt = require('bcrypt');

// ================================== POST ==================================
export const createUser = async (req: FastifyRequest, res: FastifyReply) => {
	const { username, password, email } = req.body as {
		username: string;
		password: string;
		email?: string;
	};

	if (!username || !password) {
		return res.code(400).send({ message: 'Username and password are required' });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	try {
		const user = await prisma.user.create({
			data: { username, password: hashedPassword, email },
		});

		const { password: _, ...userSafe } = user;
		return res.code(201).send({ message: 'User created!', user: userSafe });
	} catch (err) {
		return res.code(500).send({ message: 'Error creating user', error: err });
	}
};

export const login = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username, password } = req.body as { username: string, password: string };
		if (!username || !password)
			return res.code(400).send({ message: "Bad request." });
		const user = await prisma.user.findFirst({ where: { username } });
		if (!user)
			return res.code(403).send({ message: "Invalid username or password." });

		const valid = await bcrypt.compare(password, user.password);
		if (!valid)
			return res.code(403).send({ message: "Invalid username or password." });
		return res.code(200).send({ message: "User successfully logged in.", user });
	} catch (err) {
		return res.code(500).send({ message: "Internal server error." });
	}
}

// ================================== GET ==================================
exports.getAll = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const users = await prisma.user.findMany({
			omit: {
				password: true
			}
		});
		return users ? res.code(200).send(users) : res.code(404).send({ message: "No user was found!" });
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}

exports.getByUsername = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string }
		const user = await prisma.user.findFirst({
			where: {
				username: username
			},
			omit: {
				password: true
			}
		});

		return user ? res.code(200).send(user) : res.code(404).send({ message: "User not found!" });
	} catch (err) {
		return res.code(500).send({ message: "Internal Server Error", error: err });
	}
}


// ================================== PATCH ==================================

exports.disableUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };

		await prisma.user.update({
			where: { username },
			data: { active: false }
		})
		return res.code(200).send({ message: "User disabled successfully" });

	} catch (err: unknown) {
		if (
			err instanceof PrismaClientKnownRequestError &&
			err.code == 'P2025'
		) {
			return res.code(404).send({ message: 'User not found!' });
		}

		return res.code(500).send({ message: 'Internal Server Error', error: err });
	}
};

// ================================== PUT ==================================

export const updateUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string };
		const { email, password } = req.body as { email?: string; password?: string };

		let data: any = {};
		if (email) data.email = email;
		if (password) data.password = await bcrypt.hash(password, 10);

		const user = await prisma.user.update({
			where: { username },
			data
		});

		return res.send({ message: 'User updated', user });

	} catch (err: unknown) {
		if (err instanceof PrismaClientKnownRequestError && err.code == 'P2025') {
			return res.code(404).send({ message: 'User not found' });
		}
		return res.code(500).send({ message: 'Internal server error', error: err });
	}
};

// ================================== DELETE ==================================

exports.deleteUser = async (req: FastifyRequest, res: FastifyReply) => {
	try {
		const { username } = req.params as { username: string }
		const user = await prisma.user.delete({
			where: {
				username: username
			},
			omit: {
				password: true
			}
		});
		return res.code(200).send({ message: "User deleted successfully!", user })
	} catch (err: unknown) {
		if (
			err instanceof PrismaClientKnownRequestError &&
			err.code == 'P2025'
		) {
			return res.code(404).send({ message: 'User not found!' });
		}

		return res.code(500).send({ message: 'Internal Server Error', error: err });
	}
};


