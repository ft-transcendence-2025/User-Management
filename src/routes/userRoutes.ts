import { FastifyInstance } from "fastify";
const userController = require('../controllers/userController');

export default async function userRoutes(fastify: FastifyInstance) {
	// POST
	fastify.post('/', userController.createUser);
	
	// GET
	fastify.get('/', userController.getAll);
	fastify.get('/:username', userController.getByUsername);
	
	// PUT
	fastify.put('/:username', userController.updateUser);
	// fastify.get('/', userController.getAll);
	// fastify.get('/', userController.getAll);
	
	
	// PATCH

	fastify.patch('/:username', userController.disableUser);

	// DELETE
	fastify.delete('/:username', userController.deleteUser)
}