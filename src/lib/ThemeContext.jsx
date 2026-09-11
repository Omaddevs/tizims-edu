import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { applyTheme, getStoredTheme, initTheme } from './theme'

const ThemeContext = createContext({
  theme: 'light',
  dark: false,
  setTheme: () => {},
  toggle: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof document !== 'undefined') initTheme()
    return getStoredTheme()
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      dark: theme === 'dark',
      setTheme: setThemeState,
      toggle: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
