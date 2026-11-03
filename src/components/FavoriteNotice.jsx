import { useAppStore } from '../store/useAppStore'
export default function FavoriteNotice(){
  const notice=useAppStore(s=>s.favoriteNotice)
  const undo=useAppStore(s=>s.favoriteUndo)
  const busy=useAppStore(s=>s.collectionBusy)
  const restore=useAppStore(s=>s.undoFavorite)
  const dismiss=useAppStore(s=>s.dismissFavoriteNotice)
  if(!notice)return null
  return <aside className={'collection-notice '+notice.kind} aria-label="보관함 처리 결과">
    <p role={notice.kind==='error'?'alert':'status'}>{notice.text}</p>
    <div>
      {undo&&<button type="button" className="btn btn-outline-dark" disabled={!!busy} onClick={restore}>{busy==='undo'?'되돌리는 중…':'되돌리기'}</button>}
      <button type="button" className="notice-close" disabled={!!busy} aria-label="보관함 알림 닫기" onClick={dismiss}>×</button>
    </div>
  </aside>
}
