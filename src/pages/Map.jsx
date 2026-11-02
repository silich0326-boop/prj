import { Suspense, useState } from 'react'
import Scene from '../components/Scene'
import Heading from '../components/Heading'
import Card from '../components/ItemCard'
import { places } from '../data/places'
export default function MapPage(){const [selected,setSelected]=useState(null);return <section className="section"><Heading sub="AN ISLAND OF STORIES" title="입체로 만나는 제주" text="섬을 돌려보고 핀을 선택해 제주의 이야기를 확인하세요."/><div className="map-view"><Suspense fallback={<p>지도를 불러옵니다…</p>}><Scene places={places} onSelect={setSelected}/></Suspense></div><p className="caption">제주를 단순화한 일러스트 지도입니다. 핀 위치는 개략적인 위치이며 길찾기 용도가 아닙니다.</p>{selected?<div className="map-selected"><Card p={selected}/></div>:<p>핀을 선택하면 장소 안내와 도민 혜택 확인 상태가 나타납니다.</p>}</section>}
