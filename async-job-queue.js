import { EventEmitter } from "events";

export default function AsyncJobQueue(
  config = {
    maxWorkers: 2,
    maxRetries: 2,
  }
) {
  const jobQueue = [];
  const finishedJobs = [];
  const failedJobs = [];
  const eventEmitter = new EventEmitter();

  let status = "active";
  let activeWorkersCount = 0;

  function scheduleJob(job) {
    const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newJob = { id: jobId, cb: job };
    jobQueue.push(newJob);
    eventEmitter.emit("jobScheduled", newJob.id);
    execute();
  }

  function processJob(job) {
    activeWorkersCount++;
    eventEmitter.emit("jobStarted", job.id);
    job.cb
      .then((result) => {
        const finishedJob = { id: job.id, data: result };
        finishedJobs.push(finishedJob);
        eventEmitter.emit("jobFinished", finishedJob);
      })
      .catch((err) => {
        job.retries = job.retries || 0;

        if (job.retries < config.maxRetries) {
          job.retries++;
          jobQueue.push(job);
        } else {
          const failedJob = { ...job, error: err };
          delete failedJob.cb;
          failedJobs.push(failedJob);
          eventEmitter.emit("jobFailed", failedJob);
        }
      })
      .finally(() => {
        activeWorkersCount--;
        execute();
      });
  }

  function execute() {
    if (
      activeWorkersCount !== config.maxWorkers &&
      jobQueue.length &&
      status === "active"
    ) {
      const job = jobQueue.shift();
      if (job) {
        processJob(job);
      }
    }
  }

  function stop() {
    status = "stopped";
    eventEmitter.emit("queueStopped");
  }

  function resume() {
    status = "active";
    execute();
    eventEmitter.emit("queueResumed");
  }

  function getStatus() {
    return {
      queuedJobs: jobQueue.length,
      finishedJobs: finishedJobs.length,
      failedJobs: failedJobs.length,
    };
  }

  return {
    scheduleJob,
    eventEmitter,
    stop,
    resume,
    getStatus,
  };
}
