import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Smile } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';

const QUICK_EMOJIS = ['😂', '🔥', '🍿', '🎬', '😭', '💀', '👀', '❤️', '🙌', '😍', '🤣', '💯'];

export default function GroupChat() {
  const { groupId } = useParams();
  const { user } = useUser();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    api.get(`/group/${groupId}`)
      .then((res) => {
        setGroup(res.data.group);
        setMembers(res.data.members || []);
      })
      .catch(console.error);

    api.get(`/group/${groupId}/messages`)
      .then((res) => setMessages(res.data.messages || []))
      .catch((err) => console.error('Failed to load messages:', err));
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on('chat_message', handleMessage);
    return () => socket.off('chat_message', handleMessage);
  }, [socket]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !socket) return;
    socket.emit('chat_message', { text: inputText.trim() });
    setInputText('');
    setShowEmoji(false);
  };

  const appendEmoji = (emoji) => {
    setInputText((p) => p + emoji);
    inputRef.current?.focus();
  };

  const avatarColor = (name = '') => {
    const colors = ['#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#ef4444'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="app-shell">
      <Sidebar groupName={group?.name} membersCount={members.length} />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px 36px' }}>
        {/* Chat Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Group Chat</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <div className="online-dot" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="doodle-text" style={{ transform: 'rotate(-5deg)', fontSize: '1.3rem', color: '#ff7b88' }}>
            Plans • Memes • Shows ♡
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '6px' }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
              <p style={{ fontSize: '0.92rem' }}>No messages yet. Say hi! 👋</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.memberId || msg.senderName === user?.name;
            const bg = avatarColor(msg.senderName);

            return (
              <div
                key={msg.id || msg._id || Math.random()}
                className="chat-message"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  maxWidth: '76%'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isMe ? 'var(--accent-grad)' : bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 800, flexShrink: 0
                }}>
                  {msg.senderName?.charAt(0).toUpperCase()}
                </div>

                {/* Bubble */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{
                    background: isMe
                      ? 'linear-gradient(135deg, #4F2E7D, #2D1A54)'
                      : 'var(--bg-card)',
                    border: isMe ? '1px solid rgba(142,68,173,0.4)' : '1px solid var(--border-subtle)',
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    color: '#fff', fontSize: '0.9rem', lineHeight: 1.45,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ marginTop: '16px', position: 'relative' }}>
          {showEmoji && (
            <div className="emoji-picker">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} className="emoji-btn" onClick={() => appendEmoji(e)}>{e}</button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-icon"
              style={{ flexShrink: 0 }}
              onClick={() => setShowEmoji((p) => !p)}
              title="Emoji"
            >
              <Smile size={20} color={showEmoji ? 'var(--accent-purple-light)' : undefined} />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field"
              style={{ borderRadius: 'var(--radius-full)', padding: '12px 20px', background: 'var(--bg-card)' }}
              onFocus={() => setShowEmoji(false)}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={!inputText.trim()}
              style={{ width: '46px', height: '46px', borderRadius: '50%', padding: 0, flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
