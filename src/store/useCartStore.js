import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {adultCount,cartIds,visitDate} from '../lib/cart.js'
export const useCartStore=create(persist((set,get)=>({
  ids:[],adults:1,date:'',undoIds:[],notice:'',
  add:id=>set(s=>({ids:cartIds([...s.ids,id]),notice:'',undoIds:[]})),
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
