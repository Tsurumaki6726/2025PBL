"use client"

interface ChatMessage {
  role: "user" | "assistant" | "character_a" | "character_b"
  content: string
}

interface ChatAreaProps {
  chatHistory: ChatMessage[]
  isLoading: boolean
}

export default function ChatArea({ chatHistory, isLoading }: ChatAreaProps) {
  const characterNames: Record<string, string> = {
    character_a: "キャラクターA",
    character_b: "キャラクターB",
  }

  return (
    <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-y-auto flex flex-col">
      {chatHistory.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">📰</p>
            <p>記事を入力して「変換する」をクリック</p>
            <p className="text-xs mt-2">AI がチャット形式に変換します</p>
          </div>
        </div>
      ) : (
        <>
          {chatHistory.map((msg, idx) => (
            <div key={idx} className="mb-4 flex gap-3">
              {msg.role === "user" ? (
                <>
                  <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground">
                    👤
                  </div>
                  <div className="flex-1 bg-secondary rounded-lg p-3">
                    <p className="text-sm font-semibold text-foreground mb-1">あなた</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    🤖
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-lg p-3">
                    <p className="text-sm font-semibold text-foreground mb-1">{characterNames[msg.role] || msg.role}</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-center justify-center py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
