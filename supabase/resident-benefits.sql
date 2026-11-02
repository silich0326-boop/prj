-- 공식 안내 확인일: 2026-11-02. 관리자 SQL Editor에서 한 번 실행합니다.
create table if not exists public.resident_benefits (
 id text primary key, name text not null, region text not null, area text not null, space_type text not null,
 regular_price integer not null check(regular_price >= 0), resident_price integer not null check(resident_price >= 0),
 price_basis text not null, adult_min_age integer not null, adult_max_age integer not null,
 eligibility text not null, documents text not null, notes text not null,
 source_url text not null, verified_on date not null, valid_from date, valid_until date,
 closures jsonb not null default '[]'::jsonb, closed_weekday integer, color text not null, icon text not null
);
alter table public.resident_benefits enable row level security;
grant select on public.resident_benefits to anon, authenticated;
revoke insert, update, delete on public.resident_benefits from anon, authenticated;
drop policy if exists "public benefits read" on public.resident_benefits;
create policy "public benefits read" on public.resident_benefits for select to anon, authenticated using (true);

insert into public.resident_benefits (id, name, region, area, space_type, regular_price, resident_price, price_basis, adult_min_age, adult_max_age, eligibility, documents, notes, source_url, verified_on, valid_from, valid_until, closures, closed_weekday, color, icon) values
('benefit-haenyeo', '제주해녀박물관', '제주시', '구좌읍', '실내 중심', 1100, 550, '공식 요금표 명시', 25, 64, '제주특별자치도에 주민등록이 되어 있는 주민. 재외도민증 소지자도 50% 감면 대상입니다.', '신분증 및 제주거주 증명서 확인 후 도민 요금 적용', '도민 전체 무료가 아닙니다. 12세 이하·65세 이상 등 별도의 면제 대상은 공식 안내를 확인하세요.', 'https://www.jeju.go.kr/haenyeo/exhibit/guide.htm', '2026-11-02', null, null, '[]', 1, '#97c9ce', 'water'),
('benefit-folklore', '제주민속자연사박물관', '제주시', '일도이동', '실내·야외', 2000, 1000, '공식 요금표 명시', 25, 64, '도민·재외도민·명예도민 및 그 직계존속·비속 50% 감면', '구체적인 증빙서류는 관람안내 페이지에 명시되지 않았습니다. 방문 전 박물관에 확인하세요.', '12세 이하·65세 이상 등 별도 면제 기준이 있습니다. 훈증 소독에 따른 추가 휴관이 있을 수 있습니다. 주차료는 관람료와 별도입니다.', 'https://www.jeju.go.kr/museum/guidance/view.htm', '2026-11-02', null, null, '[]', 1, '#b9c99b', 'building'),
('benefit-kim', '김창열미술관', '제주시', '한림읍', '실내 중심', 2000, 1000, '공식 요금표 명시', 25, 64, '제주도민 요금 적용. 명예도민·재외도민과 직계존비속·제주고향사랑 기부증서 소지자도 공식 안내에 포함됩니다.', '신분증 및 가족관계등록부 등 해당 증빙서류 필수 지참', '6세 이하·65세 이상 등 별도 면제 대상이 있습니다. 동반 가족의 자격은 해당 증빙 조건을 확인하세요.', 'https://kimtschang-yeul.jeju.go.kr/cnt/cntManagerView.do?idx=12&menuNum=7200', '2026-11-02', null, null, '[]', 1, '#b0bfcf', 'droplet'),
('benefit-modern', '제주현대미술관 본관', '제주시', '한경면', '실내·야외', 2000, 1000, '일반 요금에 공식 50% 감면율 적용해 계산', 25, 64, '제주특별자치도에 주민등록이 되어 있는 주민으로 신분증 소지자 등 50% 감면. 재외·명예도민 등 별도 대상은 공식 안내를 확인하세요.', '신분증. 재외도민증·명예도민증 등 대상에 맞는 증빙 확인 필요', '본관 일반요금 기준입니다. 전시 성격에 따라 별도 요금·무료관람이 적용될 수 있습니다. 공공수장고 미디어아트 요금으로 확대 해석하지 마세요.', 'https://www.jeju.go.kr/jejumuseum/guide/viewing.htm', '2026-11-02', null, null, '[{"from":"2026-11-03","until":"2026-11-05","label":"본관·박광진관 임시휴관","source_url":"https://www.jeju.go.kr/jejumuseum/news/news.htm?act=view&seq=2037370"}]', 1, '#d9b5a0', 'palette'),
('benefit-stone', '제주돌문화공원', '제주시', '조천읍', '실내·야외', 5000, 2500, '일반 현장요금에 공식 50% 감면율 적용해 계산', 25, 64, '제주도민 입장료 50% 할인', '신분증 지참', '중복 할인 불가. 온라인 사전구매 요금에 도민 할인을 다시 적용하지 않습니다. 12세 이하·65세 이상 등 별도 무료관람 기준이 있습니다.', 'https://www.jeju.go.kr/jejustonepark/intro/guide.htm', '2026-11-02', null, null, '[]', 1, '#c8b79d', 'triangle')
on conflict(id) do update set name=excluded.name, region=excluded.region, area=excluded.area, space_type=excluded.space_type, regular_price=excluded.regular_price, resident_price=excluded.resident_price, price_basis=excluded.price_basis, adult_min_age=excluded.adult_min_age, adult_max_age=excluded.adult_max_age, eligibility=excluded.eligibility, documents=excluded.documents, notes=excluded.notes, source_url=excluded.source_url, verified_on=excluded.verified_on, valid_from=excluded.valid_from, valid_until=excluded.valid_until, closures=excluded.closures, closed_weekday=excluded.closed_weekday, color=excluded.color, icon=excluded.icon;
