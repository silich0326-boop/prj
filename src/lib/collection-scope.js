// Keep each account's browser cache separate; never infer identity from a nickname.
export function collectionOwner(user) {
  return user ? `${user.is_anonymous ? 'guest' : 'account'}:${user.id}` : 'guest:browser'
}
export function switchCollection(state, user) {
  const owner = collectionOwner(user)
  if (state.savedOwner === owner) return {}
  if (!state.savedOwner) return { savedOwner: owner }
  const savedBuckets = { ...state.savedBuckets, [state.savedOwner]: state.saved }
  const guestToGuest = state.savedOwner.startsWith('guest:') && owner.startsWith('guest:')
  return {
    savedOwner: owner, savedBuckets,
    saved: savedBuckets[owner] ?? (guestToGuest ? state.saved : []),
    lastGuestOwner: state.savedOwner.startsWith('guest:') ? state.savedOwner : state.lastGuestOwner,
  }
}
export function guestBookmarks(state) {
  return state.lastGuestOwner ? state.savedBuckets[state.lastGuestOwner] || [] : []
}
