import { Routes, Route, Link } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Map from './pages/Map'
import Agent from './pages/Agent'
import Collection from './pages/Collection'
import Cart from './pages/Cart'
import Settings from './pages/Settings'
import BenefitsSetup from './pages/BenefitsSetup'
import Heading from './components/Heading'
import Scene from './components/Scene'
import { places } from './data/places'
export default function AppRoutes(){return <Routes><Route element={<RootLayout/>}>
  <Route index element={<Home places={places} Scene={Scene}/>}/>
  <Route path="explore" element={<Explore/>}/><Route path="map" element={<Map/>}/>
  <Route path="agent" element={<Agent/>}/><Route path="saved" element={<Collection/>}/>
  <Route path="cart" element={<Cart/>}/>
  <Route path="settings" element={<Settings/>}/><Route path="benefits-setup" element={<BenefitsSetup/>}/>
  <Route path="*" element={<section className="section"><Heading title="페이지를 찾을 수 없습니다."/><Link to="/">홈으로 돌아가기</Link></section>}/>
</Route></Routes>}
