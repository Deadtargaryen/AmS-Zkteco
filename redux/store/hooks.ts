import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import members from '../../src/pages/api/members'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useDebounce = (value: string, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(id)
    }
  }, [value, delay])

  return debouncedValue
}

export function usePreviousRoute() {
  const router = useRouter()
  const [previousRoute, setPreviousRoute] = useState(null)
  const previous = useAppSelector(state => state.general.previousLocation)

  useEffect(() => {
    if(previous === '') {
      setPreviousRoute(router.asPath)
    }
    const handleRouteChange = (url: string) => {
      setPreviousRoute(router.asPath)
    }

    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router.asPath])

  return previousRoute
}
