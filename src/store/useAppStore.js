import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { askAgent } from '../api/client.js'
import { switchCollection, guestBookmarks } from '../lib/collection-scope.js'
import { supabase } from '../lib/supabase.js'
import { favoriteActions } from './favoriteActions.js'
export const useAppStore = create(persist((set,get) => ({
  saved: [], savedOwner:null, savedBuckets:{}, lastGuestOwner:null,
  ...favoriteActions(set,get,supabase),
  switchUser: user => set(s=>{const patch=switchCollection(s,user);return {...patch,collectionReady:true,...(patch.savedOwner?{favoriteNotice:null,favoriteUndo:null}:{})}}),
  importGuest: () => set(s=>({saved:[...new Map([...s.saved,...guestBookmarks(s)].map(p=>[p.id,p])).values()]})),
  replaceSaved: saved => set({saved}),
  messages: [], chatLoading:false, chatError:'',
  clearChat: () => { if (!get().chatLoading) set({messages:[],chatError:''}) },
  sendMessage: async text => {
    const message = text.trim()
    if (!message || get().chatLoading) return
    const history = get().messages.filter(m=>!m.failed).slice(-10).map(m=>({role:m.role,content:m.content}))
    const entry = {role:'user',content:message}
    set(s=>({messages:[...s.messages,entry],chatLoading:true,chatError:''}))
    try {
      const result = await askAgent(message,history)
      set(s=>({messages:[...s.messages,{role:'assistant',content:result.answer,steps:result.steps}]}))
    } catch(e) {
      set(s=>({chatError:e.message,messages:s.messages.map(m=>m===entry?{...m,failed:true}:m)}))
    } finally { set({chatLoading:false}) }
  }
}), {name:'jeju-studio-v2', partialize:s=>({saved:s.saved,savedOwner:s.savedOwner,savedBuckets:s.savedBuckets,lastGuestOwner:s.lastGuestOwner})}))
