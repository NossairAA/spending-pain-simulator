const isDev = process.env.NODE_ENV !== "production"

function withPrefix(scope: string, args: unknown[]) {
  return [`[${scope}]`, ...args]
}

export const logger = {
  debug(scope: string, ...args: unknown[]) {
    if (isDev) {
      console.debug(...withPrefix(scope, args))
    }
  },
  info(scope: string, ...args: unknown[]) {
    if (isDev) {
      console.info(...withPrefix(scope, args))
    }
  },
  warn(scope: string, ...args: unknown[]) {
    console.warn(...withPrefix(scope, args))
  },
  error(scope: string, ...args: unknown[]) {
    console.error(...withPrefix(scope, args))
  },
}
