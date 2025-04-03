import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getCityImage(cityName) {
  try {
    const url = `${process.env.UNSPLASH_API_URL}?query=${encodeURIComponent(
      cityName
    )}&per_page=1`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    const baseUrl = response.data?.results?.[0]?.urls?.raw;

    // 원하는 가로 비율 이미지 생성 (예: 1200x630)
    const imageUrl = `${baseUrl}&w=1200&h=630&fit=crop`;

    return imageUrl || null;
  } catch (error) {
    console.error(
      "도시 이미지 가져오기 실패:",
      error.response?.data || error.message
    );
    return null;
  }
}
