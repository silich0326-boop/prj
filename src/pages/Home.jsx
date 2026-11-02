import { Suspense, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ResidentBenefits from '../components/ResidentBenefits'

export default function Home({ places, Scene }) {
  const navigate = useNavigate()
  const [region, setRegion] = useState('제주 전역')
  const [companion, setCompanion] = useState('혼자')
  const [space, setSpace] = useState('상관없음')
  const [budget, setBudget] = useState('예산 미정')
  function plan(e) {
    e.preventDefault()
    const prompt = region + '에서 ' + companion + ' 나들이하려고 해. 공간은 ' + space + ', 예산은 ' + budget + '이야. 제주 문화·여가 장소 중 확인된 도민 혜택이 있는 곳을 우선 추천해줘. 할인 출처와 적용 조건이 확인되지 않으면 확인 필요라고 알려줘.'
    navigate('/agent', { state: { prompt } })
  }
  const suggestions = [
    ['cloud-rain', '비 오는 날에도', '아이와 갈 실내 문화 공간', '비 오는 주말에 아이와 갈 제주 실내 문화 공간을 찾아줘. 확인된 도민 혜택과 증빙 조건이 있으면 함께 알려줘.'],
    ['people', '우리 가족 나들이', '함께 즐기는 제주의 문화', '가족과 제주 문화를 체험하고 싶어. 도민 혜택이 확인된 장소를 우선 추천하고 적용 대상과 출처를 알려줘.'],
    ['sun', '가까운 곳부터', '부담 없이 보내는 쉬는 날', '제주시에서 혼자 가볍게 둘러볼 문화 공간을 찾아줘. 도민 혜택이 확인된 곳을 우선하고 미확인 정보는 구분해줘.']
  ]
  return <>
    <section className="hero resident-hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot"/> FOR THE PEOPLE OF JEJU</div>
        <div className="resident-kicker">제주도민을 위한 혜택 우선 여행</div>
        <h1>제주도민이라면,<br/><em>혜택부터 챙기는</em><br/>제주 여행.</h1>
        <p>가까워서 미뤄둔 제주의 문화와 즐길 거리.<br/>나에게 맞는 장소와 도민 혜택을 함께 찾아보세요.</p>
        <div className="d-flex gap-2 flex-wrap">
          <a className="btn btn-dark" href="#resident-plan">내 나들이 조건 고르기 <i className="bi bi-arrow-down"/></a>
          <Link className="btn btn-outline-dark" to="/explore">장소 먼저 둘러보기</Link>
        </div>
        <div className="hero-note"><span>나에게 맞는 조건</span><span>도민 혜택 우선</span><span>출처와 적용 조건 확인</span></div>
      </div>
      <div className="hero-scene">
        <Suspense fallback={<div className="scene-loading">제주섬을 그리고 있어요…</div>}><Scene places={places} onSelect={()=>navigate('/map')}/></Suspense>
        <div className="scene-label"><span>OUR ISLAND, YOUR DAY OFF</span><small>우리 동네 너머, 새로운 하루 · 핀을 눌러 지도 보기</small></div>
        <div className="scene-badge">JEJU LOCAL LIFE</div>
      </div>
    </section>
    <section id="resident-plan" className="resident-plan" aria-labelledby="plan-title">
      <div className="plan-heading"><div><small className="eyebrow">PLAN YOUR DAY</small><h2 id="plan-title">어떤 하루를 보내고 싶으세요?</h2></div><span>선택한 조건을 AI 질문으로 전달해요.</span></div>
      <form onSubmit={plan} className="plan-form">
        <label>어디에서<select value={region} onChange={e=>setRegion(e.target.value)}>{['제주 전역','제주시','서귀포시'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>누구와<select value={companion} onChange={e=>setCompanion(e.target.value)}>{['혼자','친구와','연인과','아이와','부모님과'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>어떤 공간<select value={space} onChange={e=>setSpace(e.target.value)}>{['상관없음','실내 위주','야외 위주'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>1인 예산<select value={budget} onChange={e=>setBudget(e.target.value)}>{['예산 미정','1만 원 이하','3만 원 이하','5만 원 이하'].map(x=><option key={x}>{x}</option>)}</select></label>
        <button className="btn btn-dark" type="submit">AI에게 물어보기 <i className="bi bi-arrow-up-right"/></button>
      </form>
      <p className="plan-note"><i className="bi bi-info-circle"/> 아래에서 공식 안내로 확인한 도민 입장료를 비교할 수 있습니다. AI 추천은 연결 준비 중이며, 전체 여행 예산 충족 여부는 별도 확인이 필요합니다.</p>
    </section>
    <section className="section resident-suggestions">
      <div className="section-title"><div><small className="eyebrow">A LITTLE CLOSER TO HOME</small><h2>이런 나들이는 어때요?</h2></div></div>
      <div className="occasion-grid">{suggestions.map(([icon,title,sub,prompt])=><button key={title} className="occasion-card" onClick={()=>navigate('/agent',{state:{prompt}})}><i className={'bi bi-'+icon}/><span><strong>{title}</strong><small>{sub}</small></span><i className="bi bi-arrow-up-right"/></button>)}</div>
    </section>
    <ResidentBenefits/>
    <section className="resident-promise">
      <div><small className="eyebrow">BENEFITS YOU CAN CHECK</small><h2>혜택만큼 중요한 건,<br/>정확한 이용 조건.</h2><p>확인된 도민 혜택을 우선하고,<br/>불확실한 정보는 확인 필요로 안내합니다.</p></div>
      <div className="promise-list">{[['01','누가 받을 수 있나요?','도민 인정 범위와 동반인 적용 여부'],['02','무엇을 준비하나요?','신분증 등 증빙 서류와 예약 조건'],['03','언제 확인한 정보인가요?','공식 출처, 확인일과 유효기간']].map(([n,t,d])=><div key={n}><span>{n}</span><div><strong>{t}</strong><p>{d}</p></div></div>)}<small>각 혜택 카드에서 공식 출처와 확인일, 적용 조건을 확인하세요.</small></div>
    </section>
  </>
}
