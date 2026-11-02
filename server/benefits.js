export function validateBenefitInput(input = {}) {
  const { keyword='',region='',area='',visitDate='',maxPrice,rows=8 } = input
  for (const value of [keyword,region,area]) if (typeof value !== 'string' || value.length>100) throw new Error('검색 조건은 100자 이내 문자열이어야 합니다.')
  if (visitDate && (typeof visitDate!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || Number.isNaN(Date.parse(visitDate+'T00:00:00Z')) || new Date(visitDate+'T00:00:00Z').toISOString().slice(0,10)!==visitDate)) throw new Error('방문일은 실제 날짜 YYYY-MM-DD 형식이어야 합니다.')
  const price = maxPrice === undefined || maxPrice === '' ? null : Number(maxPrice)
  if (price !== null && (!Number.isFinite(price) || price<0)) throw new Error('예산은 0 이상의 숫자여야 합니다.')
  return {keyword,region,area,visitDate,maxPrice:price,rows:Math.max(1,Math.min(10,Math.trunc(Number(rows))||8))}
}

export function selectResidentBenefits(data,input={}) {
  const q=validateBenefitInput(input)
  return data.filter(b=>(!q.keyword || (b.name+' '+b.eligibility+' '+b.area).includes(q.keyword)) && (!q.region || b.region===q.region) && (!q.area || b.area===q.area) && (q.maxPrice===null || (Number.isFinite(b.resident_price) && b.resident_price<=q.maxPrice))).slice(0,q.rows).map(b=>{
    const closures=(b.closures||[]).filter(c=>q.visitDate && q.visitDate>=c.from && q.visitDate<=c.until)
    const valid=(!b.valid_from || !q.visitDate || q.visitDate>=b.valid_from) && (!b.valid_until || !q.visitDate || q.visitDate<=b.valid_until)
    const monday=q.visitDate && new Date(q.visitDate+'T12:00:00Z').getUTCDay()===b.closed_weekday
    return {id:b.id,name:b.name,region:b.region,area:b.area,space_type:b.space_type,
      regular_price:b.regular_price,resident_price:b.resident_price,currency:'KRW',
      price_scope:'성인 '+b.adult_min_age+'~'+b.adult_max_age+'세 1인 입장료만 해당. 교통·식사·체험·특별전 비용 미포함.',
      price_basis:b.price_basis,eligibility:b.eligibility,documents:b.documents,notes:b.notes,
      source_url:b.source_url,verified_on:b.verified_on,valid_from:b.valid_from,valid_until:b.valid_until,
      validity_note:!b.valid_until?'유효기간 별도 미명시. 확인일 기준 조사 자료이며 실시간 요금 확인이 아님.':'공식 안내 및 방문일 재확인 필요',
      requested_date:q.visitDate||null,matching_closures:closures,
      visit_status:!q.visitDate?'date_not_provided':!valid?'outside_benefit_period':closures.length?'temporary_closed':monday?'regular_closure_check_holiday_exception':'opening_not_verified',
      visit_note:monday?'정기휴관 요일과 일치. 공휴일 예외 및 대체휴관을 확인해야 합니다.':'명시된 임시휴관이 없더라도 영업을 확정하지 마세요.',
      data_source:'Supabase resident_benefits'}
  })
}

export async function searchResidentBenefits(input={}) {
  validateBenefitInput(input)
  const url=process.env.VITE_SUPABASE_URL
  const key=process.env.VITE_SUPABASE_ANON_KEY
  if(!url || !key) throw new Error('혜택 DB 연결 설정이 필요합니다.')
  const endpoint=new URL('/rest/v1/resident_benefits',url)
  endpoint.search=new URLSearchParams({select:'*',order:'name.asc',limit:'50'}).toString()
  const response=await fetch(endpoint,{headers:{apikey:key},signal:AbortSignal.timeout(10000)})
  if(!response.ok) throw new Error('혜택 DB 조회 실패. 할인을 확인할 수 없습니다.')
  const data=await response.json()
  if(!Array.isArray(data)) throw new Error('혜택 DB 응답 형식이 잘못됐습니다.')
  return selectResidentBenefits(data,input)
}
