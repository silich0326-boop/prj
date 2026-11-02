# 첫 Vercel 배포

1. GitHub에 이 폴더의 소스만 올립니다. 참고용·백업 폴더는 제외합니다.
2. Vercel에서 Add New → Project → 해당 GitHub 저장소 Import.
3. Root Directory는 저장소 루트, Framework Vite, Node.js 22.x, Build Command npm run build, Output dist.
4. Environment Variables에 로컬 .env.local의 다음 값을 등록합니다.

| 변수 | 용도 |
|---|---|
| VITE_SUPABASE_URL | Supabase 프로젝트 URL |
| VITE_SUPABASE_ANON_KEY | 공개용 publishable/anon 키 |
| DATA_GO_KR_KEY | 공공데이터 Decoding 키, 서버 전용 |
| ANTHROPIC_API_KEY | 오후에 키를 받으면 등록, 서버 전용 |
| ANTHROPIC_MODEL | 안내서 지정 claude-sonnet-5-5 |

현재 AI 키가 없어도 최초 배포는 가능합니다. 키 추가 후 Redeploy합니다.

## 배포 후 확인

- 고정 Production 주소를 시크릿 창에서 열고 /explore, /saved 직접 접속 및 새로고침
- 관광정보 해녀 검색, 국가유산 관덕정 검색, /settings에서 날씨 조회
- 홈 혜택 목록의 Supabase 조회 완료 확인
- 즐겨찾기 업로드 → DB에서 불러오기
- 다른 브라우저는 새 익명 사용자라 기존 개인 보관함은 보이지 않음
- AI 키 수령 후 네 가지 에이전트 테스트 실행

배포 주소는 실제 배포 후 README에 기록합니다. .env.local은 업로드하지 않습니다.
