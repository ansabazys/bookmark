'use client'

import { createClient } from '@/lib/supabase/client'
import { Trash2, ExternalLink, Globe, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, Badge } from './ui-components'

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
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new as Bookmark, ...prev])
            } else if (payload.eventType === 'DELETE') {
              setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
            } else if (payload.eventType === 'UPDATE') {
               setBookmarks((prev) => prev.map(b => b.id === payload.new.id ? payload.new as Bookmark : b))
            }
          }
        )
        .subscribe()
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
      return (
        <Card className="p-8 text-center border-dashed border-2 border-gray-300 bg-gray-50/50">
            <div className="flex justify-center mb-4">
                <Globe className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bookmarks yet</h3>
            <p className="text-gray-500 mt-1">Add your first bookmark to get started!</p>
        </Card>
      )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="p-5 flex flex-col justify-between hover:border-black transition-all group bg-white">
            <div className="flex items-start justify-between mb-4">
                 <div className="p-2.5 bg-accent-blue/20 rounded-xl group-hover:bg-accent-blue/30 transition-colors">
                    <Globe className="h-6 w-6 text-blue-700" />
                 </div>
                 <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete"
                 >
                    <Trash2 className="h-4 w-4" />
                 </button>
            </div>
            
            <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-1">
                    {bookmark.title || "Untitled Bookmark"}
                </h4>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              
                <a 
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                    VISIT <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
        </Card>
      ))}
    </div>
  )
}
