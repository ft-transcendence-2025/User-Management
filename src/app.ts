import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import friendshipRoutes from "./routes/friendship.route";
import profileRoutes from "./routes/profile.route";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

type Environment = "development" | "production" | "test";
const environment = (process.env.NODE_ENV as Environment) || "development";

const app = Fastify({
  logger: envToLogger[environment] ?? true,
});

app.get("/health", async (req: FastifyRequest, res: FastifyReply) => {
  return res.code(200).send({ message: "ok" });
});

app.register(fastifyMultipart);

[
  { route: authRoutes, prefix: "/auth" },
  { route: userRoutes, prefix: "/users" },
  { route: profileRoutes, prefix: "/profiles" },
  { route: friendshipRoutes, prefix: "/friendships" },
].forEach(({ route, prefix }) => app.register(route, { prefix }));

export default app;
