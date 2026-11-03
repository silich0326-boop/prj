import {tools,runTool,agentSystem} from './agent-tools.js'
export const openAiTools=tools.map(tool=>({type:'function',name:tool.name,description:tool.description,parameters:tool.input_schema,strict:false}))
export async function runOpenAiAgent({client,model,messages,execute=runTool,now=new Date()}) {
  const input=messages.map(m=>({role:m.role,content:m.content}))
  const steps=[]
  const deadline=Date.now()+45000
  const result=answer=>({answer,steps,provider:'openai',model})
  for(let turn=0;turn<5;turn++){
    const remaining=deadline-Date.now()
    if(remaining<1000)return result('조회 시간이 길어지고 있습니다. 질문을 좁혀 다시 시도해 주세요.')
    const response=await client.responses.create({
      model,instructions:agentSystem(now),input,tools:openAiTools,
      max_output_tokens:1024,reasoning:{effort:'low'},text:{verbosity:'low'},
      store:false,include:['reasoning.encrypted_content'],
    },{signal:AbortSignal.timeout(Math.min(20000,remaining))})
    if(response.status==='incomplete')return result('답변 길이 제한에 도달했습니다. 장소나 질문을 하나로 좁혀 다시 물어봐 주세요.')
    const calls=(response.output||[]).filter(item=>item.type==='function_call')
    if(!calls.length){
      const answer=response.output_text||(response.output||[]).filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n')
      return result(answer||'답변을 받지 못했습니다. 다시 질문해 주세요.')
    }
    // Preserve all output items, including reasoning state, for the next turn.
    input.push(...response.output)
    for(const call of calls){
      if(steps.length>=8)return result('조회 요청이 많아 중단했습니다. 조건을 좁혀 다시 질문해 주세요.')
      let args={},value,failed=false
      try{
        if(!Object.hasOwn(execute,call.name))throw new Error('Unknown tool')
        args=JSON.parse(call.arguments||'{}')
        if(!args||typeof args!=='object'||Array.isArray(args))throw new Error('Invalid tool arguments')
        value=await execute[call.name](args)
      }catch{value={error:'도구 조회에 실패했습니다. 확인된 자료가 아니므로 추측하지 말고 조회 실패를 안내하세요.'};failed=true}
      steps.push({tool:call.name,args,count:Array.isArray(value)?value.length:0,status:failed?'error':'success'})
      input.push({type:'function_call_output',call_id:call.call_id,output:JSON.stringify(value)})
    }
  }
  return result('도구 호출이 많아 중단했습니다. 질문을 좁혀 주세요.')
}
