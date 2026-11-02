export function benefitToPlace(b) {
  return { id:b.id, name:b.name, tag:'도민 혜택', area:b.region+' '+b.area,
    icon:b.icon, color:b.color, desc:b.eligibility, benefit:b }
}
export function filterBenefits(rows, {keyword='', area='', space='', maxPrice='', date=''} = {}) {
  return rows.filter(b => (!keyword || (b.name+b.region+b.area+b.eligibility).includes(keyword))
    && (!area || b.area === area)
    && (!space || b.space_type === space)
    && (maxPrice === '' || b.resident_price <= Number(maxPrice))
    && (!date || ((!b.valid_from || date >= b.valid_from) && (!b.valid_until || date <= b.valid_until))))
}
export function temporaryClosure(b, date) {
  return (b.closures || []).find(c => date && date >= c.from && date <= c.until)
}
export function formatBenefitDate(value) { return value ? value.replaceAll('-', '.') : '별도 명시 없음' }
