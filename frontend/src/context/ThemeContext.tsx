import React, { createContext, useContext, useEffect } from 'react'

type Theme = 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    localStorage.setItem('theme', 'light')
  }, [])

  const setTheme = () => {
    // No-op since dark mode is removed
  }

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

