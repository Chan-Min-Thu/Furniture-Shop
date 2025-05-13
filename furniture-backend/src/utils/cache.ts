import { redis } from "../config/redisClient";

export const getOrSetCache = async (key: string, cb: any) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("Cache hit");
      return JSON.parse(cachedData);
    }
    console.log("Cache Data missed.");
    const freshData = await cb(); // get Data
    await redis.setex(key, 3600, JSON.stringify(freshData));
    return freshData;
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};
