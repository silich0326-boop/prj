import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import seed from '../data/resident-benefits.json'

async function queryBenefits() {
  try {
    if (!supabase) throw new Error('Supabase 연결을 먼저 설정해 주세요.')
    const { data, error } = await supabase.from('resident_benefits').select('*').order('name')
    if (error) throw error
    return { rows:data || [], source:'supabase', loading:false, error:'' }
  } catch (e) {
    return { rows:seed, source:'research', loading:false,
      error:e.code === 'PGRST205' || e.code === '42P01' ? '혜택 테이블 설정이 필요합니다.' : '혜택 DB를 조회하지 못했습니다.' }
  }
}

export function useResidentBenefits() {
  const [state,setState] = useState({rows:seed, source:'research', loading:true, error:''})
  const reload = useCallback(async () => {
    setState(s => ({...s, loading:true, error:''}))
    setState(await queryBenefits())
  }, [])
  useEffect(() => {
    let active = true
    queryBenefits().then(next => { if (active) setState(next) })
    return () => { active = false }
  }, [])
  return {...state,reload}
}
