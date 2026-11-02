import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../store/useSessionStore'
import { useAppStore } from '../store/useAppStore'
import { guestBookmarks } from '../lib/collection-scope'

function authMessage(error) {
  const messages = {
    invalid_credentials:'이메일 또는 비밀번호를 확인해 주세요.',
    email_not_confirmed:'가입 이메일에서 인증 링크를 누른 뒤 로그인해 주세요.',
    over_email_send_rate_limit:'인증 메일 발송 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.',
    email_address_not_authorized:'현재 인증 메일 수신이 제한되어 있습니다. 관리자에게 Supabase 메일 설정 확인을 요청해 주세요.',
    user_already_exists:'가입된 이메일입니다. 로그인하거나 비밀번호를 확인해 주세요.',
    signup_disabled:'회원가입이 비활성화되어 있습니다. 관리자에게 확인해 주세요.',
    weak_password:'더 강한 비밀번호를 사용해 주세요. 최소 8자 이상 입력해 주세요.',
  }
  return messages[error.code] || '인증 요청을 처리하지 못했습니다. 입력값과 네트워크를 확인하고 다시 시도해 주세요.'
}
export default function AccountPanel({disabled=false}) {
  const {user,ready,error:sessionError,changing} = useSessionStore()
  const collection = useAppStore()
  const guest = guestBookmarks(collection)
  const [mode,setMode]=useState('login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [notice,setNotice]=useState('')
  const [error,setError]=useState('')
  const account=!!user&&!user.is_anonymous
  const busy=disabled||changing||!ready
  async function authenticate(e) {
    e.preventDefault()
    if(busy||!supabase)return
    setError('');setNotice('');useSessionStore.setState({changing:true})
    try {
      const credentials={email:email.trim(),password}
      const result=mode==='signup'
        ? await supabase.auth.signUp({...credentials,options:{emailRedirectTo:window.location.origin+'/saved'}})
        : await supabase.auth.signInWithPassword(credentials)
      if(result.error)throw result.error
      setPassword('')
      setNotice(result.data.session?'로그인했습니다. DB에서 불러오기를 눌러 계정 보관함을 확인하세요.':'인증 메일을 확인해 주세요. 인증 링크를 누른 뒤 같은 이메일과 비밀번호로 로그인하세요. 이미 가입하셨다면 로그인 메뉴를 이용해 주세요.')
    }catch(e){setError(authMessage(e));setPassword('')}
    finally{useSessionStore.setState({changing:false})}
  }
  async function logout() {
    if(busy||!supabase)return
    useSessionStore.setState({changing:true});setError('');setNotice('')
    try {const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;setNotice('이 브라우저에서 로그아웃했습니다. 계정에 업로드한 자료는 DB에 남아 있습니다.')}
    catch(e){setError(authMessage(e))}
    finally{useSessionStore.setState({changing:false})}
  }
  return <section className="data-box" aria-label="보관함 계정">
    <h2 className="h4">다른 기기에서도 내 보관함</h2>
    {sessionError&&<p role="alert" className="alert alert-warning">{sessionError}</p>}
    {!ready?<p role="status">로그인 상태를 확인하고 있습니다…</p>:account?<>
      <p>로그인 계정: <strong>{user.email}</strong></p>
      <p>다른 브라우저에서도 같은 이메일로 로그인한 뒤 ‘DB에서 불러오기’를 누르세요. 저장할 때는 ‘Supabase에 업로드’를 눌러 주세요.</p>
      <div className="d-flex gap-2 flex-wrap">
        <button className="btn btn-outline-dark" disabled={busy} onClick={logout}>로그아웃</button>
        {guest.length>0&&<button className="btn btn-outline-dark" disabled={busy} onClick={()=>{useAppStore.getState().importGuest();setNotice('이 브라우저의 비회원 북마크를 합쳤습니다. 계정에 저장하려면 Supabase에 업로드를 눌러 주세요.')}}>비회원 북마크 {guest.length}개 가져오기</button>}
      </div>
    </>:<>
      <p>현재 비회원입니다. 이메일 계정으로 로그인하면 다른 브라우저에서도 업로드한 목록을 불러올 수 있습니다.</p>
      <div className="d-flex gap-2 mb-3" role="group" aria-label="계정 메뉴">
        <button type="button" className={'btn '+(mode==='login'?'btn-dark':'btn-outline-dark')} disabled={busy} aria-pressed={mode==='login'} onClick={()=>{setMode('login');setError('');setNotice('')}}>로그인</button>
        <button type="button" className={'btn '+(mode==='signup'?'btn-dark':'btn-outline-dark')} disabled={busy} aria-pressed={mode==='signup'} onClick={()=>{setMode('signup');setError('');setNotice('')}}>회원가입</button>
      </div>
      <form onSubmit={authenticate} className="row g-3" aria-label={mode==='signup'?'이메일 회원가입':'이메일 로그인'}>
        <div className="col-md-6"><label htmlFor="account-email" className="form-label">이메일</label><input id="account-email" type="email" className="form-control" autoComplete="email" required maxLength={254} disabled={busy} value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="col-md-6"><label htmlFor="account-password" className="form-label">비밀번호</label><input id="account-password" type="password" className="form-control" autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} maxLength={128} disabled={busy} value={password} onChange={e=>setPassword(e.target.value)}/></div>
        <div className="col-12"><button className="btn btn-dark" disabled={busy||!!sessionError||!supabase}>{changing?'처리 중…':mode==='signup'?'인증 메일로 가입하기':'계정 로그인'}</button></div>
      </form>
      <p className="caption mt-3">회원가입은 8자 이상의 비밀번호를 사용해 주세요. 이메일 인증이 필요할 수 있습니다. 비회원 북마크는 로그인 후 직접 가져올 수 있습니다. 비회원 DB에만 저장한 장소는 로그인 전에 ‘DB에서 불러오기’를 눌러 주세요.</p>
    </>}
    {notice&&<p role="status" className="alert alert-success mt-3">{notice}</p>}
    {error&&<p role="alert" className="alert alert-warning mt-3">{error}</p>}
  </section>
}
