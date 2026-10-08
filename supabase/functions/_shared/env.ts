/** Reads a required function secret / environment variable, failing loudly when it is missing. */
export function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}
