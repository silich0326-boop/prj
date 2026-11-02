import Anthropic from '@anthropic-ai/sdk'
import { runAgent } from '../server/agent-loop.js'
export default async function handler(req,res) {
  if(req.method!=='POST')return res.status(405).json({error:'POST only'})
  const {message,history=[]}=req.body||{}
  if(typeof message!=='string'||!message.trim()||message.length>2000||!Array.isArray(history)||history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>8000))return res.status(400).json({error:'올바른 질문을 입력해 주세요.'})
  if(!process.env.ANTHROPIC_API_KEY||!process.env.ANTHROPIC_MODEL)return res.status(503).json({error:'AI 연결 설정이 필요합니다. ANTHROPIC_API_KEY와 ANTHROPIC_MODEL을 설정해 주세요.'})
  try {
    const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY,timeout:20000,maxRetries:0})
    return res.status(200).json(await runAgent({client,model:process.env.ANTHROPIC_MODEL,messages:[...history.slice(-10),{role:'user',content:message}]}))
  } catch(e){return res.status(e.status||500).json({error:e.status===429?'사용량이 많아요. 잠시 후 다시 시도하세요.':'AI 요청을 처리하지 못했습니다. 키·모델 설정 또는 서버 로그를 확인해 주세요.'})}
}
