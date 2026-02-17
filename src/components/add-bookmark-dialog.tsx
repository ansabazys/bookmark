'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from './ui-components'
import AddBookmark from './add-bookmark'

export default function AddBookmarkDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[-2px] transition-all active:translate-y-[0px] active:shadow-none"
      >
        <Plus className="h-5 w-5" />
        Add New
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <AddBookmark onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  )
}
