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
      placeholder="ニュース記事を貼り付けてください..."
      className="flex-1 w-full p-5 bg-card border border-border rounded-lg text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    />
  )
}
