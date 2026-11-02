import { useState } from 'react'
import { Link } from 'react-router-dom'
import BenefitCard from './BenefitCard'
import { useResidentBenefits } from '../hooks/useResidentBenefits'
import { filterBenefits } from '../lib/benefits'
export default function ResidentBenefits() {
  const {rows,source,loading,error,reload} = useResidentBenefits()
  const [keyword,setKeyword] = useState('')
  const [area,setArea] = useState('')
  const [space,setSpace] = useState('')
  const [maxPrice,setMaxPrice] = useState('')
  const [date,setDate] = useState('')
  const filtered = filterBenefits(rows,{keyword,area,space,maxPrice,date})
  return <section className="section resident-places" id="resident-benefits">
    <div className="section-title"><div><small className="eyebrow">BENEFITS FOR JEJU RESIDENTS</small><h2>도민이라면, 이 가격으로.</h2></div><button className="btn btn-outline-dark" disabled={loading} onClick={reload}>{loading?'조회 중…':'혜택 새로고침'}</button></div>
    <p className="section-description">시설 공식 안내에서 확인한 도민 요금입니다. 교통·식비·체험비는 포함하지 않으며, 특별전과 방문일에 따라 달라질 수 있습니다.</p>
    <div role="status" className={'benefit-data-status '+(source==='supabase'?'connected':'')}>
      <i className={'bi bi-'+(source==='supabase'?'database-check':'journal-check')}/>
      {loading ? '혜택 DB를 확인하고 있습니다…' : source==='supabase' ? 'Supabase 조회 완료 · '+rows.length+'곳' : '공식 안내 조사 자료 · DB 연결 전'}
      {!loading && source!=='supabase' && <span>{error} <Link to="/benefits-setup">DB 설정 방법</Link></span>}
    </div>
    <div className="benefit-filters">
      <label>장소 검색<input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="해녀, 미술관…"/></label>
      <label>지역<select value={area} onChange={e=>setArea(e.target.value)}><option value="">전체 지역</option>{[...new Set(rows.map(b=>b.area))].map(a=><option key={a}>{a}</option>)}</select></label>
      <label>공간<select value={space} onChange={e=>setSpace(e.target.value)}><option value="">전체 공간</option><option>실내 중심</option><option>실내·야외</option></select></label>
      <label>성인 도민 입장료<select value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}><option value="">제한 없음</option><option value="1000">1,000원 이하</option><option value="3000">3,000원 이하</option></select></label>
      <label>방문일 확인<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    </div>
    <p className="caption">{filtered.length}곳 · 공간 구분은 시설 구성에 따른 안내이며, 실내 이동만 보장하지 않습니다. 방문일을 고르면 확인된 임시휴관을 안내합니다.</p>
    {filtered.length ? <div className="cards">{filtered.map(b=><BenefitCard key={b.id} benefit={b} visitDate={date}/>)}</div> : <p className="empty">조건에 맞는 혜택이 없습니다.</p>}
  </section>
}
