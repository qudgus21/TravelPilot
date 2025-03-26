import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { fileURLToPath } from "url";

// ESM에서 __dirname 흉내내기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.resolve(__dirname, "../../data/hotels.csv");
const outputFile = path.resolve(__dirname, "../../data/cities.json");

const cityNameToId = {};

fs.createReadStream(inputFile)
  .pipe(csvParser())
  .on("data", (row) => {
    const rawCityName = row.city?.trim();

    const cityId = row.city_id;

    const cityName = rawCityName?.replace(/\s*\([^)]*\)/g, "").trim();

    if (cityName && cityId && !cityNameToId[cityName]) {
      cityNameToId[cityName] = parseInt(cityId, 10);
    }
  })
  .on("end", () => {
    fs.writeFileSync(
      outputFile,
      JSON.stringify(cityNameToId, null, 2),
      "utf-8"
    );
    console.log(`✅ JSON 저장 완료: ${outputFile}`);
  })
  .on("error", (err) => {
    console.error("❌ 에러 발생:", err);
  });
