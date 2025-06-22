import { FastifyInstance } from "fastify";
import * as userController from '../controllers/user.controller';

export default async function userRoutes(fastify: FastifyInstance) {
	// POST
	fastify.post('/login', userController.login);
	fastify.post('/register', userController.createUser);
}