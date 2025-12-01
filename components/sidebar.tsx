"use client"

interface SidebarProps {
  onReset: () => void
}

export default function Sidebar({ onReset }: SidebarProps) {
  return (
    <aside className="w-16 lg:w-56 bg-sidebar flex flex-col h-screen">
      {/* Logo area */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-accent flex items-center justify-center">
          <svg
            className="w-4 h-4 lg:w-5 lg:h-5 text-accent-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="hidden lg:block text-xs font-medium text-sidebar-foreground mt-3 tracking-wide">NEWS TO CHAT</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-sidebar-border/50 text-sidebar-foreground text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span className="hidden lg:inline">Convert</span>
          </button>
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 lg:p-4 border-t border-sidebar-border">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border/30 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden lg:inline">Reset</span>
        </button>
      </div>

      {/* Version */}
      <div className="hidden lg:block p-4 text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">v1.0.0</div>
    </aside>
  )
}
