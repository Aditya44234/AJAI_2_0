"use client"

import { Sidebar } from "@/components/Sidebar"
import { ChatWindow } from "@/components/ChatWindow"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow />
      </main>
    </div>
  )
}
