import { removeFavorite, uploadFavorites } from '../lib/favorites.js'
export function favoriteActions(set,get,client) {
  return {
    collectionBusy:null, favoriteNotice:null, favoriteUndo:null, collectionReady:false,
    beginCollectionOperation: type => {
      if(get().collectionBusy||!get().collectionReady)return false
      set({collectionBusy:type});return true
    },
    finishCollectionOperation:()=>set({collectionBusy:null}),
    dismissFavoriteNotice:()=>set({favoriteNotice:null,favoriteUndo:null}),
    toggle: async place => {
      if(get().collectionBusy||!get().collectionReady)return
      const owner=get().savedOwner
      const active=get().saved.some(p=>p.id===place.id)
      if(!active){
        set(s=>({saved:[...s.saved,place],favoriteUndo:null,favoriteNotice:{kind:'success',text:'보관함에 담았습니다. 다른 기기에서도 보려면 보관함에서 DB에 업로드해 주세요.'}}))
        return
      }
      set({collectionBusy:'remove',favoriteNotice:{kind:'info',text:'저장 취소를 처리하고 있습니다…'},favoriteUndo:null})
      try {
        const result=await removeFavorite(client,place.id,owner)
        if(get().savedOwner!==owner)return
        set(s=>({saved:s.saved.filter(p=>p.id!==place.id),favoriteUndo:{owner,place,deletedFromDb:result.deletedFromDb},favoriteNotice:{kind:'success',text:result.deletedFromDb?'보관함과 DB에서 삭제했습니다.':'보관함에서 제거했습니다.'}}))
      }catch{
        if(get().savedOwner===owner)set({favoriteNotice:{kind:'error',text:'저장 취소에 실패해 장소를 그대로 두었습니다. 연결을 확인하고 다시 시도해 주세요.'}})
      }finally{set({collectionBusy:null})}
    },
    undoFavorite:async()=>{
      const undo=get().favoriteUndo
      if(!undo||get().collectionBusy||undo.owner!==get().savedOwner)return
      set({collectionBusy:'undo'})
      try {
        if(undo.deletedFromDb)await uploadFavorites(client,[undo.place],undo.owner)
        if(get().savedOwner!==undo.owner)return
        set(s=>({saved:s.saved.some(p=>p.id===undo.place.id)?s.saved:[...s.saved,undo.place],favoriteUndo:null,favoriteNotice:{kind:'success',text:'저장 취소를 되돌렸습니다.'}}))
      }catch{
        if(get().savedOwner===undo.owner)set({favoriteNotice:{kind:'error',text:'되돌리기에 실패했습니다. 연결을 확인하고 다시 눌러 주세요.'}})
      }finally{set({collectionBusy:null})}
    },
  }
}
