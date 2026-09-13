import type { ChangeEvent } from 'react'

export function Editable({
  value,
  onChange,
  className = '',
  placeholder = 'Empty',
  multiline = false,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
}) {
  const props = {
    className: `edit ${className}`.trim(),
    value,
    placeholder,
    onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  }
  if (multiline) {
    const rows = Math.min(12, Math.max(2, value.split('\n').length + 1))
    return <textarea {...props} rows={rows} />
  }
  return <input {...props} />
}

export function AddLine({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="add-line" type="button" onClick={onClick}>
      + {label}
    </button>
  )
}

export function IconX({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="icon-x"
      type="button"
      aria-label="Delete"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      ×
    </button>
  )
}
