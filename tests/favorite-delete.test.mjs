import {test} from 'node:test'
import assert from 'node:assert/strict'
import {favoriteActions} from '../src/store/favoriteActions.js'
import {removeFavorite,readFavorites} from '../src/lib/favorites.js'
const place={id:'hallasan',name:'한라산'}
function fixture({failure=false,wait}={}){
 const rows=[{user_id:'a',item_id:place.id,title:place.name},{user_id:'b',item_id:place.id,title:'다른 사용자'}]
 let anonymous=0
 const client={auth:{getSession:async()=>({data:{session:{user:{id:'a',is_anonymous:false}}}}),signInAnonymously:async()=>{anonymous++;throw Error('unexpected')}},from:()=>({
   delete:()=>{const filters={};const q={eq:(k,v)=>{filters[k]=v;return q},select:async()=>{if(wait)await wait;if(failure)return {error:Error('network')};const removed=rows.filter(r=>r.user_id===filters.user_id&&r.item_id===filters.item_id);for(const r of removed)rows.splice(rows.indexOf(r),1);return {data:removed}}};return q},
   upsert:async input=>{rows.push(...input);return {error:null}},
   select:()=>({eq:(_k,id)=>({order:async()=>({data:rows.filter(r=>r.user_id===id),error:null})})}),
 })}
 let state={saved:[place],savedOwner:'account:a'}
 const get=()=>state;const set=patch=>{state={...state,...(typeof patch==='function'?patch(state):patch)}}
 state={...state,...favoriteActions(set,get,client),collectionReady:true}
 return {client,rows,get,set,anonymous:()=>anonymous}
}
test('저장 취소는 현재 사용자의 해당 항목만 삭제하고 되돌리기로 DB·로컬을 복원',async()=>{
 const f=fixture();await f.get().toggle(place)
 assert.deepEqual(f.get().saved,[]);assert.equal((await readFavorites(f.client)).length,0)
 assert.equal(f.rows[0].user_id,'b');assert.equal(f.anonymous(),0)
 await f.get().undoFavorite();assert.equal(f.get().saved[0].id,place.id)
 assert.equal((await readFavorites(f.client)).length,1);assert.equal(f.get().favoriteUndo,null)
})
test('삭제 실패 시 로컬 목록을 유지하며 중복 요청과 계정 변경을 보호',async()=>{
 const failed=fixture({failure:true});await failed.get().toggle(place)
 assert.equal(failed.get().saved.length,1);assert.equal(failed.get().favoriteNotice.kind,'error')
 await assert.rejects(removeFavorite(failed.client,place.id,'account:b'))
 let release;const waiting=fixture({wait:new Promise(resolve=>{release=resolve})})
 const first=waiting.get().toggle(place);await waiting.get().toggle(place)
 assert.equal(waiting.get().collectionBusy,'remove');assert.equal(waiting.get().saved.length,1)
 waiting.set({savedOwner:'account:b',saved:[{id:'different',name:'다른 목록'}],favoriteNotice:null})
 release();await first
 assert.equal(waiting.get().saved[0].id,'different');assert.equal(waiting.get().favoriteUndo,null)
 assert.equal(waiting.get().collectionBusy,null)
})
test('세션 없는 로컬 항목 취소는 익명 계정을 만들지 않고 네트워크 삭제도 하지 않음',async()=>{
 const client={auth:{getSession:async()=>({data:{session:null}})},from:()=>{throw Error('unexpected DB request')}}
 assert.deepEqual(await removeFavorite(client,'local-only','guest:browser'),{deletedFromDb:false})
})
