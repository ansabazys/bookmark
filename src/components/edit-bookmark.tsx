'use client'

import { createClient } from '@/lib/supabase/client'
import { Pencil, Loader2, Link2, Type } from 'lucide-react'
import { useState } from 'react'
import { Button, Input } from './ui-components'

type Bookmark = {
  id: string
  url: string
  title: string
  created_at: string
}

export default function EditBookmark({ bookmark, onSuccess, onCancel }: { bookmark: Bookmark, onSuccess?: () => void, onCancel?: () => void }) {
  const [url, setUrl] = useState(bookmark.url)
  const [title, setTitle] = useState(bookmark.title)
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('bookmarks')
          .update({
            url,
            title: title || url,
          })
          .eq('id', bookmark.id)
          .eq('user_id', user.id)

        if (error) throw error
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Error updating bookmark:', error)
      alert('Error updating bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2 mb-4">
                <div className="p-1 bg-primary rounded-md border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Pencil className="h-4 w-4 text-black" />
                </div>
                Edit Bookmark
            </h3>
            
            <div className="grid gap-4">
                <div className="w-full border p-4 border-neutral-100 rounded-2xl flex gap-2 items-center">
                     <Type className="h-4 w-4 text-gray-400" />
                     <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bookmark Title..."
                        className="w-full outline-0 text-sm"
                    />
                </div>
                
                <div className="w-full border p-4 border-neutral-100 rounded-2xl flex gap-2 items-center">
                     <Link2 className="h-4 w-4 text-gray-400" />
                     <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="w-full outline-0 text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2"
                    variant="primary"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                </Button>
            </div>
        </form>
    </div>
  )
}
