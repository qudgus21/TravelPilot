import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const SORT_OPTIONS = [
  "Recommended",
  "PriceDesc",
  "PriceAsc",
  "StarRatingDesc",
  "StarRatingAsc",
  "AllGuestsReviewScore",
  "BusinessTravellerReviewScore",
  "CouplesReviewScore",
  "SoloTravllersReviewScore",
  "FamiliesWithYoungReviewScore",
  "FamiliesWithTeenReviewScore",
  "GroupsReviewScore",
];

function getDefaultDates() {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 1);

  const format = (date) => date.toISOString().split("T")[0];
  return {
    checkInDate: format(checkIn),
    checkOutDate: format(checkOut),
  };
}

export async function fetchHotels({
  cityId,
  sortBy = "Recommended",
  maxResult = 5,
  numberOfAdult = 2,
  numberOfChildren = 0,
  minPrice = 0,
  maxPrice,
  minimumStarRating = 0,
  minimumReviewScore = 0,
  discountOnly = false,
  language = "ko-kr",
  currency = "KRW",
}) {
  if (!cityId) {
    throw new Error("❌ cityId는 필수입니다.");
  }

  if (!SORT_OPTIONS.includes(sortBy)) {
    throw new Error(`❌ 유효하지 않은 sortBy 값입니다: ${sortBy}`);
  }

  const { checkInDate, checkOutDate } = getDefaultDates();

  const payload = {
    criteria: {
      cityId,
      checkInDate,
      checkOutDate,
      additional: {
        language,
        currency,
        maxResult,
        sortBy,
        occupancy: {
          numberOfAdult,
          numberOfChildren,
        },
        minimumStarRating,
        minimumReviewScore,
        onlyDiscountedProperties: discountOnly,
      },
    },
  };

  if (maxPrice) {
    payload.criteria.additional.dailyRate = {
      minimum: minPrice,
      maximum: maxPrice,
    };
  }

  try {
    const res = await axios.post(process.env.AGODA_API_URL, payload, {
      headers: {
        Authorization: process.env.AGODA_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return res.data.results;
  } catch (error) {
    console.error("❌ 호텔 정보 요청 실패:", error.message);
  }
}
