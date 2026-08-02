export type AuthTextMatchState = 'idle' | 'partial' | 'match' | 'mismatch'

type AuthTextFieldProps = {
  error?: string
  errorKey?: number
  helper?: string
  id: string
  inputMode?: 'email' | 'text'
  label: string
  matchState?: AuthTextMatchState
  onChange: (value: string) => void
  placeholder: string
  type?: string
  value: string
}

export function AuthTextField({
  error,
  errorKey = 0,
  helper,
  id,
  inputMode,
  label,
  matchState = 'idle',
  onChange,
  placeholder,
  type = 'text',
  value,
}: AuthTextFieldProps) {
  const invalid = Boolean(error) || matchState === 'mismatch'
  return (
    <div className="input-group">
      <label htmlFor={id} className="auth-label">{label}</label>
      <input
        key={`${id}-${errorKey}`}
        id={id}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={invalid}
        type={type}
        inputMode={inputMode}
        className={`auth-input${invalid ? ' input-invalid input-shake' : ''}${matchState === 'partial' ? ' input-partial' : ''}${matchState === 'match' ? ' input-match' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span id={`${id}-error`} className="input-error-text">{error}</span> : null}
      {!error && helper ? <span className={`password-match-hint ${matchState}`}>{helper}</span> : null}
    </div>
  )
}
