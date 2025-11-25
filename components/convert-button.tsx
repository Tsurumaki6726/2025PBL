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
      className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-bold text-center lg:w-32 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
    >
      {isLoading ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
          <span>⚡</span>
          <span>変換する</span>
        </>
      )}
    </button>
  )
}
