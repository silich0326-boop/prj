import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {adultCount,cartIds,estimateCart,visitDate} from '../src/lib/cart.js'
const rows=JSON.parse(fs.readFileSync(new URL('../src/data/resident-benefits.json',import.meta.url),'utf8'))
const selected=['benefit-haenyeo','benefit-stone']
test('해녀박물관·돌문화공원의 성인 도민 인원별 요금과 절약액',()=>{
  const one=estimateCart(selected,rows,{adults:1})
  assert.equal(one.regular,6100);assert.equal(one.resident,3050);assert.equal(one.savings,3050)
  assert.equal(one.pricedCount,2);assert.equal(one.excludedCount,0)
  const three=estimateCart([...selected,selected[0]],rows,{adults:3})
  assert.equal(three.regular,18300);assert.equal(three.resident,9150);assert.equal(three.savings,9150)
  assert.equal(three.entries.length,2)
  assert.equal(adultCount(-2),1);assert.equal(adultCount(100),20);assert.equal(adultCount('invalid'),1)
  assert.deepEqual(cartIds(['a','a',null,12,'b']),['a','b'])
})
test('휴관·기간 외·미확인 요금은 0원으로 오인하지 않고 부분 합계로 제외',()=>{
  const estimate=estimateCart(['benefit-modern','benefit-haenyeo','unknown'],rows,{date:'2026-11-03'})
  assert.equal(estimate.regular,1100);assert.equal(estimate.resident,550)
  assert.equal(estimate.excludedCount,2);assert.equal(estimate.entries[0].resident,null)
  assert.match(estimate.entries[0].issue,/임시휴관/);assert.match(estimate.entries[2].issue,/확인할 수 없습니다/)
  const expired={...rows[0],valid_until:'2026-11-02'}
  assert.equal(estimateCart([expired.id],[expired],{date:'2026-11-03'}).pricedCount,0)
  for(const price of [null,-1,NaN,'550'])assert.equal(estimateCart(['bad'],[{id:'bad',regular_price:1100,resident_price:price}]).pricedCount,0)
  const free=estimateCart(['free'],[{id:'free',regular_price:1000,resident_price:0}])
  assert.equal(free.pricedCount,1);assert.equal(free.resident,0);assert.equal(free.savings,1000)
})
test('장바구니는 저장된 가격이 아닌 최신 조회 자료로 계산하고 정기휴관은 예외 확인 안내',()=>{
  const changed=rows.map(row=>row.id===selected[0]?{...row,resident_price:600}:row)
  assert.equal(estimateCart(selected,changed).resident,3100)
  const monday=estimateCart(['benefit-haenyeo'],rows,{date:'2026-11-02'})
  assert.match(monday.entries[0].warnings.join(' '),/정기휴관/)
  assert.equal(monday.pricedCount,1)
  assert.equal(visitDate('2026-02-30'),'');assert.equal(visitDate('2026-11-03'),'2026-11-03')
  assert.equal(estimateCart(selected,[],{}).excludedCount,2)
})
