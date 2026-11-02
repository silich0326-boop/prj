import { useState } from 'react'
import { Link } from 'react-router-dom'
import sql from '../../supabase/resident-benefits.sql?raw'
export default function BenefitsSetup() {
  const [status,setStatus] = useState('')
  async function copy() { try { await navigator.clipboard.writeText(sql);setStatus('복사했습니다. Supabase SQL Editor의 새 쿼리에 붙여넣고 Run을 눌러 주세요.') } catch {setStatus('자동 복사가 되지 않았습니다. 아래 SQL을 직접 선택해서 복사해 주세요.')} }
  return <section className="section"><div className="heading"><small className="eyebrow">BENEFITS DATABASE SETUP</small><h1>도민 혜택 DB 연결</h1><p>공개키로는 테이블을 생성할 수 없습니다. 프로젝트 관리자가 아래 SQL을 한 번 실행하면 됩니다.</p></div>
    <ol className="setup-steps"><li><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase 대시보드</a>에서 현재 앱과 연결한 프로젝트를 선택하세요.</li><li>SQL Editor → New query를 여세요.</li><li>아래 SQL 복사 → 붙여넣기 → Run을 누르세요. 혜택 테이블과 조사한 5곳이 생성됩니다.</li><li><Link to="/#resident-benefits">홈페이지 혜택 목록</Link>에서 ‘혜택 새로고침’을 누르세요. ‘Supabase 조회 완료 · 5곳’이 뜨면 연결 성공입니다.</li></ol>
    <p>기존 즐겨찾기 테이블은 변경하지 않습니다. 혜택 목록은 누구나 조회할 수 있지만, 브라우저에서 수정할 권한은 부여하지 않습니다.</p>
    <button className="btn btn-dark" onClick={copy}>혜택 테이블 SQL 복사</button><p role="status" className="mt-3">{status}</p><details className="setup-sql"><summary>SQL 직접 보기</summary><pre>{sql}</pre></details>
  </section>
}
