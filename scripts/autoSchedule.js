import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import dayjs from "dayjs";
import minimist from "minimist";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jobQueuePath = path.resolve(__dirname, "../data/jobQueue.json");
const logPath = path.resolve(__dirname, "../data/post-log.json");

const SCHEDULE_HOURS = [9, 12, 15, 18];

const loadJobs = async () => {
  const data = await fs.readFile(jobQueuePath, "utf-8");
  return JSON.parse(data);
};

const loadLog = async () => {
  try {
    const data = await fs.readFile(logPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveLog = async (log) => {
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
};

const runJob = ({ city, type, scheduledAt }) => {
  return new Promise((resolve, reject) => {
    const args = ["src/main/index.js", "-c", city, "-t", type, "--scheduledAt", scheduledAt];
    const child = spawn("node", args, { stdio: "inherit" });

    child.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`작업 실패 (exit code ${code})`));
    });
  });
};

const main = async () => {
  const argv = minimist(process.argv.slice(2));
  const startDate = dayjs(argv.start);
  if (!startDate.isValid()) {
    console.error("❌ 시작 날짜를 YYYY-MM-DD 형식으로 입력해주세요. 예: --start 2025-04-10");
    process.exit(1);
  }

  const jobs = await loadJobs();
  const log = await loadLog();
  const completed = new Set(log.map((j) => j.index));

  let currentDate = startDate;
  let hourIndex = 0;

  for (let i = 0; i < jobs.length; i++) {
    if (completed.has(i)) continue;

    const { city, type } = jobs[i];
    const hour = SCHEDULE_HOURS[hourIndex];
    const scheduled = currentDate.hour(hour).minute(0).second(0).millisecond(0);
    const scheduledAt = scheduled.toISOString(); // 워드프레스에 사용

    console.log(`\n📌 [${i}] 예약: ${city} (${type}) → ${scheduled.format("YYYY-MM-DD HH:mm")}`);

    try {
      await runJob({ city, type, scheduledAt });
      log.push({ index: i, city, type, scheduledAt, status: "success" });
    } catch (err) {
      console.error(`❌ 실패: ${city} (${type})`);
      log.push({ index: i, city, type, scheduledAt, status: "failed", error: err.message });
    }

    await saveLog(log);

    // 다음 시간 계산
    hourIndex++;
    if (hourIndex >= SCHEDULE_HOURS.length) {
      hourIndex = 0;
      currentDate = currentDate.add(1, "day");
    }
  }

  console.log("\n✅ 모든 예약 작업이 완료되었습니다.");
};

main();
