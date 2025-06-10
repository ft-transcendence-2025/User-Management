import Fastify from "fastify";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
const fastify = Fastify({
	logger: true
})
import userRoutes from "./routes/userRoutes";
import friendshipRoutes from "./routes/friendshipRoutes";
import profileRoutes from "./routes/profileRoutes";

[
	{ route: userRoutes, prefix: 'api/users' },
	{ route: profileRoutes, prefix: 'api/profiles' },
	{ route: friendshipRoutes, prefix: 'api/friendships' }
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