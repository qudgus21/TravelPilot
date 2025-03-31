import { chromium } from "playwright";
import dotenv from "dotenv";
dotenv.config();

const SELECTORS = {
  searchInput: 'input.SearchBoxTextEditor[data-selenium="textInput"]',
  searchUl: 'ul.AutocompleteList li[data-selenium="topDestinationListItem"]',
  searchLi: 'span[data-selenium="suggestion-text-highlight"]',
  searchButton: 'button[data-selenium="searchButton"]:has-text("검색하기")',
  hotelLinkSelector: 'li[data-selenium="hotel-item"] a',
};

export async function crawlHotelByName(hotelName) {
  // 0.브라우저 세팅
  //const browser = await chromium.launch({ headless: false }); // development
  const browser = await chromium.launch({ headless: true }); // 브라우저 안 보이게(production)
  const page = await browser.newPage();
  let hotelUrl = "";

  try {
    // 1. Agoda 메인 진입
    await page.goto(process.env.AGODA_URL_KR, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // 2. api 인터셉트 미리 걸어두기
    await page.route("**/api/cronos/layout/GetHotCities", async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      const recentSearches =
        json.searchHistoryViewModel?.recentSearchList_CityAndHotel || [];

      const match = recentSearches.find((item) =>
        item.resultText.toLowerCase().includes(hotelName.toLowerCase())
      );

      hotelUrl = match?.fullSearchUrl
        ? process.env.AGODA_URL + match.fullSearchUrl
        : null;

      await route.continue();
    });

    // 3. 호텔이름 입력
    await page.waitForSelector(SELECTORS.searchInput);
    await page.fill(SELECTORS.searchInput, hotelName);

    // 4. 호텔 검색(호텔 클릭 두 번해야 다른 모달이 닫힘)
    await page.waitForTimeout(300);
    await page.waitForSelector(SELECTORS.searchUl);
    await page.waitForSelector(SELECTORS.searchButton);
    await page.waitForSelector(SELECTORS.searchLi);
    await page.click(SELECTORS.searchLi);
    await page.waitForTimeout(300);
    await page.click(SELECTORS.searchButton);
    await page.waitForTimeout(300);
    await page.click(SELECTORS.searchButton);
    await page.waitForTimeout(3000);

    if (!hotelUrl) {
      throw new Error();
    }

    // 5. 호텔 상세페이지로 이동
    const [hotelPage] = await Promise.all([
      page.waitForEvent("popup"),
      page.evaluate((url) => window.open(url, "_blank"), hotelUrl),
    ]);

    // 6. 호텔 상세페이지 로드 기다리기
    await hotelPage.waitForLoadState("domcontentloaded");

    await hotelPage.waitForSelector("p.fHvoAu");
    await hotelPage.waitForSelector(
      'button[data-element-name="hotel-mosaic-tile"]'
    );
    await hotelPage.waitForTimeout(2000);

    //6. 필요한 정보 추출
    const result = await hotelPage.evaluate(() => {
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
        )
          .slice(1)
          .pop(),

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
    console.error("❌ 크롤링 실패: ", hotelName);
    return null;
  }
}
