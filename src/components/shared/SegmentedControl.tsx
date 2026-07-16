type SegmentedControlProps<T extends string> = {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={`td-segmented${className ? ` ${className}` : ''}`} role="group" aria-label={label}>
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            className={`td-segmented-option${active ? ' active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
