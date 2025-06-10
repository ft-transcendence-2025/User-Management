import { FastifyInstance } from 'fastify';
const profileController = require('../controllers/profileController')

export default async function profileRoutes(app: FastifyInstance) {
  app.post('/', profileController.createProfile);
  app.get('/:username', profileController.getProfileByUsername);
  app.put('/:username', profileController.updateProfile);
  app.delete('/:username', profileController.deleteProfile);
}