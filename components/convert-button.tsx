"use client"

interface ConvertButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}

export default function ConvertButton({ onClick, isLoading, disabled }: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>変換中...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>会話に変換</span>
        </>
      )}
    </button>
  )
}
