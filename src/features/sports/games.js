export const exampleGames = [
  ['LG 트윈스', '두산 베어스', '잠실'],
  ['삼성 라이온즈', 'KIA 타이거즈', '대구'],
  ['롯데 자이언츠', '한화 이글스', '사직'],
  ['SSG 랜더스', 'KT 위즈', '문학'],
  ['NC 다이노스', '키움 히어로즈', '창원'],
  ['뉴욕 양키스', 'LA 다저스', 'MLB'],
].map(([away, home, venue], i) => ({ id: `example-${i + 1}`, away, home, venue, status: '예시 경기', example: true }))

export async function fetchGames(signal) {
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=linescore,team`, { signal })
  if (!response.ok) throw new Error('경기 정보를 가져오지 못했습니다.')
  const data = await response.json()
  return (data.dates ?? []).flatMap(day => day.games ?? []).map(game => ({
    id: String(game.gamePk), away: game.teams.away.team.name, home: game.teams.home.team.name,
    awayScore: game.teams.away.score, homeScore: game.teams.home.score,
    venue: game.venue?.name, live: game.status.abstractGameState === 'Live',
    status: game.status.abstractGameState === 'Live' ? `${game.linescore?.currentInningOrdinal ?? ''} ${game.linescore?.inningHalf ?? ''}`.trim() || '진행 중' : game.status.detailedState,
    time: new Date(game.gameDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }),
  })).sort((a, b) => Number(b.live) - Number(a.live))
}

// Only authorized, HTTPS embed URLs should be supplied in this configuration.
export function getBroadcast(gameId) {
  try {
    const entry = JSON.parse(import.meta.env.VITE_SPORTS_STREAMS || '{}')[gameId]
    const url = new URL(entry?.url)
    return url.protocol === 'https:' && ['embed', 'video'].includes(entry.type) ? entry : null
  } catch { return null }
}
