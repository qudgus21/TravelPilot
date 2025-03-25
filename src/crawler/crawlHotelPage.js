import { chromium } from "playwright";
import dotenv from "dotenv";
dotenv.config();

const SELECTORS = {
  searchInput: 'input.SearchBoxTextEditor[data-selenium="textInput"]',
  searchUl: 'ul.AutocompleteList li[data-selenium="topDestinationListItem"]',
  searchLi: 'li[data-selenium="topDestinationListItem"]',
  searchButton: 'button[data-selenium="searchButton"]',
  hotelLinkSelector: 'li[data-selenium="hotel-item"] a',
};

async function getHotelFullUrl(page, hotelName) {
  return new Promise((resolve) => {
    page.route("**/api/cronos/layout/GetHotCities", async (route, request) => {
      const response = await route.fetch();
      const json = await response.json();

      const recentSearches =
        json.searchHistoryViewModel?.recentSearchList_CityAndHotel || [];

      const match = recentSearches.find((item) =>
        item.resultText.toLowerCase().includes(hotelName.toLowerCase())
      );

      const fullUrl = match?.fullSearchUrl
        ? process.env.AGODA_URL + match.fullSearchUrl
        : null;

      resolve(fullUrl);
      await route.fulfill({ response });
    });
  });
}

export async function crawlHotelByName(hotelName) {
  // 0.브라우저 세팅
  //   const browser = await chromium.launch({ headless: false }); // development
  const browser = await chromium.launch({ headless: true }); // 브라우저 안 보이게(production)
  const page = await browser.newPage();

  try {
    // 1. Agoda 메인 진입
    await page.goto(process.env.AGODA_URL_KR, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // 2. 호텔이름 입력
    await page.waitForSelector(SELECTORS.searchInput);
    await page.fill(SELECTORS.searchInput, hotelName);

    // 3. 호텔 검색(호텔 클릭 두 번해야 다른 모달이 닫힘)
    await page.waitForSelector(SELECTORS.searchUl);
    await page.click(SELECTORS.searchButton);
    await page.waitForTimeout(200);
    await page.click(SELECTORS.searchButton);

    // 4. api 가로채서 주소 얻기
    const hotelUrl = await getHotelFullUrl(page, hotelName);

    if (!hotelUrl) {
      throw new Error("❌ 호텔 URL을 찾지 못했어요.");
    }

    // 4. 상세페이지로 이동
    const [newPage] = await Promise.all([
      page.waitForEvent("popup"),
      page.evaluate((url) => window.open(url, "_blank"), hotelUrl),
    ]);

    // 5. 팝업 페이지 로드 기다리기
    await newPage.waitForLoadState("domcontentloaded");

    await newPage.waitForSelector("p.fHvoAu");
    await newPage.waitForSelector(
      'button[data-element-name="hotel-mosaic-tile"]'
    );
    await newPage.waitForTimeout(1000);

    //6. 필요한 정보 추출
    const result = await newPage.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText.trim() || "";

      const getAllTexts = (selector) =>
        Array.from(document.querySelectorAll(selector))
          .map((el) => el.innerText.trim())
          .filter(Boolean);

      const getImageSrcs = (buttonSelector, imgSelector) =>
        Array.from(document.querySelectorAll(buttonSelector))
          .map((button) => button.querySelector(imgSelector)?.src)
          .filter(Boolean);

      return {
        // ✅ description: <p class="fHvoAu"> 중 가장 첫 번째 텍스트
        description: getText("p.fHvoAu"),

        // ✅ tiles: button[data-element-name="hotel-mosaic-tile"] 내부 img의 src
        tiles: getImageSrcs(
          'button[data-element-name="hotel-mosaic-tile"]',
          "img"
        ),

        // ✅ highlights: 각 div[data-element-name="atf-property-highlight"] > p.keaLUr
        highlights: getAllTexts(
          'div[data-element-name="atf-property-highlight"] p.keaLUr'
        ),

        // ✅ amenities: 각 div[data-element-name="atf-top-amenities-item"] > p.keaLUr
        amenities: getAllTexts(
          'div[data-element-name="atf-top-amenities-item"] p.keaLUr'
        ),
      };
    });

    await browser.close();
    return result;
  } catch (err) {
    await browser.close();
    console.error("❌ 크롤링 실패:", err.message, hotelName);
    return null;
  }
}
