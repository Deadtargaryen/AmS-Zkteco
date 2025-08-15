import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import ChangePasswordComponent from '../../components/ChangePasswordComponent'
import PageHeaderComponent from '../../components/PageHeaderComponent'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useAppSelector } from '../../redux/store/hooks'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/features/members/slices/authSlice'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Setings',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const Settings = () => {
  const dispatch = useDispatch()
  const { data: session, status } = useSession()
  const { user } = useAppSelector(state => state.auth)
  const [userImage, setUserImage] = useState(user?.image)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleOnChange = e => {
    setIsEditing(true)
    const reader = new FileReader()
    reader.onload = onLoadEvent => {
      setUserImage(onLoadEvent.target.result as string)
    }
    const selectedFile = e.target.files[0]
    if (selectedFile.size > 200000 || (selectedFile.type !== 'image/jpeg' && selectedFile.type !== 'image/png')) {
      toast({
        title: `File size is greater than 200kb or file type is not supported`,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
      reader.abort()
      setIsEditing(false)
      return
    }
    reader.readAsDataURL(e.target.files[0])
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setUserImage(user?.image)
  }

  const handleUpdate = async () => {
    if (!isEditing) return
    setLoading(true)
    if (userImage === user?.image || userImage === '') return
    const result = await fetch(`/api/users/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: userImage,
      }),
    })
    const data = await result.json()
    if (data.error) {
      toast({
        title: data.error,
        position: 'top-right',
        isClosable: true,
        status: 'error',
      })
      setLoading(false)
      return
    }
    if (result && result.status === 200) {
      dispatch(setUser({ ...user, image: userImage }))
      toast({
        title: 'Profile image updated successfully',
        position: 'top-right',
        isClosable: true,
        status: 'success',
      })
      setIsEditing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.image) setUserImage(user?.image)
  }, [user])

  return (
    <Box>
      <Head>
        <title>COC - Settings</title>
      </Head>
      <PageHeaderComponent title="Settings" breadCrumb={links} />
      <Box p="4" shadow="md" py="3rem" rounded="lg">
        <Tabs isFitted isLazy>
          <TabList>
            <Tab>Change Password</Tab>
            <Tab>Account Info</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box width="40%" mx="auto">
                <ChangePasswordComponent />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box width="40%" h="40vh" mx="auto" shadow="base" rounded="md">
                <Flex alignItems="center" flexDir="column" p="2rem" columnGap="1rem">
                  <Box>
                    <Menu placement="left-start">
                      <MenuButton as={Avatar} size="2xl" _hover={{ opacity: 0.8 }} cursor="pointer" src={userImage}></MenuButton>
                      <MenuList>
                        <MenuItem>
                          <label htmlFor="avatarUrl">{user?.name ? 'Change picture' : 'Add picture'}</label>
                          <Input type="file" accept="image/*" onChange={handleOnChange} id="avatarUrl" hidden />
                        </MenuItem>
                        <MenuItem>Delete picture</MenuItem>
                      </MenuList>
                    </Menu>
                  </Box>
                  <Stack mt="1rem" spacing={1}>
                    <Text>
                      <Box as="span" fontWeight="bold" fontSize="sm">
                        User Name:
                      </Box>
                      <Text as="span" fontSize="sm">
                        {' '}
                        {user?.name}
                      </Text>
                    </Text>
                    <Text>
                      <Box as="span" fontWeight="bold" fontSize="sm">
                        User Role:
                      </Box>
                      <Text as="span" fontSize="sm" casing="lowercase">
                        {' '}
                        {user?.role}
                      </Text>
                    </Text>
                  </Stack>
                </Flex>
                <Flex justifyContent="center" gap="1" hidden={!isEditing}>
                  <Button size="sm" colorScheme="blue" onClick={handleUpdate} isLoading={loading}>
                    Update
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Flex>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default Settings
