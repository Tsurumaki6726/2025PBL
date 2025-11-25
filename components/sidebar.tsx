"use client"

interface SidebarProps {
  tone: "frank" | "serious" | "educational"
  setTone: (tone: "frank" | "serious" | "educational") => void
  onReset: () => void
}

export default function Sidebar({ tone, setTone, onReset }: SidebarProps) {
  const toneOptions = [
    { value: "frank" as const, label: "フランク", description: "カジュアルな雰囲気" },
    { value: "serious" as const, label: "真面目", description: "ビジネス向け" },
    { value: "educational" as const, label: "解説風", description: "学習的な説明" },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-bold text-sidebar-foreground mb-6">設定</h2>

        {/* トーン選択 */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 uppercase tracking-wide">会話のトーン</h3>
          <div className="space-y-2">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTone(option.value)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  tone === option.value
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "bg-sidebar-border text-sidebar-foreground hover:bg-secondary"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* リセットボタン */}
        <button
          onClick={onReset}
          className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          リセット
        </button>
      </div>

      {/* フッター情報 */}
      <div className="mt-auto p-6 border-t border-sidebar-border text-xs text-sidebar-foreground opacity-60">
        <p>News to Chat AI</p>
        <p className="mt-1">v1.0.0</p>
      </div>
    </aside>
  )
}
