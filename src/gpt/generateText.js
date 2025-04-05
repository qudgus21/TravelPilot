import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 블로그 제목 생성
export async function generatePostTitle({ city, topic, concept }) {
  const prompt = `
  당신은 여행 블로그의 글 제목을 짓는 전문가입니다.

  [목적]
  - 아래 정보를 참고하여, 검색이나 SNS에서 클릭하고 싶어질 만큼 매력적인 **블로그 글 제목 1개**를 작성해주세요.
  - 이 제목은 여행 블로그에서 도시, 숙소, 여행 컨셉에 맞는 글의 제목으로 사용됩니다.

  [입력 정보]
  - 도시: ${city}
  - 주제: ${topic}
  - 컨셉: ${concept || "없음"}

  [작성 조건]
  - 제목은 하나의 자연스러운 문장으로 구성해주세요.
  - 길이는 약 30~45자 이내가 이상적입니다.
  - 제목 내에 "TOP 5", "TOP 10" 등 숫자 표현은 절대 포함하지 마세요.
  - 글머리 기호나 숫자 표기 ("1.", "-", "✓" 등) 없이 **제목 텍스트만 단독으로** 작성해주세요.
  - 과장된 광고 문구보다는, 구체적이고 독자의 상황이나 감정에 공감할 수 있는 표현을 사용해주세요.

  [예시]
  오사카 도톤보리 근처, 알뜰하게 머물 수 있는 호텔 리스트
  혼자 여행 간다면 여기! 후쿠오카 조용한 숙소
  교토 감성 가득한 저녁, 분위기 좋은 숙소만 모았어요
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.75,
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content.trim();
  } catch (error) {
    console.error("GPT 응답 실패:", error);
    return "❌제목을 생성하는 데 실패했습니다.";
  }
}

// 도시 설명 생성
export async function generateCityIntro(cityName, title) {
  const prompt = `
  당신은 여행 블로그 에디터입니다.

  아래 조건에 맞는 도시 소개 글을 작성해주세요.
  ※ 숙소나 호텔 이름, 숙소 리스트, "TOP 5", "TOP 10" 등 블로그식 제목 표현은 절대 포함하지 마세요.

  [목적]
  - 이 글은 숙소를 소개하기 전에, 여행자가 도시의 분위기와 특징을 미리 이해할 수 있도록 돕기 위한 콘텐츠입니다.

  [조건]
  - 도시 이름: "${cityName}"
  - 글 제목: "${title}"
  - 대상 독자: 숙소를 고르기 전에 도시 분위기와 위치, 특징 등을 알고 싶은 여행자
  - 길이: 약 2문단

  [스타일 및 문체 가이드]
  - 문체는 따뜻하고 설명하는 말투이며, 문장은 반드시 "~입니다", "~합니다"로 끝나는 정중한 설명체를 사용해주세요.
  - 글의 도입은 도시 이름으로 직접 시작하지 말고, 자연스럽고 부드러운 흐름으로 시작해주세요.
  - 너무 시적이거나 추상적인 표현은 피하고, 여행자가 실제로 도움이 될 수 있는 구체적인 정보 위주로 작성해주세요.
  - 도시의 분위기, 위치, 거리나 지역의 느낌, 주변 환경 등을 자연스럽게 녹여주세요.
  - 명소는 2~3개 이내로만 자연스럽게 언급해주세요.
  - 숙소, 호텔, 숙소 리스트, 블로그 스타일의 숫자 표현("TOP 5", "TOP 10")은 절대 포함하지 마세요.
  - “글 제목: …”과 같은 표현도 본문에 포함하지 말아주세요.
  - 문장은 짧고 명확하게 작성하며, 콤마(,)는 과하게 사용하지 마세요.

  [마무리]
  - 글의 마지막 문장은 자연스럽게 숙소 소개로 이어지도록 마무리해주세요.
  `;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      // model: "gpt-3.5-turbo",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content.trim();
  } catch (error) {
    console.error("GPT 응답 실패:", error);
    return "❌숙소 설명을 생성하는 데 실패했습니다.";
  }
}

// 숙소 설명 생성
export async function generateHotelDescription(hotel) {
  const prompt = `
  당신은 여행 블로그 에디터입니다.

  [목적]
  아래 숙소 정보를 바탕으로, 여행 블로그 스타일의 소개 문장을 작성해주세요.
  독자가 숙소를 선택할 때 참고할 수 있도록 따뜻하면서도 신뢰감 있게 전달하는 설명글이 필요합니다.

  [입력 정보]
  - 숙소 이름: ${hotel.hotelName}
  - 도시: ${hotel.cityName}
  - 숙소 기본 설명: ${hotel.description}
  - 편의시설: ${hotel.amenities.join(", ")}

  [작성 조건 및 문체 가이드]
  - 문장은 5~7문장 이내로 구성해주세요.
  - 문체는 따뜻하고 정중한 설명체로, “~입니다”, “~합니다”로 끝나는 문장을 사용해주세요.
  - 실제 여행자가 참고할 수 있도록 정보 전달 중심의 글로 작성해주세요.
  - 광고처럼 과장된 표현은 절대 사용하지 마세요.
  - 가격이나 숫자 정보보다는 숙소의 분위기, 위치, 주변 환경, 서비스의 특징 등을 중심으로 설명해주세요.
  - 무료 WIFI에 대한 내용은 포함하지 마세요.
  - “두 명의 여행자에게 적합” 같은 표현은 사용하지 마세요. 대상 지정 없이 일반적인 설명으로 작성해주세요.

  [자연스럽게 반영하면 좋은 요소]
  - 숙소의 위치와 주변 환경
  - 객실 분위기나 인테리어 특징
  - 제공되는 주요 서비스 (예: 조식, 수영장 등)
  - 이용 시 느껴지는 인상, 객관적인 장점
  - GPT가 알고 있는 브랜드나 지역 특성 정보도 포함 가능
  - 필요한 경우, 신뢰할 수 있을 만큼 자연스러운 가상의 정보도 활용 가능합니다
  `;

  try {
    const res = await openai.chat.completions.create({
      // model: "gpt-4",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content.trim();
  } catch (error) {
    console.error("GPT 응답 실패:", error);
    return "❌숙소 설명을 생성하는 데 실패했습니다.";
  }
}
