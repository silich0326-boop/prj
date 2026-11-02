import { useState } from 'react'
import { Link } from 'react-router-dom'
import { readFavorites, uploadFavorites, combineFavorites } from '../lib/favorites'

export default function Saved({ saved, setSaved, getSaved, catalog, db, Card, Heading }) {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [queried, setQueried] = useState(null)

  async function run(action) {
    if (busy) return
    setBusy(action)
    setStatus('')
    setError('')
    try {
      if (action === 'load') {
        const rows = await readFavorites(db)
        setSaved(combineFavorites(getSaved(), rows, catalog))
        setQueried(rows)
        setStatus('Supabase에서 ' + rows.length + '개를 불러왔습니다. 기존 브라우저 보관함과 합쳐 표시합니다.')
      } else {
        await uploadFavorites(db, getSaved())
        setStatus('현재 보관함을 Supabase에 업로드했습니다. DB에서 불러오기로 조회를 확인해 보세요.')
      }
    } catch (e) {
      setError(e.message || '처리하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setBusy('')
    }
  }

  return <section className="section">
    <Heading sub="YOUR COLLECTION" title="나의 나들이 보관함"
      text="관심 장소를 담고, Supabase에 저장한 장소도 다시 불러오세요."/>
    <div className="d-flex gap-2 flex-wrap mb-3">
      <button className="btn btn-dark" disabled={!!busy} onClick={() => run('load')}>
        <i className="bi bi-cloud-download me-2"/>{busy === 'load' ? 'DB 조회 중…' : 'DB에서 불러오기'}
      </button>
      <button className="btn btn-outline-dark" disabled={!!busy || !saved.length} onClick={() => run('upload')}>
        {busy === 'upload' ? '저장 중…' : 'Supabase에 업로드'}
      </button>
    </div>
    <p className="caption">같은 브라우저의 로그인 세션에서 저장한 목록을 조회합니다. 업로드하지 않은 장소는 브라우저에만 남습니다. 북마크 취소는 현재 브라우저 목록에만 적용됩니다.</p>
    {status && <p role="status" className="alert alert-success">{status}</p>}
    {error && <p role="alert" className="alert alert-warning">{error}</p>}
    {queried !== null && <div className="db-query-result mb-4">
      <strong><i className="bi bi-database-check me-2"/>이번 DB 조회 결과 · {queried.length}개</strong>
      {queried.length ? <ul>{queried.map(row => <li key={row.item_id}>{row.title}</li>)}</ul> :
        <p>현재 로그인 사용자에게 저장된 장소가 없습니다. 먼저 보관함을 업로드해 주세요.</p>}
    </div>}
    {saved.length ? <div className="cards">{saved.map(p => <Card p={p} key={p.id}/>)}</div> :
      <div className="empty"><i className="bi bi-bookmark"/><h3>다음에 가고 싶은 곳을 담아보세요.</h3>
        <p>이미 DB에 저장했다면 위의 ‘DB에서 불러오기’를 눌러 주세요.</p>
        <Link className="btn btn-dark" to="/explore">콘텐츠 탐색</Link>
      </div>}
  </section>
}
