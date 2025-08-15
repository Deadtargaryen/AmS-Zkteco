import { Box, Flex, List, ListIcon, ListItem, Text, LinkOverlay, LinkBox, useDisclosure, Collapse, Avatar } from '@chakra-ui/react'
import { MdAdminPanelSettings } from 'react-icons/md'
import { FaCalendarAlt, FaChevronDown, FaUsers, FaWrench, FaPowerOff } from 'react-icons/fa'
import { TbReportAnalytics } from 'react-icons/tb'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import SingleNavMenu from './singleNavMenu'
import { useAppSelector } from '../redux/store/hooks'

const SideBar = () => {
  const { isOpen, onToggle } = useDisclosure()
  const { isOpen: isOpen2, onToggle: onToggle2 } = useDisclosure()
  const { isOpen: reportOpen, onToggle: reportToggle } = useDisclosure()
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)

  const listItemstyle = {
    fontWeight: 'semibold',
    fontSize: 'sm',
    cursor: 'pointer',
    _hover: { color: 'gray.700' },
  }

  const handleLogout = async () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <Box pt="20px" px="20px">
      <Box>
        <Flex alignItems="center" justifyContent="space-between">
          <Text fontSize="lg" fontWeight="bold" textTransform="uppercase">
            Coc fourtowns
          </Text>
          <Box fontSize="2xl" cursor="pointer"></Box>
        </Flex>
        <Flex alignItems="center" mt="2rem" mb="3rem" gap="1rem">
          <Avatar size="md" src={user?.image} />
          <Flex flexDir="column">
            <Text fontSize="md" fontWeight="semibold">
              {user?.name}
            </Text>
            <Text as="sub" fontSize="xs" textTransform="capitalize" color="blackAlpha.600">
              {user?.role}
            </Text>
          </Flex>
        </Flex>
      </Box>

      <Box mt="5rem">
        <List spacing="2" color="blackAlpha.700">
          <SingleNavMenu linkto="/" linkName="Dashboard" role={user?.role} permission="FLEXIBLE" />
          <ListItem sx={listItemstyle}>
            <Flex
              alignItems="center"
              onClick={onToggle}
              p="8px"
              rounded="md"
              sx={
                router.pathname.includes('/members')
                  ? { color: 'primary', bg: 'primaryAccent', _hover: { opacity: 0.9 } }
                  : { _hover: { color: 'gray.700' } }
              }
            >
              <ListIcon as={FaUsers} fontSize="lg" />
              Members
              <Box as="span" pos="absolute" right="10" fontSize="xs" transition="all 300ms" sx={isOpen ? { transform: 'rotate(180deg)' } : {}}>
                <FaChevronDown />
              </Box>
            </Flex>
            <Collapse animateOpacity in={isOpen}>
              <List spacing="3" ml="34px" mt="15px" fontWeight="normal" fontSize="sm">
                <ListItem sx={router.pathname === '/members' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/members" passHref>
                      All Members
                    </NextLink>
                  </LinkBox>
                </ListItem>
                <ListItem sx={router.pathname === '/members/disfellowship' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/members/disfellowship" passHref>
                      Disfellowship List
                    </NextLink>
                  </LinkBox>
                </ListItem>
                <ListItem sx={router.pathname === '/members/add' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/members/add" passHref>
                      New Member
                    </NextLink>
                  </LinkBox>
                </ListItem>
              </List>
            </Collapse>
          </ListItem>
          <SingleNavMenu linkto="/zones" linkName="Zones" role={user?.role} permission="STRICT" />
          <ListItem sx={listItemstyle}>
            <Flex
              alignItems="center"
              onClick={onToggle2}
              p="8px"
              rounded="md"
              sx={router.pathname.includes('/attendance') ? { color: 'primary', bg: 'primaryAccent' } : {}}
            >
              <ListIcon as={FaCalendarAlt} fontSize="lg" />
              Attendance
              <Box as="span" pos="absolute" right="10" fontSize="xs" transition="all 300ms" sx={isOpen2 ? { transform: 'rotate(180deg)' } : {}}>
                <FaChevronDown />
              </Box>
            </Flex>
            <Collapse animateOpacity in={isOpen2}>
              <List spacing="3" ml="34px" mt="10px" fontWeight="normal" fontSize="sm">
                <ListItem sx={router.pathname === '/attendance' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/attendance" passHref>
                      Attendance List
                    </NextLink>
                  </LinkBox>
                </ListItem>
                <ListItem sx={router.pathname === '/attendance/absentees' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/attendance/absentees" passHref>
                      Absentees List
                    </NextLink>
                  </LinkBox>
                </ListItem>
                <ListItem sx={router.pathname === '/attendance/add' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/attendance/add" passHref>
                      New Attendance
                    </NextLink>
                  </LinkBox>
                </ListItem>
              </List>
            </Collapse>
          </ListItem>
          <ListItem sx={listItemstyle}>
            <Flex
              alignItems="center"
              onClick={reportToggle}
              p="8px"
              rounded="md"
              sx={router.pathname.includes('/reports') ? { color: 'primary', bg: 'primaryAccent' } : {}}
            >
              <ListIcon as={TbReportAnalytics} fontSize="lg" />
              Reports
              <Box as="span" pos="absolute" right="10" fontSize="xs" transition="all 300ms" sx={reportOpen ? { transform: 'rotate(180deg)' } : {}}>
                <FaChevronDown />
              </Box>
            </Flex>
            <Collapse animateOpacity in={reportOpen}>
              <List spacing="3" ml="34px" mt="10px" fontWeight="normal" fontSize="sm">
                <ListItem sx={router.pathname === '/reports/monthly' ? { color: 'primary' } : {}}>
                  <LinkBox>
                    <NextLink href="/reports/monthly" passHref>
                      Monthly Report
                    </NextLink>
                  </LinkBox>
                </ListItem>
              </List>
            </Collapse>
          </ListItem>
          {user?.role !== 'USER' && (
            <ListItem
              fontWeight="semibold"
              fontSize="sm"
              p="8px"
              rounded="md"
              sx={
                router.pathname === '/admin' ? { color: 'primary', bg: 'primaryAccent', _hover: { opacity: 0.9 } } : { _hover: { color: 'gray.700' } }
              }
            >
              <LinkBox>
                <NextLink href="/admin" passHref>
                  <LinkOverlay>
                    <ListIcon as={MdAdminPanelSettings} fontSize="lg" />
                    Admin
                  </LinkOverlay>
                </NextLink>
              </LinkBox>
            </ListItem>
          )}
          <ListItem
            fontWeight="semibold"
            fontSize="sm"
            p="8px"
            rounded="md"
            sx={
              router.pathname === '/settings'
                ? { color: 'primary', bg: 'primaryAccent', _hover: { opacity: 0.9 } }
                : { _hover: { color: 'gray.700' } }
            }
          >
            <LinkBox>
              <NextLink href="/settings" passHref>
                <LinkOverlay>
                  <ListIcon as={FaWrench} fontSize="lg" />
                  Settings
                </LinkOverlay>
              </NextLink>
            </LinkBox>
          </ListItem>
          <ListItem
            sx={
              router.pathname === '/logout' ? { color: 'primary', bg: 'primaryAccent', _hover: { opacity: 0.9 } } : { _hover: { color: 'gray.700' } }
            }
            fontWeight="semibold"
            fontSize="sm"
            p="8px"
            rounded="md"
            onClick={handleLogout}
            cursor="pointer"
          >
            <LinkBox>
              <LinkOverlay>
                <ListIcon as={FaPowerOff} fontSize="lg" />
                Logout
              </LinkOverlay>
            </LinkBox>
          </ListItem>
        </List>
      </Box>
    </Box>
  )
}

export default SideBar
