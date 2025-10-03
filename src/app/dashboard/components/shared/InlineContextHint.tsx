interface InlineContextHintProps {
  context?: string
}

export function InlineContextHint({ context }: InlineContextHintProps) {
  if (!context) return null

  return (
    <div className="text-sm mt-1">
      <span className="font-semibold">Context:</span>{' '}
      <span className="font-semibold">{context}</span>
    </div>
  )
}