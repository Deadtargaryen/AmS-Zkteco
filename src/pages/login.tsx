import { Box, Button, Center, Flex, FormControl, FormLabel, Input, Stack, Text, useToast } from '@chakra-ui/react'
import Head from 'next/head'
import { Image } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { signIn, SignInResponse } from 'next-auth/react'
import { useSession, signOut, getSession } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import { ThreeCircles } from 'react-loader-spinner'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const nameRef = useRef<HTMLInputElement>()
  const passwordRef = useRef<HTMLInputElement>()
  const router = useRouter()
  const toast = useToast()
  const { data: session, status } = useSession()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    let result: SignInResponse
    try {
      let name = nameRef.current?.value
      let password = passwordRef.current?.value
      result = await signIn('credentials', {
        name,
        password,
        redirect: false,
      })
      if (result.status === 200) {
        setLoading(false)
        router.push('/')
      } else {
        toast({
          title: `${result.error}`,
          position: 'top-right',
          isClosable: true,
          status: 'error',
        })
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      //Get error message from server
      toast({
        title: `${error}`,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      toast({
        title: `Welcome ${session.user.name}`,
        position: 'top-right',
        isClosable: true,
        status: 'success',
      })
    }
  }, [status, session?.user?.name, toast])

  useEffect(() => {
    const start = () => {
      setPageLoading(true)
    }
    const end = () => {
      setPageLoading(false)
    }
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', end)
    router.events.on('routeChangeError', end)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', end)
      router.events.off('routeChangeError', end)
    }
  }, [router])

  return (
    <Box color="blackAlpha.700">
      <Head>
        <title>COC - Login</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>

      {pageLoading && (
        <Box display="grid" position="absolute" placeContent="center" width="100%" height="100dvh" backgroundColor="blackAlpha.600">
          <ThreeCircles
            height="100"
            width="100"
            color="#CBD5E0"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="three-circles-rotating"
            outerCircleColor=""
            innerCircleColor=""
            middleCircleColor=""
          />
        </Box>
      )}

      <Flex>
        <Box flexBasis="50%" h="100vh">
          <Image width="100%" height="100%" objectFit="cover" alt="background" src="/background.jpg"></Image>
        </Box>
        <Box flexBasis="50%" bg="gray.50">
          <Center h="100%">
            <Box w="60%" h="320px" shadow="base" bg="white" rounded="md" p="1rem">
              <Text fontSize="2xl" fontWeight="bold" color="primary" textAlign="center" mb="2rem">
                {status === 'authenticated' ? 'Logged in' : 'Login'}
              </Text>
              <form autoComplete="off" onSubmit={handleSubmit}>
                <Stack spacing="4">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Username
                    </FormLabel>
                    <Input type="text" required placeholder="Enter username" autoComplete="off" onFocus={() => setLoading(false)} ref={nameRef} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      required
                      placeholder="Enter password"
                      onFocus={() => setLoading(false)}
                      autoComplete="new-password"
                      ref={passwordRef}
                    />
                  </FormControl>

                  <Button type="submit" colorScheme="telegram" isLoading={loading}>
                    Login
                  </Button>
                </Stack>
              </form>
            </Box>
          </Center>
        </Box>
      </Flex>
    </Box>
  )
}

Login.authpage = true

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  // if (session) {
  //   return {
  //     redirect: {
  //       destination: '/',
  //       permanent: false,
  //     },
  //   }
  // }
  return {
    props: { session },
  }
}

export default Login
