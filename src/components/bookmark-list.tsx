'use client'

import { createClient } from '@/lib/supabase/client'
import { Trash2, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

type Bookmark = {
  id: string
  url: string
  title: string
  created_at: string
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Initial fetch
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) setBookmarks(data)

      // Subscription
      channel = supabase
        .channel('realtime bookmarks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime payload:', payload)
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new as Bookmark, ...prev])
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
            } else if (payload.eventType === 'UPDATE') {
               setBookmarks((prev) => prev.map(b => b.id === payload.new.id ? payload.new as Bookmark : b))
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })
    }

    setupRealtime()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Error deleting bookmark')
    }
  }

  if (bookmarks.length === 0) {
      return <div className="text-center text-gray-500 py-10">No bookmarks yet. Add one!</div>
  }

  return (
    <ul className="divide-y divide-gray-200">
      {bookmarks.map((bookmark) => (
        <li key={bookmark.id} className="py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 truncate hover:underline flex items-center gap-1">
                    {bookmark.title || bookmark.url}
                    <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
            </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  )
}
