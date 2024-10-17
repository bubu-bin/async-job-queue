# async-job-queue

Async queue implementation with:
- Configurable number of workers to process jobs in parallel.
- A retry mechanism for failed jobs, up to a configurable number of retries.
- An EventEmitter to emit various job-related events (like job started, finished, or failed).
- Stop and resume functionality to pause and continue job processing at any time without losing the state of the queue.
