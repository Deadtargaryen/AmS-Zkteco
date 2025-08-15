import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import Head from 'next/head'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import { MdEdit } from 'react-icons/md'
import { attendanceBadgeVariant, badgeColor } from '../../../lib/badgeColor'
import { FaChartPie, FaEllipsisV, FaFileAlt, FaRegCalendarAlt } from 'react-icons/fa'
import { Timeline } from 'primereact/timeline'
import 'primereact/resources/themes/lara-light-indigo/theme.css' //theme
import 'primereact/resources/primereact.min.css' //core css
import { getSpecificDaysInYear, getDayTotalInYear } from '../../../lib/dateHelpers'
import moment from 'moment'
import { client as prismaClient } from '../../../lib/prisma'
import Alert from '../../../components/AlertDialog'
import EventModal from '../../../components/EventModal'
import ErrorPage from 'next/error'
import Link from 'next/link'
import ArchiveModal from '../../../components/ArchiveModal'
import { useAppSelector, usePreviousRoute } from '../../../redux/store/hooks'
import { useGetArchiveMemberQuery } from '../../../redux/store/api'

const Profile = ({ member, attendance, events, isProfile }) => {
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
  const [eventId, setEventId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [openArchiveModal, setArchiveModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')

  const serviceDays = () => {
    if (member.gender === 'MALE') {
      return ['Sunday', 'Wednesday', 'Friday']
    } else {
      return ['Sunday', 'Monday', 'Wednesday']
    }
  }

  const updateEvent = () => {
    setOpenModal(true)
    setIsEditing(true)
  }

  const refreshData = () => {
    router.replace(router.asPath)
  }

  const handleArchiveDialogue = () => {
    setArchiveModal(true)
    onClose2()
  }

  const deleteEvent = async () => {
    try {
      await fetch(`/api/timeline/${eventId}`, {
        method: 'DELETE',
      })
      toast({
        title: 'Event deleted',
        description: 'Event has been deleted',
        status: 'success',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
      refreshData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occured',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      })
    }
  }
  const getAttendance = day => {
    let result = []
    let daysInyear = getSpecificDaysInYear(day)
    for (let i = 0; i < daysInyear.length; i++) {
      const value = attendance.find(x => moment(x.date).format('LL') === daysInyear[i])
      if (value) {
        result.push({
          date: moment(value.date).format('LL'),
          time: moment(value.date).format('LT'),
          status: 'Present',
        })
      } else if (moment().isAfter(daysInyear[i])) {
        result.push({
          date: daysInyear[i],
          time: '---',
          status: 'Absent',
        })
      } else {
        result.push({
          date: daysInyear[i],
          time: '---',
          status: '---',
        })
      }
    }
    return result
  }

  const memberAttendance = (day: string) => {
    return attendance.filter(x => moment(x.date).format('dddd') === day).length
  }

  const percentageAttendance = (totalAttendance: number, day: string) => {
    const percentage = (totalAttendance / getDayTotalInYear(day)) * 100
    return Math.floor(percentage)
  }

  const memberstat = () => {
    return serviceDays().map(day => {
      return {
        day: day,
        attendance: memberAttendance(day),
        percentage: percentageAttendance(memberAttendance(day), day),
      }
    })
  }

  const avgAttendance = () => {
    const attendances = memberstat().map(x => x.attendance)
    const total = attendances.reduce((a, b) => a + b, 0)
    return Math.floor((total / 156) * 100)
  }

  const links = [
    {
      name: 'Members',
      href: '/members',
    },
    {
      name: `${member?.firstname || ''} ${member?.lastname || ''}`,
      href: '#',
      isLastChild: true,
      isCurrentPage: true,
    },
  ]

  if (!member) return <ErrorPage statusCode={500} />
  return (
    <Box>
      <Head>
        <title>COC - Profile</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageHeaderComponent title="Profile" breadCrumb={links} />
      <Box>
        <Flex w="100%" gap="4">
          <Box flexBasis="35%" rounded="sm" shadow="md" p={6}>
            {member.cardNo && (
              <Box pos="relative" mb="2rem">
                <Box as="span" pos="absolute" right="0">
                  <Menu>
                    <MenuButton size="sm" variant="link" as={Button} rightIcon={<FaEllipsisV size="14px" />}></MenuButton>
                    <MenuList>
                      <MenuItem fontSize="sm" onClick={() => setOpenModal(true)}>
                        New Event
                      </MenuItem>
                      <MenuItem fontSize="sm" onClick={onOpen2}>
                        Archive profile
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Box>
            )}
            <VStack spacing="2" mb="1.5rem">
              <Avatar size="xl" src={member.avatarUrl} />
              <Text fontWeight="medium" fontSize="xl">{`${member.firstname} ${member.middlename} ${member.lastname}`}</Text>

              {isProfile === 'true' && <Text fontSize="sm">Zone {member.zone?.name}</Text>}
              <Link href={`/members/edit?id=${member.id}&isMember=${member.cardNo ? true : false}`}>
                <Button size="sm" fontWeight="light" fontSize="sm" leftIcon={<MdEdit />}>
                  {isProfile === 'true' ? 'Edit' : 'Restore'}
                </Button>
              </Link>
            </VStack>
            <Divider />
            <Box mt="1.5rem">
              <Flex direction="column" gap="3">
                {isProfile === 'true' && (
                  <Box>
                    <Text fontSize="sm">Card Number:</Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      No. {member.cardNo}
                    </Text>
                  </Box>
                )}
                <Box>
                  <Text fontSize="sm">Membership Status:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    <Badge colorScheme={badgeColor(member.status)}>{member.status || 'DISFELLOWSHIPPED'}</Badge>
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Phone Number:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.contactNo}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Alternate Number:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.alternateContact || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Residential Address:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.address}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Gender:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.gender}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Date of Baptism:</Text>
                  <Text fontSize="sm" fontWeight="semibold">{`${member.dateOfBaptism ? moment(member.dateOfBaptism).format('LL') : 'N/A'}`}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Date of Membership:</Text>
                  <Text fontSize="sm" fontWeight="semibold">{`${
                    member.dateOfMembership ? moment(member.dateOfMembership).format('LL') : 'N/A'
                  }`}</Text>
                </Box>
                {isProfile === 'false' && (
                  <Box>
                    <Text fontSize="sm">Date of Disfellowship:</Text>
                    <Text fontSize="sm" fontWeight="semibold">{`${
                      member.disfellowshipDate ? moment(member.disfellowshipDate).format('LL') : 'N/A'
                    }`}</Text>
                  </Box>
                )}
                {isProfile === 'false' && (
                  <Box>
                    <Text fontSize="sm">Reason for disfellowship:</Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {member.reason || 'N/A'}
                    </Text>
                  </Box>
                )}
                <Box>
                  <Text fontSize="sm">Email:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.email || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Marital Status:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.maritalStatus}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Spouse:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.spouse || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Occupation:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.occupation}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Primary Business Address:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.businessAddress || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Next of Kin:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.nextOfKin || 'N/A'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm">Next of Kin Contact:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {member.kinContact || 'N/A'}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
          <Box shadow="md" flexGrow="1" maxH="600px" overflowY="auto" rounded="sm">
            <Tabs isFitted isLazy>
              <TabList>
                <Tab fontWeight="semibold" fontSize="sm">
                  <VStack>
                    <FaRegCalendarAlt />
                    <Text>Timeline</Text>
                  </VStack>
                </Tab>
                <Tab fontWeight="semibold" fontSize="sm">
                  <VStack>
                    <FaFileAlt />
                    <Text>Attendance Record</Text>
                  </VStack>
                </Tab>
                <Tab fontWeight="semibold" fontSize="sm">
                  <VStack>
                    <FaChartPie />
                    <Text>Attendance Stat</Text>
                  </VStack>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel py="8">
                  {events.length > 0 ? (
                    <Timeline
                      value={events}
                      align="right"
                      opposite={item => (
                        <Box>
                          <Flex>
                            <Text fontWeight="semibold" fontSize="sm">
                              {moment(item.date).format('DD MMM YYYY')}
                            </Text>
                            <Menu>
                              <MenuButton
                                size="sm"
                                variant="link"
                                as={Button}
                                rightIcon={
                                  <FaEllipsisV
                                    size="14px"
                                    onClick={() => {
                                      setEventId(item.id)
                                      setEventTitle(item.title)
                                      setEventDescription(item.description)
                                      setEventDate(item.date)
                                    }}
                                  />
                                }
                              ></MenuButton>
                              {isProfile === 'true' && (
                                <MenuList>
                                  <MenuItem fontSize="sm" onClick={updateEvent}>
                                    Update
                                  </MenuItem>
                                  <MenuItem fontSize="sm" onClick={onOpen}>
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              )}
                            </Menu>
                          </Flex>
                          <Text fontWeight="normal" fontSize="sm">
                            {item.description}
                          </Text>
                        </Box>
                      )}
                    />
                  ) : (
                    <Center>
                      <Text fontSize="lg">No Events</Text>
                    </Center>
                  )}
                </TabPanel>
                <TabPanel>
                  <Tabs isFitted>
                    <TabList>
                      {serviceDays().map(day => (
                        <Tab fontWeight="semibold" fontSize="sm" key={day}>
                          <VStack>
                            <FaRegCalendarAlt />
                            <Text>{day}</Text>
                          </VStack>
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {serviceDays().map(day => (
                        <TabPanel key={day}>
                          {getAttendance(day).map((attendance, index) => (
                            <TableContainer key={index}>
                              <Table size="sm" variant="simple">
                                <Tbody>
                                  <Tr>
                                    <Td w="50%" fontSize="sm">
                                      {attendance.date}
                                    </Td>
                                    <Td>
                                      <Tag variant="solid" size="sm" colorScheme={attendanceBadgeVariant(attendance.status)}>
                                        {attendance.status}
                                      </Tag>
                                    </Td>
                                    <Td isNumeric>{attendance.time}</Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </TableContainer>
                          ))}
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel px="2rem" pt="4rem">
                  <Flex justifyContent="space-between">
                    {memberstat().map(stat => (
                      <VStack key={stat.day}>
                        <Text as="h2" fontSize="xl" fontWeight="semibold" color="teal">
                          {stat.day}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          Present {stat.attendance} out of 52
                        </Text>
                        <Text fontSize="xs">{stat.percentage}% of possible attendance</Text>
                      </VStack>
                    ))}
                  </Flex>
                  <Center mt="4rem">
                    <Text fontSize="2xl" fontWeight="semibold" color="teal">
                      Average Attendance: {avgAttendance()}%
                    </Text>
                  </Center>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Box>
      <Alert
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        affirm={deleteEvent}
        text="Are you sure you want to delete this Event?"
        title="Delete Event?"
      />
      <Alert
        isOpen={isOpen2}
        onClose={onClose2}
        onOpen={onOpen2}
        affirm={handleArchiveDialogue}
        text="Do you want to archive this profile? This will remove the current number assignment and move the profile to the disfellowshipped list."
        title="Archive Profile?"
      />

      <ArchiveModal isOpen={openArchiveModal} onClose={() => setArchiveModal(false)} id={member.id} />
      <EventModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(!openModal)
          setEventTitle('')
          setEventDescription('')
          setEventDate('')
          setIsEditing(false)
        }}
        isEditing={isEditing}
        initTitle={eventTitle}
        initDescription={eventDescription}
        date={eventDate}
        id={eventId}
        memberId={member.id}
        refresh={refreshData}
      />
    </Box>
  )
}

export async function getServerSideProps(context) {
  try {
    const { id, isProfile } = context.query
    let memberId = id
    //Get member
    let res
    if (isProfile === 'true') {
      res = await prismaClient.member.findUnique({
        where: {
          id,
        },
        include: {
          zone: true,
        },
      })
    } else {
      res = await prismaClient.disfellowship.findUnique({
        where: { id },
      })
      if (res) {
        memberId = res.memberId
      }
    }
    const member = JSON.parse(JSON.stringify(res))
    //Get Attendance
    const attendanceData = await prismaClient.attendance.findMany({
      where: {
        memberId,
      },
      select: { date: true },
    })
    const attendance = attendanceData.map(attendance => {
      const date = JSON.parse(JSON.stringify(attendance.date))
      return {
        date,
      }
    })

    //Get Events
    const eventsData = await prismaClient.timeline.findMany({
      where: {
        memberId,
      },
      orderBy: {
        date: 'asc',
      },
    })
    const events = JSON.parse(JSON.stringify(eventsData))

    return {
      props: {
        member,
        attendance,
        events,
        isProfile,
      },
    }
  } catch(e) {
    console.log(e)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

export default Profile
