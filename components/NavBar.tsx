import { useEffect, useState } from 'react'
import { Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const NavBar = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const start = () => {
      setLoading(true)
    }
    const end = () => {
      setLoading(false)
    }
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', end)
    router.events.on('routeChangeError', end)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', end)
      router.events.off('routeChangeError', end)
    }
  }, [])
  return (
    <div>
      <Flex h="100%" justifyContent="right" pr="265px" alignItems="center" pt="1rem">
        {loading && <Spinner thickness="3px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="lg" />}
      </Flex>
    </div>
  )
}

export default NavBar
