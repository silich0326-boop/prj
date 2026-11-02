import { create } from 'zustand'
import { persist } from 'zustand/middleware'
export const useAppStore = create(persist(set => ({
  saved: [],
  replaceSaved: saved => set({saved}),
  toggle: p => set(s => ({saved: s.saved.some(x => x.id === p.id) ? s.saved.filter(x => x.id !== p.id) : [...s.saved, p]}))
}), {name:'jeju-studio-v2'}))
