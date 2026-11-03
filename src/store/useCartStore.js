import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {adultCount,cartIds,visitDate} from '../lib/cart.js'
export const useCartStore=create(persist((set,get)=>({
  ids:[],adults:1,date:'',undoIds:[],notice:'',addedNotice:'',
  dismissAdded:()=>set({addedNotice:''}),
  add:(id,name)=>set(s=>({ids:cartIds([...s.ids,id]),notice:'',undoIds:[],addedNotice:s.ids.includes(id)?s.addedNotice:'장바구니에 담았습니다: '+(name||'선택한 장소')})),
  remove:id=>set(s=>({ids:s.ids.filter(value=>value!==id),undoIds:s.ids.includes(id)?[id]:[],notice:'장소를 장바구니에서 뺐습니다.'})),
  clear:()=>{if(get().ids.length)set(s=>({ids:[],undoIds:s.ids,notice:'장바구니를 비웠습니다.'}))},
  undo:()=>set(s=>({ids:cartIds([...s.ids,...s.undoIds]),undoIds:[],notice:'장바구니를 복원했습니다.'})),
  setAdults:value=>set({adults:adultCount(value)}),
  setDate:value=>set({date:visitDate(value)}),
}),{
  name:'jeju-local-trip-cart-v1',
  partialize:s=>({ids:s.ids,adults:s.adults,date:s.date}),
  merge:(stored,current)=>({...current,ids:cartIds(stored?.ids),adults:adultCount(stored?.adults??1),date:visitDate(stored?.date)}),
}))
