import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import {runAgent} from '../server/agent-loop.js'
import {runOpenAiAgent} from '../server/openai-agent.js'
export function agentConfiguration(env=process.env){
  const provider=env.AI_PROVIDER||(env.OPENAI_API_KEY?'openai':'anthropic')
  if(!['openai','anthropic'].includes(provider))return {provider,model:'',ready:false}
  const model=provider==='openai'?env.OPENAI_MODEL:env.ANTHROPIC_MODEL
  return {provider,model:model||'',ready:!!(model&&(provider==='openai'?env.OPENAI_API_KEY:env.ANTHROPIC_API_KEY))}
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'POST only'})
  const {message,history=[]}=req.body||{}
  if(typeof message!=='string'||!message.trim()||message.length>2000||!Array.isArray(history)||history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>8000))return res.status(400).json({error:'올바른 질문을 입력해 주세요.'})
  const config=agentConfiguration()
  if(!config.ready)return res.status(503).json({error:'AI 연결 설정이 필요합니다. 선택한 AI의 키와 모델 설정을 확인해 주세요.'})
  try{
    const messages=[...history.slice(-10),{role:'user',content:message}]
    if(config.provider==='openai'){
      const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:20000,maxRetries:0})
      return res.status(200).json(await runOpenAiAgent({client,model:config.model,messages}))
    }
    const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY,timeout:20000,maxRetries:0})
    return res.status(200).json({...await runAgent({client,model:config.model,messages}),provider:'anthropic',model:config.model})
  }catch(e){
    const status=Number.isInteger(e.status)&&e.status>=400&&e.status<=599?e.status:500
    const error=status===429?'AI 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.':status===401||status===403?'AI 연결 인증을 확인해야 합니다. 관리자에게 알려주세요.':'AI 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
    return res.status(status).json({error})
  }
}
