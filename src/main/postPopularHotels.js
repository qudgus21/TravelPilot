import fs from "fs";
import dotenv from "dotenv";
import minimist from "minimist";
import cityMap from "../../data/cities.json" assert { type: "json" };
import { crawlHotelByName } from "../crawler/crawlHotelPage.js";
import { fetchHotels } from "../agoda/fetchHotels.js";
import {
  generateCityIntro,
  generateHotelDescription,
} from "../gpt/generateText.js";
import {
  createAffiliateImageTag,
  createAffiliateLink,
} from "../agoda/createAffiliateLink.js";
import { compileTemplate } from "../templates/compileHtml.js";
import { getCityImage } from "../unsplash/getCityImage.js";
import { postToWordpress } from "../wordpress/postToWordPress.js";

dotenv.config();

const getCityId = (inputCityName) => {
  // 1. 정확히 일치하는 키 우선
  if (cityMap[inputCityName]) {
    return cityMap[inputCityName];
  }

  // 2. '/로 나눠서 부분 일치 찾기'
  for (const key of Object.keys(cityMap)) {
    const parts = key.split("/").map((s) => s.trim());
    if (parts.includes(inputCityName)) {
      return cityMap[key];
    }
  }

  // 3. 실패 시 에러
  throw new Error(`❌도시 ID를 찾을 수 없습니다: ${inputCityName}`);
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

    console.log(`크롤링 성공: ${hotelId}, ${hotelName} ${detail.tiles}`);
  }

  console.log("크롤링 완료:", mergedResults.map((h) => h.hotelName).join(", "));
  return mergedResults;
};

const getTextByGPT = async (cityName, title, mergedResults) => {
  const cityIntro = await generateCityIntro(cityName, title);
  console.log("\n GPT 도시 설명 \n", cityIntro);

  for (const hotel of mergedResults) {
    let description = await generateHotelDescription(hotel);

    console.log(`\n GPT 숙소 ${hotel.hotelName} 설명 \n`, description);

    hotel.generatedDescription = description;
  }

  return { cityIntro, ResultHotelsData: mergedResults };
};

const addAffiliateLink = (hotels) => {
  return hotels.map((hotel) => ({
    ...hotel,
    affiliateTextLink: createAffiliateLink(hotel.hotelId),
    affiliateImageTag: createAffiliateImageTag(hotel.hotelId, hotel.imageURL),
  }));
};

const run = async () => {
  //0. 커맨드 입력
  const args = minimist(process.argv.slice(2), {
    alias: {
      c: "city",
      t: "type",
    },
    default: {
      type: "가성비",
    },
  });

  const cityName = args.city;
  const type = args.type;

  if (!cityName) {
    console.error("❌ 도시 이름을 입력해주세요. 예: -c 서울");
    process.exit(1);
  }

  //1. 도시 이름 → cityId 찾기
  const cityId = getCityId(cityName);

  //2. 호텔 리스트 조회
  let hotels = await getHotelList(cityId);

  //3. 크롤링
  hotels = await crawlHotelDetails(cityName, hotels);

  //4. 어필리에이트 링크 추가
  hotels = addAffiliateLink(hotels);

  //5. GPT로 도시설명, 인트로 숙소설명 얻기
  const title = `${cityName} 가성비 숙소 TOP ${hotels.length}`;
  const { cityIntro, ResultHotelsData } = await getTextByGPT(
    cityName,
    title,
    hotels
  );

  //6. unsplahs로 도시 사진 얻기
  const cityImageUrl = await getCityImage(cityName);

  //6. html 생성
  const html = compileTemplate({
    title,
    cityIntro,
    ResultHotelsData,
    cityImageUrl,
  });

  const fileName = `${title}_post.html`;
  fs.writeFileSync(`./output/${fileName}`, html, "utf-8");

  //7. 블로그 포스팅
  await postToWordpress(html, title, cityImageUrl);
};
run();
