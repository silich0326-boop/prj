import { createRoot } from 'react-dom/client'
import App from './App'
import { initializeSession } from './store/useSessionStore'
initializeSession()
createRoot(document.getElementById('root')).render(<App/>)
