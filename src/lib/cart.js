export const MAX_ADULTS=20
export function adultCount(value){
  const count=Number(value)
  return Number.isFinite(count)?Math.min(MAX_ADULTS,Math.max(1,Math.floor(count))):1
}
export function cartIds(values){
  return [...new Set((Array.isArray(values)?values:[]).filter(id=>typeof id==='string'&&id.length>0&&id.length<=128))].slice(0,50)
}
export function visitDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return ''
  const date=new Date(value+'T12:00:00Z')
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value?value:''
}
export function estimateCart(ids,rows,{adults=1,date=''}={}){
  const quantity=adultCount(adults),day=visitDate(date)
  const catalog=new Map(rows.map(row=>[row.id,row]))
  const entries=cartIds(ids).map(id=>{
    const benefit=catalog.get(id)
    const warnings=[]
    let issue=''
    if(!benefit)issue='등록 정보를 찾을 수 없어 요금을 확인할 수 없습니다.'
    else{
      const prices=[benefit.regular_price,benefit.resident_price]
      if(prices.some(price=>!Number.isSafeInteger(price)||price<0)||benefit.resident_price>benefit.regular_price)issue='요금을 확인할 수 없어 합계에서 제외했습니다.'
      const closure=(benefit.closures||[]).find(c=>day&&day>=c.from&&day<=c.until)
      if(closure)issue=closure.label+' 기간으로 선택한 날짜의 합계에서 제외했습니다.'
      if(day&&((benefit.valid_from&&day<benefit.valid_from)||(benefit.valid_until&&day>benefit.valid_until)))issue='선택한 날짜는 등록된 혜택 적용 기간 밖이어서 합계에서 제외했습니다.'
      if(day&&new Date(day+'T12:00:00Z').getUTCDay()===benefit.closed_weekday)warnings.push('정기휴관 요일입니다. 공휴일 예외와 실제 운영 여부를 확인하세요.')
      if(!benefit.valid_from&&!benefit.valid_until)warnings.push('혜택 유효기간 미명시 · 방문 전 최신 요금 확인')
    }
    const regular=issue?null:benefit.regular_price*quantity
    const resident=issue?null:benefit.resident_price*quantity
    if(regular!==null&&(!Number.isSafeInteger(regular)||!Number.isSafeInteger(resident)))issue='요금을 계산할 수 없어 합계에서 제외했습니다.'
    return {id,benefit,issue,warnings,regular:issue?null:regular,resident:issue?null:resident,savings:issue?null:regular-resident}
  })
  const priced=entries.filter(entry=>!entry.issue)
  const totals=priced.reduce((sum,entry)=>({regular:sum.regular+entry.regular,resident:sum.resident+entry.resident,savings:sum.savings+entry.savings}),{regular:0,resident:0,savings:0})
  return {entries,quantity,date:day,pricedCount:priced.length,excludedCount:entries.length-priced.length,...totals}
}
