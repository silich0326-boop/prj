# 제주 스토리

제주의 문화·자연에서 콘텐츠 IP 아이디어를 발견하는 Vite + React 앱입니다. 기본 콘텐츠와 3D 지도는 키 없이 동작하며 공공데이터 및 AI는 실제 서버 연결 후 사용할 수 있습니다.

## 실행

Node.js 설치 후 이 폴더에서 `npm install`, `npm run dev`를 실행하고 표시되는 localhost 주소로 접속하세요. Windows에서는 `start.cmd`를 더블클릭할 수 있습니다. **index.html 더블클릭으로는 실행되지 않습니다.**

## 단계별 확인

1. 홈 화면, 탐색 검색/분류, 보관함 저장과 새로고침 후 유지 확인
2. `.env.example`을 `.env.local`로 복사하여 Supabase URL과 anon key 입력
3. Supabase SQL Editor에서 `supabase/schema.sql` 실행, Anonymous Sign-ins 활성화
4. 서버 재시작 후 `/settings`에서 DB 조회 확인, 보관함에서 DB 업로드 확인
5. `/map`에서 회전·확대·핀 선택 확인
6. 공공데이터포털 TourAPI 및 기상청 단기예보 활용신청 후 Decoding 키를 DATA_GO_KR_KEY에 입력
7. 탐색의 관광정보·국가유산 조회, 연결 설정의 날씨 조회 확인
8. ANTHROPIC_API_KEY 및 계정에서 사용 가능한 ANTHROPIC_MODEL 설정 후 AI 질문과 도구 호출 결과 확인

키를 설정할 때마다 개발 서버를 다시 시작합니다. 국가유산 API는 키가 필요 없습니다. 외부 API의 이용 승인·정책·네트워크 상태에 따라 호출 결과가 달라질 수 있습니다.

## 구조

- src/main.jsx: React 진입점
- src/App.jsx: 최상위 오류 처리 및 BrowserRouter
- src/router.jsx: 주소별 페이지 구성
- src/layouts/RootLayout.jsx: 공용 메뉴·푸터
- src/pages/: 탐색·지도·AI·보관함·연결 설정
- src/store/useAppStore.js: 즐겨찾기와 메뉴 이동 후 유지되는 AI 대화
- src/api/client.js: 공용 서버 호출
- src/lib/supabase.js: Supabase 공개 연결 설정
- src/scene.jsx: 지연 로딩하는 Three.js 3D 섬과 선택 핀
- src/style.css: Bootstrap 기반 반응형 디자인
- api/: Vercel 서버 함수, 비밀키는 서버에서만 사용
- server/: 관광·기상·유산 도구 함수
- vite.config.js: 로컬 API 미들웨어, npm run dev 하나로 프론트와 API 실행
- supabase/schema.sql: 사용자별 RLS가 적용되는 저장 테이블

경로: /, /explore, /map, /agent, /saved, /settings. Store는 브라우저에 저장하며 DB 업로드는 현재 컬렉션을 추가/갱신합니다. DB에서 불러오기는 현재 로그인 세션의 저장 목록을 조회하여 브라우저 목록과 합칩니다. 조회 결과와 건수를 별도로 표시합니다. 같은 브라우저의 세션을 재사용하며, 다른 브라우저는 별도 익명 사용자이므로 동일 목록을 볼 수 없습니다. 북마크 취소는 브라우저에만 적용되며 DB 삭제는 아직 제공하지 않습니다. 3D 지도와 카드 내용은 에디토리얼 예시이며 실제 API 응답으로 표시하지 않습니다. 지도는 개략적인 일러스트입니다.

## API와 AI

한국관광공사 TourAPI(KorService2), 기상청 단기예보, 국가유산청 검색 API를 사용합니다. AI는 같은 서버 함수를 tool로 호출하고 최대 5회 도구 루프를 수행합니다. 외부 호출 실패는 화면에 표시하며 샘플 결과로 대체하지 않습니다.

## 빌드 및 Vercel

`npm run build` → `npm run preview`로 배포 빌드 화면을 확인합니다. preview는 정적 화면만 제공하므로 API 검증은 dev 또는 Vercel에서 합니다.

GitHub 저장소에 .env.local, node_modules, dist를 제외한 소스를 업로드합니다. Vercel에서 저장소 Import → Framework Vite → 환경변수 등록 → Deploy. vercel.json이 SPA 경로를 처리합니다. 배포 후 /explore 직접 접속과 각 API, DB, AI를 다시 확인하세요.

GitHub URL: https://github.com/silich0326-boop/prj
Vercel URL: https://jeju-local-trip.vercel.app

발표 요약은 docs/presentation.md를 참고하세요.

## 도민 혜택 5곳

공식 관람안내를 2026-11-02 확인한 성인 25~64세 개인 입장료 자료입니다. supabase/resident-benefits.sql을 SQL Editor에서 실행하면 읽기 전용 공개 혜택 테이블과 5개 행이 생성됩니다. 기존 즐겨찾기 데이터는 건드리지 않습니다. /benefits-setup에서 SQL을 복사할 수 있습니다.

홈 및 탐색 화면은 resident_benefits를 조회합니다. 테이블 미설정·연결 실패 시에는 조사 JSON을 표시하고 DB 연결 전임을 명시합니다. DB가 정상 응답한 빈 목록은 빈 목록 그대로 표시합니다. 일반 요금, 도민 요금, 계산 근거, 증빙, 출처, 확인일, 유효기간 미명시 여부를 함께 표시합니다. 현대미술관 본관·박광진관 2026-11-03~05 임시휴관을 반영합니다. 월요일 휴관 및 공휴일 예외는 공식 공지를 확인해야 합니다. DB 조회가 곧 실시간 요금 검증을 뜻하지는 않습니다.

## 최초 배포 검증 2026-11-02

고정 Production 주소에서 비로그인 HTTP 요청 검증: 홈·/explore·/saved 직접 접속 200, 관광 해녀 검색 3건, 제주시 단기예보 6건, 국가유산 관덕정 검색 1건. AI 키는 아직 미설정입니다. 로컬과 배포 주소는 브라우저 저장소 및 익명 로그인 세션이 서로 다르므로 개인 보관함이 자동 공유되지는 않습니다. 공용 혜택 목록은 같은 Supabase 프로젝트에서 조회합니다.

## 구조 정리 및 모바일 점검

390px 화면에서 홈·혜택 보관함·AI 페이지의 가로 넘침 없음, Supabase 혜택 5곳 조회, 혜택 북마크 및 보관함 이동 확인. AI 키 미설정 오류 이후 메뉴 이동을 해도 질문 및 오류 안내가 유지됨을 확인했습니다. 채팅은 Store 메모리에 유지하며 새로고침하면 초기화됩니다. 즐겨찾기 persist 키는 기존 jeju-studio-v2를 유지합니다. 실제 AI 답변과 도구 연속 호출은 키 수령 후 검증합니다.

## AI 도민 혜택 도구

search_resident_benefits는 Supabase resident_benefits를 읽기 전용 조회합니다. 공공 API 3개와 별도의 네 번째 도구입니다. 성인 개인 입장료와 적용 대상·증빙·공식 URL·확인일·유효기간·방문일 휴관 상태를 반환합니다. 실패나 빈 결과는 샘플로 대체하지 않습니다. GET /api/benefits?keyword=해녀 로 AI 키 없이 실제 DB 조회를 확인할 수 있습니다.

LLM 루프는 최대 5회·max_tokens 1024·최근 대화 10개 제한을 유지합니다. 테스트에는 가짜 모델 응답으로 도구 호출 흐름을 확인하며 실제 AI 호출 성공을 뜻하지 않습니다. 키 수령 후 혜택+날씨 연속 조회와 휴관일 회피, 존재하지 않는 혜택 질문을 실제 모델로 검증해야 합니다.
