import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Initialize cron jobs
const crons = cronJobs();

// Task to delete any old files marked for deletion
crons.interval(
  "delete any old files marked for deletion",
  { minutes: 2 },
  internal.files.deleteAllFiles
);

export default crons;
