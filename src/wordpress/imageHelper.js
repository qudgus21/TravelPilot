import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authHeader = {
  Authorization: "Basic " + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64"),
};

// 🔽 이미지 다운로드 후 워드프레스에 업로드
export const uploadImageFromUrl = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const fileName = `${Date.now()}.jpg`;

    const res = await axios.post(`${process.env.WP_API}/wp/v2/media`, response.data, {
      headers: {
        ...authHeader,
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

    console.log("✅ 이미지 업로드 성공:", res.data.source_url);
    return res.data.id;
  } catch (error) {
    console.error("❌ 이미지 업로드 실패:", error.response?.data?.message || error.message);
    return null;
  }
};

//이미지 받아오기
export const getImageUrlFromMediaId = async (mediaId) => {
  try {
    const res = await axios.get(`${process.env.WP_API}/wp/v2/media/${mediaId}`, {
      headers: authHeader,
    });
    return res.data.source_url;
  } catch (err) {
    console.error("❌ 이미지 URL 조회 실패:", err.response?.data || err.message);
    return null;
  }
};
