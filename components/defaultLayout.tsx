import { useEffect } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import SideBar from './sidebar'
import NavBar from './NavBar'
import { useSession } from 'next-auth/react'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/features/members/slices/authSlice'
import { usePreviousRoute } from '../redux/store/hooks'
import { setPreviousLocation } from '../redux/features/general/general.slice'

const DefaultLayout = ({ children }: React.PropsWithChildren) => {
  const dispatch = useDispatch()
  const { data: session, status } = useSession()

  const previousLocation = usePreviousRoute()

  useEffect(() => {
    dispatch(setPreviousLocation(previousLocation))
  }, [previousLocation])

  useEffect(() => {
    if (session) {
      dispatch(setUser(session.user as any))
    }
  }, [session])
  return (
    <Box width="100%" height="100%" pos="relative" overflowX="hidden">
      <Box position="fixed" top="0" width="250px" h="100vh" left="0" bg="white" shadow="lg" zIndex="2">
        <SideBar />
      </Box>
      <Box marginLeft="250px" h="100%">
        <Box h="70px" bg="white" position="fixed" left="250px" width="100%" shadow="md" zIndex={1}>
          <NavBar />
        </Box>
        <Box width="100%" minH="100vh" pt="70px" bg="gray.50" mb="60px">
          <Box p="1rem">{children}</Box>
        </Box>
      </Box>
      <Box h="60px" bottom="0" bg="gray.100" position="absolute" left="250px" width="100%" shadow="md" px="1rem">
        <Flex alignItems="center" h="100%">
          <Text fontSize="sm">{new Date().getUTCFullYear()} &copy; Meayarsoft</Text>
        </Flex>
      </Box>
    </Box>
  )
}

export default DefaultLayout
