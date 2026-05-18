'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string | null
  username: string | null
  is_anonymous: boolean
}

export default function FeedbackChat({
  userId,
  isAnonymous,
  isAdmin,
  initialMessages,
}: {
  userId: string
  isAnonymous: boolean
  isAdmin: boolean
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('feedback-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback_messages',
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, is_anonymous')
          .eq('id', payload.new.user_id)
          .single()

        const newMsg: Message = {
          id: payload.new.id,
          content: payload.new.content,
          created_at: payload.new.created_at,
          user_id: payload.new.user_id,
          username: profile?.is_anonymous ? 'Anonym' : (profile?.username ?? null),
          is_anonymous: profile?.is_anonymous ?? false,
        }
        setMessages(prev => [...prev, newMsg])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'feedback_messages',
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [])

  async function sendMessage() {
    const text = content.trim()
    if (!text || sending) return
    setSending(true)
    await supabase.from('feedback_messages').insert({
      user_id: userId,
      content: text,
    })
    setContent('')
    setSending(false)
  }

  async function deleteMessage(id: string) {
    if (!confirm('Nachricht löschen?')) return
    await supabase.from('feedback_messages').delete().eq('id', id)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function avatarLetter(msg: Message) {
    if (msg.user_id === userId) return 'D'
    if (msg.is_anonymous || !msg.username) return '?'
    return msg.username[0].toUpperCase()
  }

  function displayName(msg: Message) {
    if (msg.user_id === userId) return 'Du'
    if (msg.is_anonymous || !msg.username) return 'Anonym'
    return msg.username
  }

  const grouped = messages.map((m, i) => ({
    ...m,
    isGrouped: i > 0 && messages[i - 1].user_id === m.user_id,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">{messages.length} Beiträge</span>
        <span className="text-xs text-teal-600 font-medium">Live</span>
      </div>

      {/* Nachrichten */}
      <div className="px-4 pt-3 pb-2 max-h-[400px] overflow-y-auto">
        {grouped.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Noch keine Beiträge — sei der Erste! 🎉
          </div>
        )}

        {grouped.map(msg => (
          <div key={msg.id} className={`flex items-start gap-2 group ${msg.isGrouped ? 'mt-0.5' : 'mt-3'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0 w-6 mt-0.5">
              {!msg.isGrouped ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${msg.user_id === userId ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {avatarLetter(msg)}
                </div>
              ) : null}
            </div>

            {/* Inhalt */}
            <div className="flex-1 min-w-0">
              {!msg.isGrouped && (
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700">{displayName(msg)}</span>
                  <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className={`inline-block rounded-xl px-3 py-1.5 text-sm max-w-xs break-words ${msg.user_id === userId ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {msg.content}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="text-xs px-1.5 py-0.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Löschen"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Schreib dein Feedback, Wünsche oder Ideen..."
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
