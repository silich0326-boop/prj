import assert from 'node:assert/strict'
import {test} from 'node:test'
import {switchCollection,guestBookmarks} from '../src/lib/collection-scope.js'
import {readFavorites,uploadFavorites} from '../src/lib/favorites.js'
const accountA={id:'a',is_anonymous:false},accountB={id:'b',is_anonymous:false}
const item={id:'hallasan',name:'한라산'}
const apply=(state,user)=>({...state,...switchCollection(state,user)})
test('기존 북마크 보존, 비회원 가져오기 및 계정 간 목록 분리',()=>{
 let s={saved:[item],savedOwner:null,savedBuckets:{},lastGuestOwner:null}
 s=apply(s,null);s=apply(s,{id:'guest',is_anonymous:true});assert.deepEqual(s.saved,[item])
 s=apply(s,accountA);assert.deepEqual(s.saved,[]);assert.deepEqual(guestBookmarks(s),[item])
 s.saved=[{id:'haenyeo',name:'해녀박물관'}]
 s=apply(s,accountB);assert.deepEqual(s.saved,[])
 s=apply(s,accountA);assert.equal(s.saved[0].id,'haenyeo')
 s=apply(s,null);assert.equal(s.saved[0].id,'hallasan')
 s=apply(s,accountB);assert.deepEqual(s.saved,[])
})
test('정식 계정 세션 유지 및 같은 사용자 ID로 업로드·조회, 다른 ID 목록 제외',async()=>{
 const rows=[];let anonymousCalls=0
 function client(user){
   return {
     auth:{
       getSession:async()=>({data:{session:{user}}}),
       signInAnonymously:async()=>{anonymousCalls++;throw Error('unexpected')},
     },
     from:()=>({
       upsert:async input=>{rows.push(...input);return {error:null}},
       select:()=>({eq:(_key,id)=>({order:async()=>({data:rows.filter(r=>r.user_id===id),error:null})})}),
     }),
   }
 }
 await uploadFavorites(client(accountA),[item])
 assert.equal((await readFavorites(client(accountA))).length,1)
 assert.equal((await readFavorites(client(accountB))).length,0)
 assert.equal(rows[0].user_id,'a');assert.equal(anonymousCalls,0)
})
