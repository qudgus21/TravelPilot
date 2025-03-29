//인기숙소 top
import { crawlHotelByName } from "../crawler/crawlHotelPage.js";
import dotenv from "dotenv";
import { fetchHotels } from "../agoda/fetchHotels.js";
import {
  generateCityIntro,
  generateHotelDescription,
} from "../gpt/generateText.js";
import cityMap from "../../data/cities.json" assert { type: "json" };
dotenv.config();

const getCityId = (cityName) => {
  const cityId = cityMap[cityName];
  if (!cityId) {
    throw new Error("❌도시 ID를 찾을 수 없습니다.");
  }

  console.log("cityId: ", cityId);

  return cityId;
};

const getHotelList = async (cityId) => {
  const hotelList = await fetchHotels({ cityId });
  if (!hotelList || hotelList.length === 0) {
    throw new Error("❌호텔 리스트를 가져오지 못했습니다.");
  }
  console.log(`호텔 ${hotelList.length}개 패치`);
  return hotelList;
};

const crawlHotelDetails = async (cityName, hotelList) => {
  const mergedResults = [];

  for (const hotel of hotelList) {
    const { hotelName, hotelId } = hotel;
    console.log(`크롤링 시작: ${hotelId}, ${hotelName}`);

    const detail = await crawlHotelByName(hotelName);
    if (!detail) {
      console.warn(`❌크롤링 실패: ${hotelName}`);
      continue;
    }

    mergedResults.push({
      cityName,
      ...hotel,
      ...detail,
    });

    console.log(`크롤링 성공: ${hotelId}, ${hotelName}`);
  }

  console.log("크롤링 완료:", mergedResults.map((h) => h.hotelName).join(", "));
  return mergedResults;
};

const enrichWithGPT = async (cityName, title, mergedResults) => {
  const cityIntro = await generateCityIntro(cityName, title);
  console.log("\n GPT 도시 설명 \n", cityIntro);

  for (const hotel of mergedResults) {
    let description = await generateHotelDescription(hotel);

    console.log(`\n GPT 숙소 ${hotel.hotelName} 설명 \n`, description);

    hotel.generatedDescription = description;
  }

  return { cityIntro, ResultHotelsData: mergedResults };
};

const run = async () => {
  const cityName = "뉴욕"; // TODO: 실행 시 입력값으로 대체

  // 1. 도시 이름 → cityId 찾기
  const cityId = getCityId(cityName);

  // 2. 호텔 리스트 조회
  const hotelList = await getHotelList(cityId);

  //3. 크롤링
  const mergedResults = await crawlHotelDetails(cityName, hotelList);

  //4. GPT로 인트로, 숙소설명 얻기
  const title = `${cityName} 가성비 숙소 TOP ${mergedResults.length}`;
  const { cityIntro, ResultHotelsData } = await enrichWithGPT(
    cityName,
    title,
    mergedResults
  );

  // const html = compileTemplate({ title, cityIntro, hotels });
};

run();
