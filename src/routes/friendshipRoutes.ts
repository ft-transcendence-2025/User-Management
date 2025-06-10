import { FastifyInstance } from 'fastify';
const friendshipController = require('../controllers/friendshipController')

export default async function friendshipRoutes(app: FastifyInstance) {
  app.post('/', friendshipController.sendFriendRequest); // enviar pedido
  app.get('/requests/:userId', friendshipController.getFriendRequests); // ver pedidos recebidos
  app.patch('/respond/:friendshipId', friendshipController.respondToFriendRequest); // aceitar/rejeitar
  app.get('/list/:userId', friendshipController.listFriends); // listar amigos
  app.delete('/', friendshipController.removeFriend); // remover amizade
}