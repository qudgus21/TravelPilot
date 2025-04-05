import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getCityImage(cityName) {
  try {
    const url = `${process.env.PEXELS_API_URL}?query=${encodeURIComponent(
      cityName
    )}&per_page=1`;

    const response = await axios.get(url, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    });

    const photo = response.data?.photos?.[0];
    const imageUrl = photo?.src?.landscape || photo?.src?.large;

    console.log(response.data);

    if (!imageUrl) {
      console.warn(`❗이미지 없음: ${cityName}`);
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error(
      "도시 이미지(Pexels) 가져오기 실패:",
      error.response?.data || error.message
    );
    return null;
  }
}
