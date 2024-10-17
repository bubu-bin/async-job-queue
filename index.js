import JobFactory from "./job-factory.js";
import AsyncJobQueue from "./async-job-queue.js";

const jobFactory = JobFactory();
const jobQueue = AsyncJobQueue({ maxWorkers: 2, maxRetries: 2 });

jobQueue.eventEmitter
  .on("jobFinished", (job) => {
    console.log("Job finished:", job.id, "Result:", job.data);
  })
  .on("jobStarted", (id) => {
    console.log("job started", id);
  })
  .on("jobFailed", (job) => {
    console.log(
      "Job failed:",
      job.id,
      "Error:",
      job.error,
      "Retries:",
      job.retries
    );
  })
  .on("queueStopped", () => {
    console.log("Queue processing stopped.");
  })
  .on("queueResumed", () => {
    console.log("Queue processing resumed.");
  });

jobFactory.makeJobs((job) => {
  jobQueue.scheduleJob(job);
});

setTimeout(() => {
  jobQueue.stop();
}, 5000);

setTimeout(() => {
  jobQueue.resume();
}, 10000);

process.on("unhandledRejection", (reason, promise) => {});

process.on("SIGINT", () => {
  console.log(jobQueue.getStatus());
  process.exit();
});
