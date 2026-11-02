import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { selectResidentBenefits,validateBenefitInput } from '../server/benefits.js'
import { runAgent } from '../server/agent-loop.js'
import { tools } from '../server/agent-tools.js'
const rows=JSON.parse(readFileSync(new URL('../src/data/resident-benefits.json', import.meta.url),'utf8'))
test('혜택 가격·출처·증빙 및 휴관일 경계',()=>{
 assert.equal(tools.length,4)
 const [b]=selectResidentBenefits(rows,{keyword:'해녀',maxPrice:1000})
 assert.equal(b.resident_price,550);assert.ok(b.source_url);assert.ok(b.documents);assert.equal(b.valid_until,null)
 for(const date of ['2026-11-03','2026-11-05'])assert.equal(selectResidentBenefits(rows,{keyword:'현대',visitDate:date})[0].visit_status,'temporary_closed')
 assert.equal(selectResidentBenefits(rows,{keyword:'현대',visitDate:'2026-11-06'})[0].visit_status,'opening_not_verified')
 assert.equal(selectResidentBenefits(rows,{keyword:'현대',visitDate:'2026-11-02'})[0].visit_status,'regular_closure_check_holiday_exception')
 assert.equal(selectResidentBenefits(rows,{keyword:'에펠탑'}).length,0)
 assert.throws(()=>validateBenefitInput({visitDate:'2026-02-30'}));assert.throws(()=>validateBenefitInput({maxPrice:-1}))
})
test('가짜 모델의 혜택→날씨 연속 호출과 결과 전달',async()=>{
 const calls=[];let turn=0
 const client={messages:{create:async options=>{
 calls.push(structuredClone(options))
 const names=['search_resident_benefits','get_weather'];const index=turn++
 return index<2?{stop_reason:'tool_use',content:[{type:'tool_use',id:'tool'+index,name:names[index],input:{}}]}:{stop_reason:'end_turn',content:[{type:'text',text:'테스트 완료'}]}
 }}}
 const result=await runAgent({client,model:'test-only',messages:[{role:'user',content:'test'}],execute:{search_resident_benefits:async()=>selectResidentBenefits(rows,{keyword:'해녀'}),get_weather:async()=>[{sky:'흐림'}]}})
 assert.equal(result.steps.length,2);assert.equal(result.answer,'테스트 완료');assert.equal(result.steps[0].count,1)
 assert.equal(calls[1].messages.at(-1).content[0].type,'tool_result')
 assert.equal(JSON.parse(calls[1].messages.at(-1).content[0].content)[0].resident_price,550)
 assert.equal(calls[0].max_tokens,1024)
})
test('실패는 도구 오류이며 샘플로 대체하지 않음, 반복 5회 제한',async()=>{
 let turns=0;let errorResult
 const client={messages:{create:async options=>{if(turns)errorResult=options.messages.at(-1).content[0];turns++;return {stop_reason:'tool_use',content:[{type:'tool_use',id:'x'+turns,name:'search_resident_benefits',input:{}}]}}}}
 const result=await runAgent({client,model:'test-only',messages:[],execute:{search_resident_benefits:async()=>{throw Error('DB unavailable')}}})
 assert.equal(turns,5);assert.equal(result.steps.length,5);assert.equal(errorResult.is_error,true);assert.ok(result.steps.every(s=>s.status==='error'&&s.count===0))
})
