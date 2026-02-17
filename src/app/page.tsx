import { createClient } from "@/lib/supabase/server";
import AddBookmarkDialog from "@/components/add-bookmark-dialog";
import BookmarkList from "@/components/bookmark-list";
import {
  LogOut,
  Home as HomeIcon,

} from "lucide-react";
import { redirect } from "next/navigation";


export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName = user.user_metadata?.full_name?.split(" ")[0] || "Friend";

  return (
    <div className="flex justify-center bg-gray-50">
      <div className="min-h-screen w-full max-w-6xl  pb-10 relative">
        {/* Background Decor */}
        <div className="fixed top-0 left-0 w-full h-125 bg-linear-to-b from-primary/10 to-transparent pointer-events-none z-0" />

        {/* Header Section */}
        <header className="px-6 py-8 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-white mb-4">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600">ONLINE</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Hello {userName}!
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                This is your personal success journey
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="p-2 bg-white rounded-xl  border border-neutral-200 hover:bg-gray-50 transition-colors text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <main className="px-6 relative z-10 space-y-8">
          {/* Add Section */}
          <section className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">Your Bookmarks</h3>
            <AddBookmarkDialog />
          </section>

          {/* List Section */}
          <section>
             <div className="flex items-center justify-between mb-4">
               {/* Separator moved or removed as per design preference, keeping clean for now */}
             </div>
            <BookmarkList />
          </section>
        </main>
      </div>
    </div>
  );
}
