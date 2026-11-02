import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAppStore } from './useAppStore'
export const useSessionStore = create(() => ({ user: null, ready: false, error: '', changing: false }))
let started = false
export function initializeSession() {
  if (started) return
  started = true
  if (!supabase) { useSessionStore.setState({ready:true,error:'Supabase 연결 설정이 필요합니다.'}); return }
  let eventReceived = false
  function apply(session) {
    const user = session?.user || null
    useAppStore.getState().switchUser(user)
    useSessionStore.setState({user,ready:true,error:''})
  }
  supabase.auth.onAuthStateChange((_event, session) => { eventReceived=true; apply(session) })
  supabase.auth.getSession().then(({data,error}) => {
    if (eventReceived) return
    if (error) useSessionStore.setState({ready:true,error:'로그인 상태를 확인하지 못했습니다. 새로고침해 주세요.'})
    else apply(data.session)
  }).catch(() => useSessionStore.setState({ready:true,error:'로그인 상태를 확인하지 못했습니다. 새로고침해 주세요.'}))
}
