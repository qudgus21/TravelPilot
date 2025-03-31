import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Handlebars from "handlebars";

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const compileTemplate = ({ title, cityIntro, ResultHotelsData }) => {
  const templatePath = path.resolve(__dirname, "template.hbs"); // 💡 현재 파일 기준으로 경로 설정
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

  return template({ title, cityIntro, ResultHotelsData });
};
