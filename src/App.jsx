import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
class Boundary extends React.Component{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){return this.state.error?<div className="section"><h1>화면을 불러오지 못했습니다.</h1><p>페이지를 새로고침해 주세요. 3D 기능은 WebGL 지원 브라우저가 필요합니다.</p><a href="/explore">콘텐츠 탐색으로 이동</a></div>:this.props.children}}
export default function App(){return <Boundary><BrowserRouter><AppRoutes/></BrowserRouter></Boundary>}
