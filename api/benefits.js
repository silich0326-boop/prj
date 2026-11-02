import { searchResidentBenefits } from '../server/benefits.js'
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'GET only'})
  try { return res.status(200).json(await searchResidentBenefits(req.query||{})) }
  catch(e){return res.status(400).json({error:e.message})}
}
