import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import { places } from '../data/places'
import seed from '../data/resident-benefits.json'
import { benefitToPlace } from '../lib/benefits'
import Saved from './Saved'
import Card from '../components/ItemCard'
import Heading from '../components/Heading'
const catalog = [...places,...seed.map(benefitToPlace)]
export default function Collection(){const saved=useAppStore(s=>s.saved);const setSaved=useAppStore(s=>s.replaceSaved);return <Saved saved={saved} setSaved={setSaved} getSaved={()=>useAppStore.getState().saved} catalog={catalog} db={supabase} Card={Card} Heading={Heading}/>}
