import { useState, useRef, useEffect } from 'react'
import { Box, Button, Flex, FormControl, FormLabel, HStack, Input, Select, Text } from '@chakra-ui/react'
import Head from 'next/head'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import { useToast } from '@chakra-ui/react'
import { FaSave } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import { useAddUserMutation } from '../../../redux/store/api'

const links = [
  {
    name: 'Admin',
    href: '/admin',
  },
  {
    name: 'New User',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const New = () => {
  const toast = useToast()
  const roleRef = useRef<HTMLSelectElement>()
  const nameRef = useRef<HTMLInputElement>()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const router = useRouter()
  const [addUser, { isLoading, isSuccess, isError, error }] = useAddUserMutation()

  const reset = () => {
    roleRef.current.value = ''
    nameRef.current.value = ''
  }

  const cancel = () => {
    router.replace('/admin')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const role = roleRef.current?.value
    const name = nameRef.current?.value
    const body = {
      role,
      name,
      avatarUrl,
    }
    addUser(body).then(() => {
      reset()
    })
  }

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Success',
        description: 'User created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
    } else if (isError) {
      if ('status' in error) {
        toast({
          title: 'Error',
          description: `${error?.data}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        })
      }
    }
  }, [isSuccess, isError])

  const handleOnChange = e => {
    const reader = new FileReader()
    reader.onload = onLoadEvent => {
      setAvatarUrl(onLoadEvent.target.result)
    }
    const selectedFile = e.target.files[0]
    if (selectedFile.size > 300000 || (selectedFile.type !== 'image/jpeg' && selectedFile.type !== 'image/png')) {
      toast({
        title: `File size is greater than 200kb or file type is not supported`,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
      reader.abort()
      return
    }
    reader.readAsDataURL(e.target.files[0])
  }

  return (
    <Box>
      <Head>
        <title>COC - Admin</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <PageHeaderComponent title="Admin Page" breadCrumb={links} />
      <Box shadow="md" rounded="lg" p="1rem" bg="white">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="center">
          <Text fontWeight="semibold">New User</Text>
        </Flex>
        <Box width="40%" h="40vh" mx="auto">
          <form autoComplete="off" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Username
              </FormLabel>
              <Input autoComplete="off" type="text" placeholder="Enter Username" ref={nameRef} />
            </FormControl>
            <FormControl mt="5px">
              <FormLabel fontSize="sm" fontWeight="semibold">
                User Role
              </FormLabel>
              <Select placeholder="Select role" ref={roleRef}>
                <option value="ADMIN">Administrator</option>
                <option value="DIRECTOR">Director</option>
                <option value="USER">User</option>
              </Select>
            </FormControl>
            <FormControl mt="5px">
              <FormLabel fontSize="sm" fontWeight="semibold">
                User Image
              </FormLabel>
              <Input type="file" id="userImage" accept="image/*" onChange={handleOnChange} />
            </FormControl>
            <HStack mt="1.5rem">
              <Button leftIcon={<FaSave />} colorScheme="green" size="sm" type="submit" isLoading={isLoading}>
                Save
              </Button>
              <Button colorScheme="red" size="sm" onClick={cancel}>
                Cancel
              </Button>
            </HStack>
          </form>
        </Box>
      </Box>
    </Box>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req })
  // @ts-ignore
  if (session.user.role !== 'ADMIN' && session.user.role !== 'DIRECTOR') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

export default New
