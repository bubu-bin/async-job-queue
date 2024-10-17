export default function JobFactory() {
  function createJob() {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * 100));
      }, Math.floor(Math.random() * 1000));
    });
  }

  function createFailedJob() {
    return new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("Job failed");
      }, Math.floor(Math.random() * 1000));
    });
  }

  function makeJobs(cb) {
    setInterval(() => {
      const jobCount = Math.floor(Math.random() * 3);
      const jobType = Math.floor(Math.random() * 2);
      let job;
      for (let i = 0; i < jobCount; i++) {
        switch (jobType) {
          case 0:
            job = createJob();
            break;
          case 1:
            job = createFailedJob();
            break;
          default:
            break;
        }
        cb(job);
      }
    }, 100);
  }

  return { createJob, createFailedJob, makeJobs };
}
