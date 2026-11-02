// 한국관광공사 TourAPI (국문 관광정보 서비스 KorService2)
const BASE = 'https://apis.data.go.kr/B551011/KorService2';

export async function searchTour({ keyword = '', contentTypeId = '12', rows = 10 } = {}) {
  if (!process.env.DATA_GO_KR_KEY) throw new Error('공공데이터 인증키가 없습니다. DATA_GO_KR_KEY를 설정해 주세요.');
  const params = new URLSearchParams({
    serviceKey: process.env.DATA_GO_KR_KEY, // ★ Decoding 키
    MobileOS: 'ETC',
    MobileApp: 'JejuIP',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    lDongRegnCd: '50', // 제주특별자치도 법정동 지역코드
  });
  if (contentTypeId) params.set('contentTypeId', contentTypeId);
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2';
  if (keyword) params.set('keyword', keyword);

  const r = await fetch(`${BASE}/${op}?${params}`, {signal: AbortSignal.timeout(12000)});
  if (!r.ok) throw new Error('공공데이터 서버 오류: ' + r.status);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('TourAPI 응답이 JSON이 아님: ' + text.slice(0, 120)); }

  if (data?.response?.header?.resultCode && !['00','0000'].includes(data.response.header.resultCode)) throw new Error(data.response.header.resultMsg || 'API 조회 실패');
  const item = data?.response?.body?.items?.item;
  const list = !item ? [] : Array.isArray(item) ? item : [item];
  return list.map((p) => ({
    id: p.contentid, title: p.title, addr: p.addr1,
    image: p.firstimage, lng: p.mapx, lat: p.mapy, type: p.contenttypeid,
  }));
}
