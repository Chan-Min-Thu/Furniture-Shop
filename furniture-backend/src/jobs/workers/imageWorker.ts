import { Worker } from "bullmq";
import sharp from "sharp";
import path from "path";
import { redis } from "../../config/redisClient";

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName, width, height, quality } = job.data;
    const optimizedFilePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimize",
      fileName
    );
    await sharp(filePath)
      .resize(width, height)
      .webp({ quality })
      .toFile(optimizedFilePath);
  },
  { connection: redis, concurrency: 5 }
);

imageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

imageWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed with error: ${err.message}`);
});
