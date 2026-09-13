import { useEffect, useState } from 'react'
import { parseHash, type Path } from './route'

export function usePath(): Path {
  const [path, setPath] = useState<Path>(() => parseHash())
  useEffect(() => {
    const sync = () => setPath(parseHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  return path
}
