import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../firebase/firebase'

function ChatRoom({ game }) {
  const [user, setUser] = useState(auth.currentUser)
  const [messages, setMessages] = useState([])
  const [connection, setConnection] = useState('connecting')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottom = useRef(null)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  useEffect(() => {
    if (game.example || !user) return
    const messagesQuery = query(collection(db, 'sportsRooms', game.id, 'messages'), orderBy('createdAt', 'desc'), limit(100))
    return onSnapshot(messagesQuery, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse())
      setConnection('connected')
    }, () => {
      setConnection('failed')
      setError('채팅 서버에 연결할 수 없습니다. 네트워크와 Firestore 접근 설정을 확인해 주세요.')
    })
  }, [game.id, game.example, user])
  useEffect(() => {
    const container = bottom.current?.parentElement
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])
  const login = async () => {
    setError('')
    try { await signInWithPopup(auth, googleProvider) }
    catch { setError('로그인하지 못했습니다. 팝업 허용 및 Firebase 인증 설정을 확인해 주세요.') }
  }
  const send = async event => {
    event.preventDefault()
    if (!user || !text.trim() || sending || connection !== 'connected' || game.example) return
    setSending(true); setError('')
    try {
      await addDoc(collection(db, 'sportsRooms', game.id, 'messages'), {
        uid: user.uid, name: (user.displayName || '야구 팬').slice(0, 40), text: text.trim().slice(0, 300), createdAt: serverTimestamp(),
      })
      setText('')
    } catch { setError('메시지를 전송하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.') }
    finally { setSending(false) }
  }
  const available = !game.example && user && connection === 'connected'
  return <aside className="sports-chat" aria-label="경기별 실시간 채팅">
    <div className="chat-heading"><div><h2>함께 응원하기</h2><p>같은 경기를 보는 팬들과 실시간으로</p></div><span className={available ? 'connection online' : 'connection'}>{available ? '연결됨' : '대기 중'}</span></div>
    <div className="chat-notice">⚾ {game.away} vs {game.home}</div>
    <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
      {messages.length === 0 && <div className="chat-empty"><span>♧</span><strong>응원도, 짜릿한 순간도 함께</strong><p>{game.example ? '예시 경기에서는 채팅을 전송하지 않습니다.' : !user ? '로그인하고 경기 채팅에 참여해 보세요.' : connection === 'failed' ? '채팅 연결을 확인해 주세요.' : connection === 'connected' ? '첫 응원 메시지를 남겨보세요!' : '채팅 서버에 연결하고 있습니다…'}</p></div>}
      {messages.map(message => <div key={message.id} className={`chat-message ${message.uid === user?.uid ? 'mine' : ''}`}><span className="chat-avatar">{message.name?.slice(0, 1) || '팬'}</span><div><strong>{message.name || '야구 팬'}</strong><p>{message.text}</p></div></div>)}
      <div ref={bottom} />
    </div>
    {error && <p className="chat-error" role="alert">{error}</p>}
    {!user && !game.example && <button className="sports-login" onClick={login}>Google 로그인으로 참여하기</button>}
    <form onSubmit={send} className="chat-form"><label className="sr-only" htmlFor="sports-message">응원 메시지</label><input id="sports-message" value={text} onChange={event => setText(event.target.value)} maxLength={300} disabled={!available || sending} placeholder={available ? '응원 메시지를 입력하세요' : '채팅 연결 후 참여할 수 있어요'} /><button aria-label="메시지 전송" disabled={!available || sending || !text.trim()}>{sending ? '…' : '↑'}</button></form>
    <p className="chat-guideline">서로를 존중하는 응원 문화를 함께 만들어요.</p>
  </aside>
}
export function GameChat({ game }) { return <ChatRoom key={game.id} game={game} /> }
