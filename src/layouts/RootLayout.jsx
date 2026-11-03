import {useEffect} from 'react'
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom'
import {useAppStore as useStore} from '../store/useAppStore'
import {useCartStore} from '../store/useCartStore'
import Icon from '../components/Icon'
import FavoriteNotice from '../components/FavoriteNotice'
import CartNotice from '../components/CartNotice'
function ScrollTop(){const {pathname,hash}=useLocation();useEffect(()=>{const frame=requestAnimationFrame(()=>{if(hash){document.getElementById(hash.slice(1))?.scrollIntoView()}else window.scrollTo(0,0)});return()=>cancelAnimationFrame(frame)},[pathname,hash]);return null}
export default function RootLayout(){
  const count=useStore(s=>s.saved.length)
  const cartCount=useCartStore(s=>s.ids.length)
  return <><ScrollTop/><header>
    <Link to="/" className="brand"><span className="brand-mark">j.</span> jeju<span className="brand-light">story</span><small>제주도민의 나들이</small></Link>
    <nav aria-label="주 메뉴">{[['/','홈'],['/explore','탐색'],['/map','3D 제주'],['/agent','AI 가이드']].map(([to,label])=><NavLink to={to} end key={to}>{label}</NavLink>)}</nav>
    <div className="header-actions">
      <Link className="collection-link" to="/saved" aria-label="보관함"><Icon name="bookmark"/><span>보관함</span><b>{count}</b></Link>
      <Link className="collection-link" to="/cart" aria-label="나들이 장바구니"><Icon name="bag"/><span>장바구니</span><b>{cartCount}</b></Link>
    </div>
  </header><main><Outlet/></main><div className="app-notices"><FavoriteNotice/><CartNotice/></div><footer>
    <Link className="brand" to="/">jeju story.</Link><span>제주에 사는 당신의 다음 나들이를 위해.</span>
    <Link to="/settings">연결 설정 <Icon name="gear"/></Link><small>출처: 한국관광공사 · 기상청 · 국가유산청</small>
  </footer></>
}
