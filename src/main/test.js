import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const WP_URL = process.env.WP_API;
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;

const authHeader = {
  Authorization: "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64"),
};

export const uploadImageFromUrl = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const fileName = `${Date.now()}.jpg`;

    const res = await axios.post(`${WP_URL}/wp/v2/media`, response.data, {
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

const getImageUrlFromMediaId = async (mediaId) => {
  try {
    const res = await axios.get(`${WP_URL}/wp/v2/media/${mediaId}`, {
      headers: authHeader,
    });
    return res.data.source_url;
  } catch (err) {
    console.error("❌ 이미지 URL 조회 실패:", err.response?.data || err.message);
    return null;
  }
};

const run = async () => {
  const imageUrl = "https://cdn.pixabay.com/photo/2019/03/10/18/31/hong-kong-4046913_1280.jpg";
  const mediaId = await uploadImageFromUrl(imageUrl);
  console.log("업로드된 이미지 ID:", mediaId);

  const cityImageFinalUrl = await getImageUrlFromMediaId(mediaId); // ✅ 여기서 실제 이미지 URL 획득

  console.log("cityImageFinalUrl", cityImageFinalUrl);
};

run();
