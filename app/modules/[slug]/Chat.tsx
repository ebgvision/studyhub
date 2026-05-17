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
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${moduleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `module_id=eq.${moduleId}`,
        },
        async (payload) => {
          // Profil des neuen Users laden
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg: Message = {
            ...(payload.new as Message),
            profiles: profile,
          }
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [moduleId])

  // Likes beim Laden holen
  useEffect(() => {
    supabase
      .from('chat_likes')
      .select('message_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((l) => l.message_id)))
      })
  }, [userId])

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)

    // Profil sicherstellen
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
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function toggleLike(message: Message) {
    const alreadyLiked = likedIds.has(message.id)

    if (alreadyLiked) {
      await supabase.from('chat_likes').delete()
        .eq('user_id', userId).eq('message_id', message.id)
      await supabase.from('chat_messages').update({ like_count: message.like_count - 1 })
        .eq('id', message.id)
      setLikedIds((prev) => { const n = new Set(prev); n.delete(message.id); return n })
      setMessages((prev) => prev.map((m) =>
        m.id === message.id ? { ...m, like_count: m.like_count - 1 } : m
      ))
    } else {
      await supabase.from('chat_likes').insert({ user_id: userId, message_id: message.id })
      await supabase.from('chat_messages').update({ like_count: message.like_count + 1 })
        .eq('id', message.id)
      setLikedIds((prev) => new Set([...prev, message.id]))
      setMessages((prev) => prev.map((m) =>
        m.id === message.id ? { ...m, like_count: m.like_count + 1 } : m
      ))
    }
  }

  // Top-Level und Antworten trennen
  const topLevel = messages.filter((m) => !m.parent_id)
  const getReplies = (id: string) => messages.filter((m) => m.parent_id === id)

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Nachrichten */}
      <div className="h-96 overflow-y-auto p-5 space-y-4">
        {topLevel.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Noch keine Nachrichten — starte die Diskussion! 👋
          </div>
        )}

        {topLevel.map((msg) => (
          <div key={msg.id}>
            <MessageBubble
              msg={msg}
              isOwn={msg.user_id === userId}
              liked={likedIds.has(msg.id)}
              onLike={() => toggleLike(msg)}
              onReply={() => setReplyTo(msg)}
              formatTime={formatTime}
            />

            {/* Antworten */}
            {getReplies(msg.id).map((reply) => (
              <div key={reply.id} className="ml-8 mt-2">
                <MessageBubble
                  msg={reply}
                  isOwn={reply.user_id === userId}
                  liked={likedIds.has(reply.id)}
                  onLike={() => toggleLike(reply)}
                  onReply={() => setReplyTo(msg)}
                  formatTime={formatTime}
                  isReply
                />
              </div>
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="border-t border-gray-100 p-4 space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span>↩ Antwort an <strong>{replyTo.profiles?.username ?? 'Anonym'}</strong>: {replyTo.content.slice(0, 40)}...</span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Nachricht schreiben..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !content.trim()}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {sending ? '...' : 'Senden'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  msg, isOwn, liked, onLike, onReply, formatTime, isReply = false,
}: {
  msg: Message
  isOwn: boolean
  liked: boolean
  onLike: () => void
  onReply: () => void
  formatTime: (s: string) => string
  isReply?: boolean
}) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isOwn ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {(msg.profiles?.username ?? 'A')[0].toUpperCase()}
      </div>

      <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium text-gray-600">
            {isOwn ? 'Du' : (msg.profiles?.username ?? 'Anonym')}
          </span>
          <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
        </div>

        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
          isOwn
            ? 'bg-teal-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>

        {/* Aktionen */}
        <div className={`flex gap-3 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onLike}
            className={`text-xs flex items-center gap-1 transition-colors ${
              liked ? 'text-teal-600 font-medium' : 'text-gray-400 hover:text-teal-500'
            }`}
          >
            👍 {msg.like_count > 0 && msg.like_count}
          </button>
          {!isReply && (
            <button
              onClick={onReply}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ↩ Antworten
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
