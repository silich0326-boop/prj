function forecastDateTime(value) {
  const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})\s+(\d{2})(\d{2})$/)
  if (!match) return { date: '날짜 확인 불가', time: '—' }
  return { date: match[1] + '.' + match[2] + '.' + match[3], time: match[4] + ':' + match[5] }
}

export default function WeatherForecast({ weather }) {
  if (typeof weather === 'string') return <p role="alert" className="mt-3">{weather}</p>
  if (!weather) return null
  if (!weather.length) return <p role="status" className="mt-3">표시할 예보가 없습니다. 잠시 후 다시 조회해 주세요.</p>
  return <div className="weather-results">
    <p className="weather-summary"><i className="bi bi-cloud-sun me-2"/>{weather[0].place} 시간별 예보 <span>한국시간 기준</span></p>
    <div className="table-responsive">
      <table className="table weather-table">
        <caption className="visually-hidden">기상청 시간별 단기예보. 날짜와 시간은 한국시간입니다.</caption>
        <thead><tr><th scope="col">예보 일시</th><th scope="col">하늘 상태</th><th scope="col">기온</th><th scope="col">강수확률</th></tr></thead>
        <tbody>{weather.map((w, i) => {
          const stamp = forecastDateTime(w.time)
          return <tr key={w.place + w.time + i}>
            <td><span className="forecast-date">{stamp.date}</span><strong className="forecast-time">{stamp.time}</strong></td>
            <td>{w.sky || '—'}</td>
            <td>{Number.isFinite(w.temp) ? w.temp + '°C' : '—'}</td>
            <td>{Number.isFinite(w.pop) ? w.pop + '%' : '—'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
    <p className="caption">출처: 기상청 단기예보 · 각 시각의 예측값이며 현재 관측값은 아닙니다.</p>
  </div>
}
