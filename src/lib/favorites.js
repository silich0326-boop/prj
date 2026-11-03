import { collectionOwner } from './collection-scope.js'
// Reuse the current authenticated or anonymous identity.
export async function favoriteUser(client) {
  if (!client) throw new Error('연결 설정에서 Supabase를 먼저 연결해 주세요.')
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  if (data.session?.user) return data.session.user
  const result = await client.auth.signInAnonymously()
  if (result.error) throw result.error
  if (!result.data.user) throw new Error('로그인 정보를 확인할 수 없습니다.')
  return result.data.user
}

export async function readFavorites(client) {
  const user = await favoriteUser(client)
  const { data, error } = await client.from('studio_favorites')
    .select('item_id,title,created_at').eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function uploadFavorites(client, places, expectedOwner) {
  const user = await favoriteUser(client)
  if(expectedOwner && collectionOwner(user)!==expectedOwner)throw new Error('계정이 변경되었습니다.')
  if (!places.length) return
  const { error } = await client.from('studio_favorites').upsert(
    places.map(p => ({ user_id: user.id, item_id: p.id, title: p.name })),
    { onConflict: 'user_id,item_id' }
  )
  if (error) throw error
}

export function combineFavorites(current, rows, catalog) {
  const result = new Map(current.map(p => [p.id, p]))
  for (const row of rows) {
    const known = catalog.find(p => p.id === row.item_id)
    result.set(row.item_id, known || { id: row.item_id, name: row.title,
      tag: '저장 장소', area: 'DB에서 불러옴', icon: 'geo-alt', color: '#b9c99b',
      desc: 'Supabase에 저장된 장소입니다. 상세 정보는 추가 확인이 필요합니다.' })
  }
  return [...result.values()]
}

// Removing a local-only bookmark must never create a new anonymous account.
export async function removeFavorite(client,itemId,expectedOwner) {
  if(!client)throw new Error('DB 연결을 확인해 주세요.')
  const {data,error}=await client.auth.getSession()
  if(error)throw error
  const user=data.session?.user||null
  if(collectionOwner(user)!==expectedOwner)throw new Error('계정이 변경되었습니다.')
  if(!user)return {deletedFromDb:false}
  const result=await client.from('studio_favorites').delete()
    .eq('user_id',user.id).eq('item_id',itemId).select('item_id')
  if(result.error)throw result.error
  return {deletedFromDb:!!result.data?.length}
}
