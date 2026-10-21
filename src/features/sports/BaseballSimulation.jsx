import { useEffect, useRef, useState } from 'react'

export function BaseballSimulation({ game }) {
  const canvas = useRef(null)
  const clock = useRef(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    const context = canvas.current.getContext('2d')
    let frame
    let previous = 0
    const draw = now => {
      if (previous && playing) clock.current += Math.min(now - previous, 50)
      previous = now
      const t = clock.current / 1000
      const c = context
      c.clearRect(0, 0, 960, 540)
      c.fillStyle = '#0b171b'; c.fillRect(0, 0, 960, 540)
      // Stands and floodlights, drawn locally without external assets.
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 65; col++) {
          c.fillStyle = ['#455b64', '#9fa78c', '#6b8d89', '#bdc1a0'][(row * 7 + col * 3) % 4]
          c.fillRect(col * 15 + 3, 50 + row * 10, 5, 4)
        }
      }
      c.fillStyle = '#263e39'; c.fillRect(0, 112, 960, 24)
      c.fillStyle = '#b8dd96'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center'
      c.fillText('BASEBALL LOUNGE  •  TOGETHER WE PLAY', 480, 129)
      c.fillStyle = '#285d3d'; c.beginPath(); c.moveTo(480, 485); c.lineTo(80, 140); c.quadraticCurveTo(480, 10, 880, 140); c.closePath(); c.fill()
      c.save(); c.beginPath(); c.moveTo(480,485);c.lineTo(80,140);c.quadraticCurveTo(480,10,880,140);c.closePath();c.clip()
      for(let i=0;i<12;i++){c.fillStyle=i%2?'#ffffff06':'#00000006';c.fillRect(i*90,130,90,370)}
      c.restore()
      c.fillStyle = '#b58c5b';c.beginPath();c.moveTo(480,459);c.lineTo(320,325);c.lineTo(480,208);c.lineTo(640,325);c.closePath();c.fill()
      c.fillStyle = '#39804d';c.beginPath();c.moveTo(480,416);c.lineTo(367,324);c.lineTo(480,247);c.lineTo(593,324);c.closePath();c.fill()
      c.strokeStyle = '#eee5c8';c.lineWidth = 2;c.beginPath();c.moveTo(90,145);c.lineTo(480,463);c.lineTo(870,145);c.stroke()
      const base = (x,y) => {c.fillStyle='#fff8e6';c.save();c.translate(x,y);c.rotate(Math.PI/4);c.fillRect(-5,-5,10,10);c.restore()}
      base(480,455);base(325,325);base(480,215);base(635,325)
      const player = (x,y,color) => {c.fillStyle='#0004';c.beginPath();c.ellipse(x,y+10,11,4,0,0,Math.PI*2);c.fill();c.fillStyle=color;c.fillRect(x-5,y-4,10,14);c.fillStyle='#e5b98d';c.beginPath();c.arc(x,y-9,5,0,Math.PI*2);c.fill();c.fillStyle='#eee';c.fillRect(x-5,y+9,4,9);c.fillRect(x+1,y+9,4,9)}
      for(const [x,y] of [[250,220],[480,160],[710,220],[335,295],[625,295],[450,240],[550,345]]) player(x,y,'#e6eae1')
      player(480,336,'#e6eae1');player(460,447,'#d55448');player(480,478,'#e6eae1')
      const cycle=t%8
      let ballX,ballY
      if(cycle<2){ballY=336+cycle/2*105;ballX=480-cycle*5}
      else if(cycle<4){const progress=(cycle-2)/2;ballX=470+progress*230;ballY=441-progress*270-Math.sin(progress*Math.PI)*75}
      else {ballX=700;ballY=171}
      if(cycle<4){c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=8;c.beginPath();c.arc(ballX,ballY,4,0,Math.PI*2);c.fill();c.shadowBlur=0}
      if(cycle>2&&cycle<6){const progress=(cycle-2)/4;player(480+progress*155,452-progress*127,'#d55448')}
      c.fillStyle='#0b1419e8';c.fillRect(28,156,250,79);c.textAlign='left';c.fillStyle='#c8ee9b';c.font='bold 12px sans-serif';c.fillText('DEMO • 시뮬레이션',42,177)
      c.font='bold 14px sans-serif';c.fillStyle='#fff';c.fillText(game.away,42,201,180);c.fillText(game.home,42,222,180)
      c.textAlign='right';c.fillText(String(Math.floor(t/32)%7),260,201);c.fillText(String(Math.floor(t/40)%6),260,222)
      c.fillStyle='#0b1419db';c.fillRect(300,492,360,30);c.textAlign='center';c.font='13px sans-serif';c.fillStyle='#fff'
      c.fillText(!playing ? '일시정지' : cycle<2 ? '투수가 공을 던집니다!' : cycle<4 ? '타격! 타구가 외야로 향합니다' : cycle<6 ? '주자가 1루로 달립니다' : '다음 투구를 준비합니다',480,512)
      frame=requestAnimationFrame(draw)
    }
    frame=requestAnimationFrame(draw)
    return()=>cancelAnimationFrame(frame)
  }, [game.away, game.home, playing])
  return <div className="baseball-simulation"><canvas ref={canvas} width={960} height={540} role="img" aria-label={`${game.away} 대 ${game.home} 야구 시뮬레이션. 실제 경기 영상이 아닙니다.`} /><div className="simulation-controls"><button onClick={()=>setPlaying(value=>!value)}>{playing?'Ⅱ 일시정지':'▶ 재생'}</button><span>직접 제작한 시뮬레이션 · 실제 생중계 아님</span></div></div>
}
