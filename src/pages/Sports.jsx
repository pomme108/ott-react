import { useEffect, useState } from 'react'
import { exampleGames, fetchGames, getBroadcast } from '../features/sports/games'
import { BaseballSimulation } from '../features/sports/BaseballSimulation'
import { GameChat } from '../features/sports/GameChat'
import './Sports.css'

export function Sports() {
  const [games, setGames] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  useEffect(() => {
    let active = true
    let controller
    const refresh = async () => {
      controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      try {
        const result = await fetchGames(controller.signal)
        if (active) { setGames(result); setStatus('ready') }
      } catch { if (active) setStatus('error') }
      finally { clearTimeout(timeout) }
    }
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => { active = false; controller?.abort(); clearInterval(interval) }
  }, [])
  const items = games.length ? games : exampleGames
  const selected = items.find(game => game.id === selectedId) || items[0]
  const visible = filter === 'live' ? items.filter(game => game.live) : items
  const broadcast = selected.example ? null : getBroadcast(selected.id)
  return <main className="sports-page">
    <div className="sports-container">
      <div className="sports-breadcrumb">SPORTS <span>/</span> BASEBALL</div>
      <div className="sports-title-row"><div><p className="sports-eyebrow">매 순간, 함께 뜨겁게</p><h1>야구의 모든 순간<span>.</span></h1><p className="sports-subtitle">보고 싶은 경기를 선택하고, 팬들과 함께 응원하세요.</p></div><div className="sports-season">⚾ <span>BASEBALL<br /><strong>LIVE LOUNGE</strong></span></div></div>
      <section className="sports-schedule" aria-label="야구 경기 목록">
        <div className="sports-section-heading"><div className="sports-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체 경기 <span>{items.length}</span></button><button className={filter === 'live' ? 'active' : ''} onClick={() => setFilter('live')}>실시간 <span>{games.filter(game => game.live).length}</span></button></div><span className="sports-update">30초마다 경기 정보 갱신 · 한국 시간</span></div>
        {(!games.length || status === 'error') && <p className="sports-data-notice" role="status">{status === 'loading' ? '실제 경기 정보를 불러오는 중입니다. 아래는 화면 확인용 예시입니다.' : status === 'error' ? '실제 경기 정보를 연결하지 못했습니다. 예시 경기를 표시합니다. 실제 중계·점수가 아닙니다.' : '오늘 등록된 MLB 경기가 없습니다. 화면 확인용 예시 경기입니다.'}</p>}
        <div className="sports-games">{visible.map((game, index) => <button key={game.id} onClick={() => setSelectedId(game.id)} className={`game-card ${selected.id === game.id ? 'selected' : ''}`} aria-pressed={selected.id === game.id}>
          <div className="game-card-top"><span className={game.live ? 'game-live' : 'game-state'}>{game.live ? '● LIVE' : game.example ? 'EXAMPLE' : game.time}</span><span>{game.example ? '화면 예시' : 'MLB'}</span></div>
          <div className="game-team"><span className={`team-mark team-color-${index % 6}`}>{game.away.split(' ').at(-1).slice(0, 2)}</span><strong>{game.away}</strong><b>{game.awayScore ?? '–'}</b></div>
          <div className="game-team"><span className={`team-mark team-color-${(index + 2) % 6}`}>{game.home.split(' ').at(-1).slice(0, 2)}</span><strong>{game.home}</strong><b>{game.homeScore ?? '–'}</b></div>
          <div className="game-card-bottom"><span>{game.venue}</span><span>{game.status}</span></div>
        </button>)}</div>
        {!visible.length && <p className="sports-no-games">현재 진행 중인 경기가 없습니다. 전체 경기에서 일정을 확인하세요.</p>}
      </section>
      <div className="sports-watch-layout"><section className="sports-watch" aria-label="선택한 경기 중계">
        <div className="sports-player">{broadcast ? broadcast.type === 'embed' ? <iframe key={broadcast.url} src={broadcast.url} title={`${selected.away} 대 ${selected.home} 중계`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <video key={broadcast.url} controls playsInline src={broadcast.url} aria-label="야구 생중계" /> : <BaseballSimulation key={selected.id} game={selected} />}<div className="player-bottom"><span>함께 보는 즐거움, SPORTS</span><span>{selected.example ? '시뮬레이션' : selected.live ? '● 경기 진행 중' : selected.status}</span></div></div>
        <div className="sports-match-info"><div><span className="match-league">{selected.example ? 'EXAMPLE MATCH' : 'MLB BASEBALL'}</span><h2>{selected.away} <span>vs</span> {selected.home}</h2><p>{selected.venue} · {selected.example ? '실제 경기 일정과 무관한 화면 예시' : '경기 정보는 MLB 제공'}</p></div><span className="sports-match-icon">⚾</span></div>
        <div className="sports-watch-note"><strong>오늘의 응원석은 여기!</strong><p>경기를 선택하면 해당 경기의 채팅방으로 이동합니다. 로그인하고 함께 응원해 보세요.</p></div>
      </section><GameChat game={selected} /></div>
    </div>
  </main>
}
