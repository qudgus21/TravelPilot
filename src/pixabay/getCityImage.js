import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getCityImage(cityName) {
  try {
    const baseUrl = process.env.PIXABAY_API_URL.replace(/\/+$/, "");
    const apiKey = process.env.PIXABAY_API_KEY;

    const url = `${baseUrl}/?key=${apiKey}&q=${encodeURIComponent(
      cityName
    )}&image_type=photo&orientation=horizontal`;

    console.log("🔍 Pixabay 요청 URL:", url);

    const response = await axios.get(url);
    const imageUrl = response.data?.hits?.[0]?.largeImageURL;

    if (!imageUrl) {
      console.warn(`❗Pixabay 이미지 없음: ${cityName}`);
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error(
      "❌ Pixabay 이미지 가져오기 실패:",
      error.response?.data || error.message
    );
    return null;
  }
}
