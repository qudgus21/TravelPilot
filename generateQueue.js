import fs from "fs";
import path from "path";

const cities = [
  "오사카",
  "도쿄",
  "후쿠오카",
  "오키나와",
  "삿포로",
  "나고야",
  "교토",
  "가고시마",
  "구마모토",
  "히로시마",
  "상하이",
  "베이징",
  "홍콩",
  "마카오",
  "타이베이",
  "가오슝",
  "타이중",
  "다낭",
  "하노이",
  "호치민",
  "방콕",
  "파타야",
  "치앙마이",
  "루앙프라방",
  "세부",
  "마닐라",
  "보라카이",
  "쿠알라룸푸르",
  "코타키나발루",
  "싱가포르",
  "발리",
  "자카르타",
  "괌",
  "사이판",
  "하와이",
  "로스앤젤레스",
  "뉴욕",
  "밴쿠버",
  "토론토",
  "시드니",
  "멜버른",
  "브리즈번",
  "오클랜드",
  "파리",
  "로마",
  "런던",
  "취리히",
  "뮌헨",
];

const types = ["추천", "가족", "나홀로", "커플", "가성비"];

const jobList = [];

for (const city of cities) {
  for (const type of types) {
    jobList.push({ city, type });
  }
}

for (let i = jobList.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [jobList[i], jobList[j]] = [jobList[j], jobList[i]];
}

const outputPath = path.resolve("./data/jobQueue.json");
fs.writeFileSync(outputPath, JSON.stringify(jobList, null, 2), "utf-8");

console.log(`✅ jobQueue.json 생성 완료 (셔플됨, ${jobList.length}개)`);
