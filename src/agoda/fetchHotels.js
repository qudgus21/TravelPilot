import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function fetchHotels({ cityId, minPrice, maxPrice }) {
  const payload = {
    criteria: {
      checkInDate: "2025-04-01",
      checkOutDate: "2025-04-02",
      cityId,
      additional: {
        language: "ko-kr",
        currency: "KRW",
        maxResult: 5,
        sortBy: "PriceAsc",
        dailyRate: {
          minimum: minPrice,
          maximum: maxPrice,
        },
        occupancy: {
          numberOfAdult: 2,
          numberOfChildren: 0,
        },
      },
    },
  };

  const res = await axios.post(process.env.AGODA_API_URL, payload, {
    headers: {
      Authorization: process.env.AGODA_API_KEY,
      "Content-Type": "application/json",
    },
  });

  return res.data.results;
}
