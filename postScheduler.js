import fs from "fs";
import { exec } from "child_process";
import path from "path";

const JOBS_PATH = path.resolve("./data/jobQueue.json");
const LOG_PATH = path.resolve("./data/completedJobs.json");

function loadJobs() {
  const allJobs = JSON.parse(fs.readFileSync(JOBS_PATH, "utf-8"));
  const doneJobs = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf-8")) : [];

  const remaining = allJobs.filter((job) => !doneJobs.some((done) => done.city === job.city && done.type === job.type));

  return { remaining, doneJobs };
}

async function runJob({ city, type }) {
  return new Promise((resolve) => {
    console.log(`🟢 실행 중: ${city}, ${type}`);
    exec(`npm run post -- -c "${city}" -t "${type}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ 오류:`, error.message);
      } else {
        console.log(`✅ 완료: ${city}, ${type}`);
      }
      resolve();
    });
  });
}

async function runScheduler() {
  const { remaining, doneJobs } = loadJobs();
  if (remaining.length === 0) {
    console.log("✅ 모든 작업 완료!");
    return;
  }

  const nextJob = remaining[0];
  await runJob(nextJob);

  doneJobs.push(nextJob);
  fs.writeFileSync(LOG_PATH, JSON.stringify(doneJobs, null, 2), "utf-8");
}

runScheduler();
