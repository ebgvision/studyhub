'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  created_at: string
  like_count: number
  parent_id: string | null
  user_id: string | null
  profiles: { username: string | null } | null
}

const SHOW_INITIALLY = 3

export default function Chat({
  moduleId,
  userId,
  initialMessages,
}: {
  moduleId: string
  userId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time')
  const [showAll, setShowAll] = useState(true)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${moduleId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `module_id=eq.${moduleId}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles').select('username').eq('id', payload.new.user_id).single()
        const newMsg: Message = { ...(payload.new as Message), profiles: profile }
        setMessages((prev) => [...prev, newMsg])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `module_id=eq.${moduleId}`,
      }, (payload) => {
        setMessages((prev) => prev.map((m) =>
          m.id === payload.new.id ? { ...m, like_count: payload.new.like_count } : m
        ))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [moduleId])

  // Likes laden
  useEffect(() => {
    supabase.from('chat_likes').select('message_id').eq('user_id', userId)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((l) => l.message_id)))
      })
  }, [userId])

  // Beim ersten Laden sofort nach unten scrollen (neueste Nachrichten sehen)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [])

  // Bei neuen Nachrichten smooth nach unten scrollen
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)
    await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })
    await supabase.from('chat_messages').insert({
      module_id: moduleId,
      user_id: userId,
      content: content.trim(),
      parent_id: replyTo?.id ?? null,
    })
    setContent('')
    setReplyTo(null)
    setSending(false)
  }

  async function toggleLike(message: Message) {
    const alreadyLiked = likedIds.has(message.id)
    if (alreadyLiked) {
      await supabase.from('chat_likes').delete().eq('user_id', userId).eq('message_id', message.id)
      await supabase.from('chat_messages').update({ like_count: message.like_count - 1 }).eq('id', message.id)
      setLikedIds((prev) => { const n = new Set(prev); n.delete(message.id); return n })
      setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, like_count: m.like_count - 1 } : m))
    } else {
      await supabase.from('chat_likes').insert({ user_id: userId, message_id: message.id })
      await supabase.from('chat_messages').update({ like_count: message.like_count + 1 }).eq('id', message.id)
      setLikedIds((prev) => new Set([...prev, message.id]))
      setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, like_count: m.like_count + 1 } : m))
    }
  }

  function focusInput(parentMsg?: Message) {
    setReplyTo(parentMsg ?? null)
    inputRef.current?.focus()
  }

  function toggleThread(id: string) {
    setExpandedThreads((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  const topLevel = messages.filter((m) => !m.parent_id)
  const getReplies = (id: string) => messages.filter((m) => m.parent_id === id)

  const sorted = [...topLevel].sort((a, b) => {
    if (sortBy === 'likes') return b.like_count - a.like_count
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const visible = showAll ? sorted : sorted.slice(0, SHOW_INITIALLY)
  const hiddenCount = sorted.length - SHOW_INITIALLY

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Sort-Leiste */}
      {topLevel.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">{topLevel.length} Beiträge</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSortBy('time')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${sortBy === 'time' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Neueste
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${sortBy === 'likes' ? 'bg-teal-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Meiste Likes
            </button>
          </div>
        </div>
      )}

      {/* Nachrichten */}
      <div ref={messagesContainerRef} className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {sorted.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            Noch keine Beiträge — starte die Diskussion! 👋
          </div>
        )}

        {visible.map((msg, idx) => {
          const replies = getReplies(msg.id)
          const threadExpanded = expandedThreads.has(msg.id)
          const visibleReplies = threadExpanded ? replies : replies.slice(0, 3)
          const hiddenReplies = replies.length - 3

          return (
            <div key={msg.id}>
              <MessageRow
                msg={msg}
                isOwn={msg.user_id === userId}
                liked={likedIds.has(msg.id)}
                onLike={() => toggleLike(msg)}
                onComment={() => focusInput(msg)}
                formatTime={formatTime}
              />

              {/* Eingerückte Kommentare */}
              {replies.length > 0 && (
                <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                  {visibleReplies.map((reply) => (
                    <MessageRow
                      key={reply.id}
                      msg={reply}
                      isOwn={reply.user_id === userId}
                      liked={likedIds.has(reply.id)}
                      onLike={() => toggleLike(reply)}
                      onComment={() => focusInput(msg)}
                      formatTime={formatTime}
                      isReply
                    />
                  ))}
                  {hiddenReplies > 0 && !threadExpanded && (
                    <button
                      onClick={() => toggleThread(msg.id)}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium py-0.5"
                    >
                      + {hiddenReplies} weitere Kommentare anzeigen
                    </button>
                  )}
                  {threadExpanded && replies.length > 3 && (
                    <button
                      onClick={() => toggleThread(msg.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 py-0.5"
                    >
                      Weniger anzeigen ↑
                    </button>
                  )}
                </div>
              )}

              {/* Kommentieren-Button am letzten Beitrag */}
              {idx === visible.length - 1 && (
                <button
                  onClick={() => focusInput(msg)}
                  className="ml-0 mt-1 text-xs text-gray-400 hover:text-teal-600 transition-colors"
                >
                  ↩ Kommentieren
                </button>
              )}
            </div>
          )
        })}

        {/* Mehr anzeigen */}
        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors"
          >
            + {hiddenCount} weitere Beiträge anzeigen
          </button>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
            <span>↩ Kommentar zu <strong>{replyTo.profiles?.username ?? 'Anonym'}</strong>: {replyTo.content.slice(0, 50)}{replyTo.content.length > 50 ? '…' : ''}</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={replyTo ? 'Kommentar schreiben...' : 'Nachricht schreiben...'}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !content.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {sending ? '...' : 'Senden'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageRow({
  msg, isOwn, liked, onLike, onComment, formatTime, isReply = false,
}: {
  msg: Message
  isOwn: boolean
  liked: boolean
  onLike: () => void
  onComment: () => void
  formatTime: (s: string) => string
  isReply?: boolean
}) {
  return (
    <div className="flex gap-2 group">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isOwn ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {(msg.profiles?.username ?? 'A')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-700">{isOwn ? 'Du' : (msg.profiles?.username ?? 'Anonym')}</span>
          <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
        </div>
        <div className={`inline-block rounded-xl px-3 py-1.5 text-sm max-w-sm ${isOwn ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          {msg.content}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={onLike}
            className={`text-xs flex items-center gap-1 transition-colors ${liked ? 'text-teal-600 font-medium' : 'text-gray-400 hover:text-teal-500'}`}
          >
            👍 {msg.like_count > 0 ? msg.like_count : ''}
          </button>
          {!isReply && (
            <button onClick={onComment} className="text-xs text-gray-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100">
              ↩ Kommentieren
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
