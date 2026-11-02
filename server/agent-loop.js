import { tools,runTool,agentSystem } from './agent-tools.js'
export async function runAgent({client,model,messages,execute=runTool,now=new Date()}) {
  const steps=[]
  for(let turn=0;turn<5;turn++) {
    const response=await client.messages.create({model,max_tokens:1024,system:agentSystem(now),tools,messages})
    if(response.stop_reason!=='tool_use')return {answer:response.content.filter(b=>b.type==='text').map(b=>b.text).join('\n'),steps}
    messages.push({role:'assistant',content:response.content})
    const results=[]
    for(const block of response.content) {
      if(block.type!=='tool_use')continue
      let result,failed=false
      try {if(!Object.hasOwn(execute,block.name))throw new Error('지원하지 않는 도구입니다.');result=await execute[block.name](block.input||{})}
      catch(e){result={error:e.message};failed=true}
      steps.push({tool:block.name,args:block.input,count:Array.isArray(result)?result.length:0,status:failed?'error':'success'})
      results.push({type:'tool_result',tool_use_id:block.id,content:JSON.stringify(result),...(failed?{is_error:true}:{})})
    }
    messages.push({role:'user',content:results})
  }
  return {answer:'도구 호출이 많아 중단했어요. 질문을 좁혀 주세요.',steps}
}
