"use client"

interface ArticleInputProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export default function ArticleInput({ value, onChange, disabled }: ArticleInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="ニュース記事またはテキストをここに入力してください..."
      className="flex-1 w-full p-4 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}
