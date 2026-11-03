import {useEffect} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useCartStore} from '../store/useCartStore'
export default function CartNotice(){
  const text=useCartStore(s=>s.addedNotice)
  const dismiss=useCartStore(s=>s.dismissAdded)
  const {pathname}=useLocation()
  useEffect(()=>{if(pathname==='/cart')dismiss()},[pathname,dismiss])
  if(!text||pathname==='/cart')return null
  return <aside className="collection-notice basket-added-notice" aria-label="장바구니 담기 결과">
    <p role="status"><i className="bi bi-bag-check" aria-hidden="true"/> {text}</p>
    <div><Link className="btn btn-dark" to="/cart" onClick={dismiss}>장바구니 보기</Link><button type="button" className="notice-close" onClick={dismiss} aria-label="장바구니 알림 닫기">×</button></div>
  </aside>
}
