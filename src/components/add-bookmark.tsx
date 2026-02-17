'use client'

import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Link2, Type } from 'lucide-react'
import { useState } from 'react'
import { Button, Input } from './ui-components'

export default function AddBookmark({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
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
        const { error } = await supabase.from('bookmarks').insert({
          url,
          user_id: user.id,
          title: title || url,
        })
        if (error) throw error
        setUrl('')
        setTitle('')
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
      alert('Error adding bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2 mb-4">
                <div className="p-1 bg-primary rounded-md border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Plus className="h-4 w-4 text-black" />
                </div>
                Add New Bookmark
            </h3>
            
            <div className="grid gap-4">
                <div className="w-full border p-4 border-neutral-100 rounded-2xl flex gap-2 items-center">
                     <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bookmark Title..."
                        className="w-full outline-0"
                    />
                </div>
                
                <div className="w-full border p-4 border-neutral-100 rounded-2xl flex gap-2 items-center">
                     <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="w-full outline-0"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-4"
                variant="primary"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Bookmark"}
            </Button>
        </form>
    </div>
  )
}
