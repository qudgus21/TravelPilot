import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//카테고리 받아오기
const getCategoryIdByName = async (categoryName) => {
  try {
    const res = await axios.get(`${process.env.WP_API}/wp/v2/categories?search=${encodeURIComponent(categoryName)}`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64"),
      },
    });

    const matched = res.data.find((cat) => cat.name === categoryName);
    if (!matched) {
      throw new Error(`카테고리 "${categoryName}"를 찾을 수 없습니다.`);
    }

    return matched.id;
  } catch (err) {
    console.error("❌ 카테고리 ID 조회 실패:", err.response?.data || err.message);
    return null;
  }
};

// 🔽 이미지 다운로드 후 워드프레스에 업로드
const uploadFeaturedImageFromUrl = async (title, imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const sanitize = (str) =>
      str
        .normalize("NFKD") // 한글 → 초성 분리 등 유니코드 정리
        .replace(/[^\w\s-]/g, "") // 특수문자 제거
        .replace(/\s+/g, "-") // 공백은 하이픈으로
        .toLowerCase();

    const fileName = `${sanitize(title)}.jpg`;

    const uploadRes = await axios.post(`${process.env.WP_API}/wp/v2/media`, response.data, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64"),
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

    return uploadRes.data.id;
  } catch (error) {
    console.error("❌ 대표 이미지 업로드 실패:", error.response?.data || error.message);
    return null;
  }
};

// 🔼 이 함수로 글 작성 시 featured_media 포함
export const postToWordpress = async ({ html, title, imageUrl, categoryName = "여행", cityName }) => {
  try {
    const categoryId = await getCategoryIdByName(categoryName);

    //이미지 업로드 필요시
    //const mediaId = await uploadFeaturedImageFromUrl(title, imageUrl);

    const postBody = {
      title,
      content: html,
      categories: [categoryId],
      // status: "publish",
      status: "draft",

      // ✅ Rank Math SEO 메타 필드 추가
      meta: {
        rank_math_title: title,
        rank_math_description: "수천 명의 여행자가 선택한, 믿을 수 있는 여행 정보",
        rank_math_focus_keyword: `${cityName} 숙소 추천`,
      },
    };

    const res = await axios.post(`${process.env.WP_API}/wp/v2/posts`, postBody, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64"),
        "Content-Type": "application/json",
      },
    });

    console.log(`✅ 블로그 포스팅 완료! 링크: ${res.data.link}`);
  } catch (err) {
    if (err.response) {
      console.error("❌ 포스팅 실패:", err.response.data);
    } else {
      console.error("❌ 요청 실패:", err.message);
    }
  }
};
