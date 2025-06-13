import { FastifyInstance } from "fastify";
const userController = require('../controllers/userController');

export default async function userRoutes(fastify: FastifyInstance) {
	// POST
	fastify.post('/login', userController.login);
}