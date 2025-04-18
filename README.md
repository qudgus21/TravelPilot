# Travel Pilot

이 프로젝트는 여행 관련 콘텐츠를 자동으로 생성하고 관리하기 위해 만들어졌습니다. 다양한 API와 크롤링을 통해 여행 정보를 수집하고, AI를 활용하여 콘텐츠를 생성합니다.

## 주요 기능

- 여행 관련 이미지 수집 (Unsplash, Pexels, Pixabay)
- 아고다 호텔 정보 크롤링
- AI를 활용한 콘텐츠 생성
- 워드프레스 포스팅 자동화

## 기술

- Node.js
- Axios
- OpenAI API
- Playwright
- Handlebars
- CSV Parser

## 설치 방법

1. 저장소 클론

```bash
git clone [repository-url]
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정
   `.env` 파일을 생성하고 필요한 API 키들을 설정합니다.

## 사용 방법

```bash
npm run post -c [도시명] -t [타입]
```

### 옵션 설명

- `-c` 또는 `--city`: 도시 이름 (필수)
- `-t` 또는 `--type`: 포스팅 타입 (선택, 기본값: "추천")
  - 가능한 타입: "추천", "가족", "나홀로", "커플", "럭셔리", "가성비"

## 작업 순서

1. **도시 ID 찾기**

   - 입력된 도시 이름을 기반으로 아고다의 도시 ID를 찾습니다.

2. **호텔 리스트 조회**

   - 선택된 타입에 따라 호텔 리스트를 조회합니다.
   - 각 타입별로 다른 정렬 기준과 필터가 적용됩니다.

3. **호텔 상세 정보 크롤링**

   - 각 호텔의 상세 정보를 크롤링합니다.
   - 호텔 이름, 위치, 시설, 리뷰 등의 정보를 수집합니다.

4. **어필리에이트 링크 추가**

   - 각 호텔에 대한 아고다 어필리에이트 링크를 생성합니다.
   - 이미지 태그와 텍스트 링크를 모두 생성합니다.

5. **AI 콘텐츠 생성**

   - GPT를 사용하여 다음 내용을 생성합니다:
     - 포스트 제목
     - 도시 소개
     - 각 호텔에 대한 상세 설명

6. **도시 이미지 처리**

   - Pixabay에서 도시 이미지를 검색합니다.
   - 이미지를 워드프레스에 업로드하고 URL을 가져옵니다.

7. **HTML 템플릿 컴파일**

   - 수집된 모든 정보를 HTML 템플릿에 적용합니다.
   - 결과물을 로컬에 저장합니다.

8. **워드프레스 포스팅**
   - 생성된 HTML을 워드프레스에 포스팅합니다.
   - 선택적으로 예약 발행 시간을 설정할 수 있습니다.

## 프로젝트 구조

- `src/`: 소스 코드
  - `main/`: 메인 실행 파일
  - `templates/`: 템플릿 파일들
  - `wordpress/`: 워드프레스 관련 기능
  - `agoda/`: 아고다 크롤링 관련 기능
  - `pixabay/`, `pexels/`, `unsplash/`: 이미지 API 관련 기능
  - `gpt/`: AI 관련 기능
  - `utils/`: 유틸리티 함수
  - `crawler/`: 크롤링 관련 기능
