import { Link } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAppStore } from '../store/useAppStore'
import { useSessionStore } from '../store/useSessionStore'
import { benefitToPlace, formatBenefitDate, temporaryClosure } from '../lib/benefits'
export default function BenefitCard({ benefit:b, visitDate='' }) {
  const saved = useAppStore(s => s.saved)
  const toggle = useAppStore(s => s.toggle)
  const inCart=useCartStore(s=>s.ids.includes(b.id))
  const addToCart=useCartStore(s=>s.add)
  const active = saved.some(p => p.id === b.id)
  const blocked=useAppStore(s=>!!s.collectionBusy||!s.collectionReady)
  const changing=useSessionStore(s=>s.changing)
  const closure = temporaryClosure(b, visitDate)
  const saving = b.regular_price-b.resident_price
  return <article className="place-card benefit-card">
    <div className="card-art" style={{background:b.color}}><i className={'bi bi-'+b.icon}/><span>{b.region} · {b.area}</span><b className="benefit-label">성인 도민 50% 감면</b></div>
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center"><small className="eyebrow">{b.space_type}</small><button className={'save '+(active?'active':'')} disabled={blocked||changing} onClick={()=>toggle(benefitToPlace(b))} aria-label={b.name+(active?' 저장 취소':' 저장')} aria-pressed={active}><i className={'bi bi-'+(active?'bookmark-fill':'bookmark')}/></button></div>
      <h3>{b.name}</h3>
      <div className="benefit-prices"><s>{b.regular_price.toLocaleString()}원</s><strong>{b.resident_price.toLocaleString()}원</strong><span>{saving.toLocaleString()}원 절약</span></div>
      <small className="benefit-basis">성인 {b.adult_min_age}~{b.adult_max_age}세 · 1인 입장료 기준</small>
      <p className="benefit-eligibility">{b.eligibility}</p>
      <details><summary>적용 조건 · 증빙 · 휴관 확인</summary>
        <dl><dt>증빙서류</dt><dd>{b.documents}</dd><dt>요금 근거</dt><dd>{b.price_basis}</dd><dt>이용 시 참고</dt><dd>{b.notes}</dd><dt>유효기간</dt><dd>{formatBenefitDate(b.valid_from)} ~ {formatBenefitDate(b.valid_until)}</dd><dt>정기휴관</dt><dd>매주 월요일. 공휴일 예외 및 설·추석 등은 공식 안내에서 확인하세요.</dd></dl>
      </details>
      {(b.closures || []).map(c=><div key={c.from} className={'benefit-closure '+(closure===c?'is-closed':'')} role={closure===c?'status':undefined}><i className="bi bi-exclamation-circle me-1"/>{formatBenefitDate(c.from)}~{formatBenefitDate(c.until)} {c.label} <a href={c.source_url} target="_blank" rel="noreferrer">공지 확인</a></div>)}
      {visitDate && new Date(visitDate+'T12:00:00+09:00').getUTCDay()===1 && <p className="benefit-closure">선택일은 월요일입니다. 공휴일 예외를 제외하면 정기휴관일이므로 방문 전 확인하세요.</p>}
      {closure && <p className="benefit-closure is-closed">선택일에는 본관 이용이 불가합니다. 다른 장소나 날짜를 선택해 주세요.</p>}
      <div className="benefit-source"><a href={b.source_url} target="_blank" rel="noreferrer">공식 관람안내 <i className="bi bi-box-arrow-up-right"/></a><small>확인일 {formatBenefitDate(b.verified_on)}</small></div>
      <div className="benefit-cart-action">{inCart?<Link className="btn btn-outline-dark" to="/cart" aria-label={b.name+' 장바구니에서 보기'}><i className="bi bi-check2 me-2"/>장바구니에서 보기</Link>:<button className="btn btn-dark" onClick={()=>addToCart(b.id,b.name)} aria-label={b.name+' 나들이에 담기'}><i className="bi bi-bag-plus me-2"/>나들이에 담기</button>}</div>
    </div>
  </article>
}
