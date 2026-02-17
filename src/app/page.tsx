import { createClient } from '@/lib/supabase/server'
import AddBookmark from '@/components/add-bookmark'
import BookmarkList from '@/components/bookmark-list'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <form action="/auth/signout" method="post">
             <button type="submit" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4" />
                Sign out
             </button>
          </form>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
                <AddBookmark />
            </div>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <BookmarkList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
