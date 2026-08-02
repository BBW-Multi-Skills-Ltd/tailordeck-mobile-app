import { useCallback, useMemo, useRef, useState, type ClipboardEvent } from 'react'

type UseOtpDigitsParams = {
  length: number
  onComplete: (token: string) => void
  onInputChange?: () => void
}

export function useOtpDigits({ length, onComplete, onInputChange }: UseOtpDigitsParams) {
  const emptyDigits = useMemo(() => Array.from({ length }, () => ''), [length])
  const [digits, setDigits] = useState<string[]>(emptyDigits)
  const lastSubmittedTokenRef = useRef('')
  const token = digits.join('')

  const focusInput = useCallback((index: number): void => {
    const input = document.querySelector<HTMLInputElement>(`[data-otp-index="${index}"]`)
    input?.focus()
  }, [])

  const clearDigits = useCallback((): void => {
    setDigits(emptyDigits)
    focusInput(0)
  }, [emptyDigits, focusInput])

  function resetLastSubmittedToken(): void {
    lastSubmittedTokenRef.current = ''
  }

  function canSubmitToken(nextToken: string): boolean {
    if (lastSubmittedTokenRef.current === nextToken) return false
    lastSubmittedTokenRef.current = nextToken
    return true
  }

  function applyCode(rawCode: string): void {
    const code = rawCode.replace(/\D/g, '').slice(0, length)
    if (!code) return

    const nextDigits = Array.from({ length }, (_, index) => code[index] ?? '')
    const nextToken = nextDigits.join('')
    setDigits(nextDigits)
    onInputChange?.()

    if (nextToken.length === length && !nextDigits.includes('')) {
      focusInput(length - 1)
      onComplete(nextToken)
      return
    }

    focusInput(Math.min(code.length, length - 1))
  }

  function setDigit(index: number, value: string): void {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length > 1) {
      applyCode(cleaned)
      return
    }

    const nextDigit = cleaned.slice(-1)
    const nextDigits = digits.map((item, itemIndex) => (itemIndex === index ? nextDigit : item))
    const nextToken = nextDigits.join('')
    setDigits(nextDigits)
    onInputChange?.()

    if (nextDigit) {
      focusInput(Math.min(index + 1, length - 1))
    }

    if (nextToken.length === length && !nextToken.includes('')) {
      onComplete(nextToken)
    }
  }

  function handleKeyDown(index: number, key: string): void {
    if (key !== 'Backspace' || digits[index]) return
    focusInput(Math.max(index - 1, 0))
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault()
    applyCode(event.clipboardData.getData('text'))
  }

  return {
    applyCode,
    canSubmitToken,
    clearDigits,
    digits,
    handleKeyDown,
    handlePaste,
    resetLastSubmittedToken,
    setDigit,
    token,
  }
}
