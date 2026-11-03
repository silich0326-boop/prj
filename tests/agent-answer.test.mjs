import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import AgentAnswer,{safeSourceUrl} from '../src/components/AgentAnswer.js'
const render=text=>renderToStaticMarkup(createElement(AgentAnswer,{text}))

test('요금 강조·목록·공식 출처와 기존 일반 URL 모두 읽을 수 있게 표시',()=>{
  const html=render('**요금:** 도민 550원\n\n- 신분증 지참\n- 휴관 확인\n\n[공식 관람안내](https://www.jeju.go.kr/haenyeo/exhibit/guide.htm)\n\nhttps://www.jeju.go.kr/haenyeo/exhibit/guide.htm')
  assert.match(html,/<strong>요금:<\/strong>/)
  assert.match(html,/<li>신분증 지참<\/li>/)
  assert.equal((html.match(/target="_blank"/g)||[]).length,2)
  assert.match(html,/rel="noopener noreferrer"/)
  assert.match(html,/공식 관람안내/)
  assert.match(html,/출처 보기 · jeju.go.kr/)
})
test('모델이 반환한 HTML·실행형 링크·외부 이미지를 실행하거나 요청하지 않음',()=>{
  const html=render('<script>alert(1)</script>\n\n<img src="https://evil.example/track" onerror="alert(1)">\n\n[실행](javascript:alert%281%29)\n\n![추적](https://evil.example/track)\n\n[파일](file:///C:/secret.txt)')
  assert.doesNotMatch(html,/<script|<img|<input|href="(?:javascript|file|data):|onerror=/)
  assert.match(html,/실행/)
  for(const url of ['javascript:alert(1)','data:text/html,test','file:///C:/test','//evil.example','/settings','https://user:password@example.com'])assert.equal(safeSourceUrl(url),'')
  assert.equal(safeSourceUrl('https://www.jeju.go.kr/haenyeo/exhibit/guide.htm'),'https://www.jeju.go.kr/haenyeo/exhibit/guide.htm')
})

test('기온·시간·확률의 물결표 범위를 취소선으로 오해하지 않음',()=>{
  const html=render('예상 기온 16~18℃, 예보 09~14시, 강수확률 0~30%입니다.')
  assert.doesNotMatch(html,/<del>/)
  assert.match(html,/16~18℃/);assert.match(html,/09~14시/);assert.match(html,/0~30%/)
})
