import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();
export const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
const connectRedis = async () => {

  redisClient.connect();
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
};
export default connectRedis;
