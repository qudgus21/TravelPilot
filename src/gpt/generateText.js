import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 도시 설명 생성
export async function generateCityIntro(cityName, title) {
  const prompt = `
  당신은 여행 블로그 에디터입니다.

  아래 조건에 맞는 "도시 소개" 글을 작성해주세요.
  숙소 이름이나 호텔에 대한 언급은 절대 하지 마세요.

  - 도시 이름: "${cityName}"
  - 글 제목: "${title}"
  - 대상 독자: 이 도시에서 숙소를 찾기 전에, 도시에 대해 먼저 알고 싶은 여행자
  - 문체: 따뜻하고 설명하는 말투, 블로그 스타일
  - 길이: 약 2문단
  - 도시 특성: 도시의 분위기나 특징을 GPT가 알고 있는 정보에 기반해 자연스럽게 반영해주세요

  글은 이 도시를 처음 여행하는 사람들이 숙소를 고르기 전에 읽는다는 상황입니다.
  명소 이름은 2~3개 이내로 자연스럽게 언급하고, 감성적인 분위기와 함께 실용적인 정보(도시 분위기, 위치, 주변 환경, 주요 거리나 지역의 특징 등)를 함께 담아주세요.  
  너무 시적인 표현보다는, 여행을 준비하는 사람에게 실질적인 도움이 되는 설명형 문장 위주로 구성해주세요.
  숙소 리스트나 호텔은 언급하지 말고, 도시의 분위기, 장점, 대표적인 장소 위주로만 작성해주세요.
  문장은 "~입니다", "~합니다"로 끝나는 정중한 설명체로 써주세요.
  글 마지막에는 이제 숙소 소개를 시작한다는 문장으로 자연스럽게 이어주세요.
  예) "좋은 평가를 받고 있는 치앙마이 숙소를 지금부터 소개해드릴게요." 또는 "마카오에서 호캉스를 즐기기 좋은 호텔 BEST 10 확인해보세요."
  `;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

  아래 숙소 정보를 참고해서 여행 블로그 스타일의 설명글을 작성해주세요.
  길이는 6~8문장 정도이며, 문체는 따뜻하고 정중한 설명체(“~입니다”, “~합니다”)를 사용해주세요.
  독자가 숙소를 고를 때 참고할 수 있도록 자연스럽고 신뢰감 있는 글로 작성해주세요.
  광고처럼 과장된 표현은 피하고, 실제 여행자가 참고할 수 있도록 정보 전달 중심의 글로 구성해주세요.
  가격이나 숫자보다 숙소의 분위기, 위치, 장점 등을 중심으로 설명해주세요.

  - 숙소 이름: ${hotel.hotelName}
  - 도시: ${hotel.cityName}
  - 숙소 기본 설명: ${hotel.description}
  - 편의시설: ${hotel.amenities.join(", ")}

  다음 요소들을 가능한 자연스럽게 반영해주세요:
  - 숙소의 위치와 주변 환경
  - 객실 분위기나 특징
  - 제공되는 주요 서비스 (조식, 수영장 등)
  - 숙소를 이용했을 때 느낄 수 있는 인상 (객관적인 평가 중심)
  - GPT가 알고 있는 관련 정보(지역 분위기, 브랜드 특징 등)도 자유롭게 포함해도 됩니다.
  - 필요하다면, 유용한 가상의 정보도 포함할 수 있습니다 (단, 자연스럽고 신뢰 가능한 수준에서)
  `;

  try {
    const res = await openai.chat.completions.create({
      //model: "gpt-4",
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
