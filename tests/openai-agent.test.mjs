import {test} from 'node:test'
import assert from 'node:assert/strict'
import {runOpenAiAgent} from '../server/openai-agent.js'
import {agentConfiguration} from '../api/agent.js'
test('Responses API의 도구 결과·reasoning 상태를 다음 호출에 전달',async()=>{
 const seen=[];let count=0
 const reasoning={type:'reasoning',id:'reason-1',encrypted_content:'test-only'}
 const client={responses:{create:async options=>{seen.push(structuredClone(options));count++;return count===1?{output:[reasoning,{type:'function_call',name:'get_weather',arguments:'{"place":"제주시"}',call_id:'weather-1'}]}:count===2?{output:[{type:'function_call',name:'search_resident_benefits',arguments:'{"keyword":"해녀"}',call_id:'benefit-1'}]}:{status:'completed',output_text:'도민 550원',output:[]}}}}
 const r=await runOpenAiAgent({client,model:'test-only',messages:[{role:'user',content:'날씨와 해녀 요금'}],execute:{get_weather:async()=>[{temp:17}],search_resident_benefits:async()=>[{resident_price:550}]}})
 assert.equal(r.answer,'도민 550원');assert.equal(r.steps.length,2);assert.equal(r.steps[0].count,1)
 assert.ok(seen[1].input.some(item=>item.encrypted_content==='test-only'))
 assert.equal(seen[1].input.at(-1).call_id,'weather-1');assert.equal(JSON.parse(seen[2].input.at(-1).output)[0].resident_price,550)
 assert.equal(seen[0].max_output_tokens,1024);assert.equal(seen[0].store,false)
 assert.equal(agentConfiguration({AI_PROVIDER:'openai',OPENAI_MODEL:'test',OPENAI_API_KEY:'test'}).ready,true)
 assert.equal(agentConfiguration({AI_PROVIDER:'openai',ANTHROPIC_API_KEY:'test',ANTHROPIC_MODEL:'test'}).ready,false)
})
test('도구 오류는 오류로 반환하고 반복·잘린 답변을 성공으로 표시하지 않음',async()=>{
 let n=0;const calls=[]
 const client={responses:{create:async options=>{calls.push(options);n++;return {output:[{type:'function_call',name:'search_resident_benefits',arguments:'{}',call_id:'x'+n}]}}}}
 const r=await runOpenAiAgent({client,model:'test',messages:[],execute:{search_resident_benefits:async()=>{throw Error('secret-test-message')}}})
 assert.equal(n,5);assert.ok(r.steps.every(s=>s.status==='error'))
 assert.ok(JSON.parse(calls[1].input.find(i=>i.type==='function_call_output').output).error)
 assert.ok(!JSON.stringify(calls).includes('secret-test-message'))
 const incomplete=await runOpenAiAgent({client:{responses:{create:async()=>({status:'incomplete',output_text:'잘린 요금'})}},model:'test',messages:[]})
 assert.ok(incomplete.answer.includes('길이 제한'));assert.ok(!incomplete.answer.includes('잘린 요금'))
})
