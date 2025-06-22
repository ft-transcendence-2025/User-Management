import Fastify from "fastify";
import fastifyMultipart from '@fastify/multipart';
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import friendshipRoutes from "./routes/friendship.route";
import profileRoutes from "./routes/profile.route";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const envToLogger = {
	development: {
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				ignore: 'pid,hostname',
			},
		},
	},
	production: true,
	test: false
};

type Environment = 'development' | 'production' | 'test';
const environment = (process.env.NODE_ENV as Environment) || 'development';



const fastify = Fastify({
	logger: envToLogger[environment] ?? true
})

fastify.register(fastifyMultipart);


[
	{ route: authRoutes, prefix: '/auth' },
	{ route: userRoutes, prefix: '/users' },
	{ route: profileRoutes, prefix: '/profiles' },
	{ route: friendshipRoutes, prefix: '/friendships' }
].forEach(({ route, prefix }) => fastify.register(route, { prefix }));

async function main() {
	try {
		fastify.listen({
			port: 3000,
			host: '0.0.0.0'
		})
	} catch (err) {
		fastify.log.error("Could not initiate server...", err);
	}
}


main();

export default prisma;