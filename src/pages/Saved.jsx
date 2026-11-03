import { useState } from 'react'
import AccountPanel from '../components/AccountPanel'
import { useSessionStore } from '../store/useSessionStore'
import { useAppStore } from '../store/useAppStore'
import { Link } from 'react-router-dom'
import { readFavorites, uploadFavorites, combineFavorites, favoriteUser } from '../lib/favorites'

export default function Saved({ saved, setSaved, getSaved, catalog, db, Card, Heading }) {
  const [statusData, setStatusData] = useState(null)
  const [errorData, setErrorData] = useState(null)
  const [busy, setBusy] = useState('')
  const [queryData, setQueryData] = useState(null)
  const {user,ready,changing,error:sessionError}=useSessionStore()
  const owner=user?.id||null
  const status=statusData?.owner===owner?statusData.text:''
  const error=errorData?.owner===owner?errorData.text:''
  const queried=queryData?.owner===owner?queryData.rows:null
  const setStatus=text=>setStatusData({owner:useSessionStore.getState().user?.id||null,text})
  const setError=text=>setErrorData({owner:useSessionStore.getState().user?.id||null,text})
  const collectionBusy=useAppStore(s=>s.collectionBusy)
  const locked=!!busy||!!collectionBusy||!ready||changing||!!sessionError

  async function run(action) {
    if (locked||!useAppStore.getState().beginCollectionOperation(action)) return
    setBusy(action)
    setStatus('')
    setError('')
    try {
      const actor=await favoriteUser(db)
      if (action === 'load') {
        const rows = await readFavorites(db)
        if(useSessionStore.getState().user?.id!==actor.id)throw new Error('계정이 변경되었습니다. 현재 계정으로 다시 조회해 주세요.')
        setSaved(combineFavorites(getSaved(), rows, catalog))
        setQueryData({owner:actor.id,rows})
        setStatus('Supabase에서 ' + rows.length + '개를 불러왔습니다. 기존 브라우저 보관함과 합쳐 표시합니다.')
      } else {
        await uploadFavorites(db, getSaved())
        if(useSessionStore.getState().user?.id!==actor.id)throw new Error('계정이 변경되었습니다. 현재 계정으로 다시 확인해 주세요.')
        setStatus('현재 보관함을 Supabase에 업로드했습니다. DB에서 불러오기로 조회를 확인해 보세요.')
      }
    } catch (e) {
      setError(e.message || '처리하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setBusy('')
      useAppStore.getState().finishCollectionOperation()
    }
  }

  return <section className="section">
    <Heading sub="YOUR COLLECTION" title="나의 나들이 보관함"
      text="관심 장소를 담고, Supabase에 저장한 장소도 다시 불러오세요."/>
    <AccountPanel disabled={locked}/>
    <div className="d-flex gap-2 flex-wrap mb-3">
      <button className="btn btn-dark" disabled={locked} onClick={() => run('load')}>
        <i className="bi bi-cloud-download me-2"/>{busy === 'load' ? 'DB 조회 중…' : 'DB에서 불러오기'}
      </button>
      <button className="btn btn-outline-dark" disabled={locked || !saved.length} onClick={() => run('upload')}>
        {busy === 'upload' ? '저장 중…' : 'Supabase에 업로드'}
      </button>
    </div>
    <p className="caption">같은 이메일 계정으로 로그인하면 다른 브라우저에서도 업로드한 목록을 조회할 수 있습니다. 비회원 보관함은 해당 브라우저에서만 사용할 수 있습니다. 업로드하지 않은 장소는 브라우저에만 남습니다. 저장 취소 시 현재 계정의 DB에서도 삭제하며, 알림에서 되돌릴 수 있습니다.</p>
    {status && <p role="status" className="alert alert-success">{status}</p>}
    {error && <p role="alert" className="alert alert-warning">{error}</p>}
    {queried !== null && <div className="db-query-result mb-4">
      <strong><i className="bi bi-database-check me-2"/>마지막 DB 조회 결과 · {queried.length}개</strong>
      {queried.length ? <ul>{queried.map(row => <li key={row.item_id}>{row.title}</li>)}</ul> :
        <p>현재 로그인 사용자에게 저장된 장소가 없습니다. 먼저 보관함을 업로드해 주세요.</p>}
    </div>}
    {!ready ? <p role="status">보관함을 확인하고 있습니다…</p> : saved.length ? <div className="cards">{saved.map(p => <Card p={p} key={p.id}/>)}</div> :
      <div className="empty"><i className="bi bi-bookmark"/><h3>다음에 가고 싶은 곳을 담아보세요.</h3>
        <p>이미 DB에 저장했다면 위의 ‘DB에서 불러오기’를 눌러 주세요.</p>
        <Link className="btn btn-dark" to="/explore">콘텐츠 탐색</Link>
      </div>}
  </section>
}
