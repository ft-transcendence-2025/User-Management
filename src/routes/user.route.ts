import { FastifyInstance } from "fastify";
const userController = require('../controllers/userController');

export default async function userRoutes(fastify: FastifyInstance) {	
	// GET
	fastify.get('/', userController.getAll);
	fastify.get('/:username', userController.getByUsername);
	
	// PUT
	fastify.put('/:username', userController.updateUser);

	// PATCH
	fastify.patch('/:username', userController.disableUser);

	// DELETE
	fastify.delete('/:username', userController.deleteUser)
}