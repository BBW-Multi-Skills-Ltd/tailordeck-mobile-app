import { toEditablePart, type PrefixedFieldSpec } from './linkFieldValues'

/** Input with a locked prefix; cleans pasted full links / numbers when the field loses focus. */
export default function PrefixedField({ spec, value, onChange }: { spec: PrefixedFieldSpec; value: string; onChange: (value: string) => void }) {
  return (
    <label className="ad-field">
      {spec.label}
      <span className="ad-input-wrap ad-prefixed">
        <span className="ad-prefix" title={spec.prefix}>
          <bdi dir="ltr">{spec.prefix}</bdi>
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onChange(toEditablePart(spec, event.target.value))}
          placeholder={spec.placeholder}
          inputMode={spec.kind === 'phone' ? 'numeric' : 'url'}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </span>
      {spec.hint ? <small className="ad-hint">{spec.hint}</small> : null}
    </label>
  )
}
