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
  await redisClient.connect();
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
};

const closeRedis = async () => {
  try {
    await redisClient.quit();
    console.log("Redis connection closed.");
  } catch (error) {
    console.error("Error closing Redis connection:", error);
  }
};

export { connectRedis, closeRedis };
