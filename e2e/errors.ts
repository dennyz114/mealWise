export function redactSecrets(message: string, secrets: string[]): string {
  return secrets.reduce((text, secret) => {
    if (!secret) return text
    return text.split(secret).join('[redacted]')
  }, message)
}
