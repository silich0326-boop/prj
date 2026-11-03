import {Link} from 'react-router-dom'
import Heading from '../components/Heading'
import {useCartStore} from '../store/useCartStore'
import {useResidentBenefits} from '../hooks/useResidentBenefits'
import {estimateCart,MAX_ADULTS} from '../lib/cart'
import {formatBenefitDate} from '../lib/benefits'
const won=value=>value.toLocaleString('ko-KR')+'원'
export default function Cart(){
  const {ids,adults,date,setAdults,setDate,remove,clear,undo,undoIds,notice}=useCartStore()
  const {rows,source,loading,error,reload}=useResidentBenefits()
  const estimate=estimateCart(ids,rows,{adults,date})
  return <section className="section cart-page">
    <Heading sub="PLAN YOUR LOCAL DAY" title="나들이 장바구니"
      text="이번 나들이에 갈 장소를 골라 성인 도민 입장료와 예상 절약액을 비교해 보세요."/>
    <div className="cart-toolbar">
      <Link className="btn btn-outline-dark" to="/explore">장소 더 담기</Link>
      <button className="btn btn-outline-dark" disabled={!ids.length} onClick={clear}>전체 비우기</button>
      <button className="btn btn-outline-dark" disabled={loading} onClick={reload}>{loading?'요금 확인 중…':'요금 새로고침'}</button>
    </div>
    <div className={'benefit-data-status '+(source==='supabase'?'connected':'')} role="status">
      {loading?'입장료 자료를 확인하고 있습니다…':source==='supabase'?'혜택 DB 조회 완료 · '+rows.length+'곳':'공식 안내 조사 자료로 계산 중 · '+error}
      <span>요금은 자료 확인일 기준입니다. 방문 전 공식 안내를 확인하세요.</span>
    </div>
    <form className="cart-options" onSubmit={e=>e.preventDefault()}>
      <label htmlFor="cart-adults">성인 도민 인원 <span>25~64세 · 모든 장소에 동일하게 적용</span>
        <input id="cart-adults" type="number" min="1" max={MAX_ADULTS} step="1" inputMode="numeric" value={adults} onChange={e=>setAdults(e.target.value)}/>
      </label>
      <label htmlFor="cart-date">방문일 <span>선택하면 등록된 휴관·혜택 기간 확인</span>
        <input id="cart-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      </label>
      {date&&<button type="button" className="btn btn-outline-dark" onClick={()=>setDate('')}>방문일 지우기</button>}
    </form>
    <p className="caption">1~{MAX_ADULTS}명까지 개인 입장료로 단순 계산합니다. 아동·고령자·비도민·단체 요금과 교통·식사·체험·주차·특별전 비용은 포함하지 않습니다.</p>
    {notice&&<div className="cart-notice" role="status"><span>{notice}</span>{undoIds.length>0&&<button className="btn btn-outline-dark" onClick={undo}>되돌리기</button>}</div>}
    {!ids.length?<div className="empty">
      <i className="bi bi-bag"/><h3>이번 나들이에 갈 곳을 담아보세요.</h3>
      <p>혜택 카드의 ‘나들이에 담기’를 누르면 여기에서 입장료를 비교할 수 있습니다.</p>
      <Link className="btn btn-dark" to="/explore">도민 혜택 둘러보기</Link>
    </div>:<div className="cart-layout">
      <div className="cart-list" aria-label="선택한 나들이 장소">
        {estimate.entries.map(entry=>{
          const b=entry.benefit
          return <article className="cart-item" key={entry.id} aria-label={b?.name||'정보를 확인할 수 없는 장소'}>
            <div className="cart-item-heading"><div><small>{b?b.region+' '+b.area:'장소 정보 확인 필요'}</small><h2>{b?.name||'등록 정보를 찾을 수 없는 장소'}</h2></div>
              <button className="btn btn-outline-dark" onClick={()=>remove(entry.id)} aria-label={(b?.name||'미확인 장소')+' 장바구니에서 삭제'}>삭제</button>
            </div>
            {loading?<p>요금을 확인하고 있습니다…</p>:entry.issue?<p className="cart-warning">{entry.issue}</p>:<>
              <div className="cart-item-prices"><span>일반 <s>{won(entry.regular)}</s></span><strong>도민 {won(entry.resident)}</strong><span>{won(entry.savings)} 예상 절약</span></div>
              <p className="caption">성인 도민 {adults}명 · 1인 일반 {won(b.regular_price)} / 도민 {won(b.resident_price)}</p>
            </>}
            {b&&<>
              <p className="cart-documents"><strong>증빙</strong> {b.documents}</p>
              {entry.warnings.map(w=><p className="cart-warning" key={w}>{w}</p>)}
              <details><summary>적용 조건과 이용 시 참고</summary><p>{b.eligibility}</p><p>{b.notes}</p></details>
              <div className="cart-item-source"><a href={b.source_url} target="_blank" rel="noopener noreferrer">공식 관람안내 <i className="bi bi-box-arrow-up-right"/></a><span>확인일 {formatBenefitDate(b.verified_on)}</span></div>
            </>}
          </article>
        })}
      </div>
      <aside className="cart-summary" aria-labelledby="cart-summary-title">
        <h2 id="cart-summary-title">예상 입장료 비교</h2>
        <p>담은 장소 {ids.length}곳 · 성인 도민 {adults}명</p>
        {loading?<p role="status">합계를 확인하고 있습니다…</p>:<>
          {estimate.excludedCount>0&&<p className="cart-warning">확인할 수 있는 {estimate.pricedCount}곳의 부분 합계입니다. 휴관·요금 미확인 등 {estimate.excludedCount}곳은 제외했습니다.</p>}
          {!estimate.pricedCount?<p>계산할 수 있는 장소가 없습니다. 방문일이나 담은 장소를 확인해 주세요.</p>:<dl>
            <div><dt>일반 요금 합계</dt><dd data-testid="cart-regular">{won(estimate.regular)}</dd></div>
            <div className="cart-resident-total"><dt>도민 요금 합계</dt><dd data-testid="cart-resident">{won(estimate.resident)}</dd></div>
            <div className="cart-savings"><dt>예상 절약액</dt><dd data-testid="cart-savings">{won(estimate.savings)}</dd></div>
          </dl>}
        </>}
        <p className="caption">예약·결제 없이 비용을 비교하는 장바구니입니다. 각자의 도민 자격과 증빙 조건을 확인해야 하며, 할인 중복 적용과 실제 영업 여부를 보장하지 않습니다.</p>
        <p className="caption">장바구니는 이 브라우저에 저장됩니다. 관심 장소를 계정에 보관하려면 기존 보관함을 이용하세요.</p>
        <Link className="cart-saved-link" to="/saved">관심 장소 보관함 보기</Link>
      </aside>
    </div>}
  </section>
}
