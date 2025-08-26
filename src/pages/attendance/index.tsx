import { useState, useEffect, useRef } from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import Head from 'next/head'
import { MdClose, MdDelete, MdPrint, MdSearch } from 'react-icons/md'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import { useReactToPrint } from 'react-to-print'
import Alert from '../../../components/AlertDialog'
import { GetServerSideProps } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { useGetPaginatedAttendanceQuery } from '../../../redux/store/api'
import { useAppSelector, useDebounce } from '../../../redux/store/hooks'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Attendance',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const months = [
  { title: 'January', value: 1 },
  { title: 'February', value: 2 },
  { title: 'March', value: 3 },
  { title: 'April', value: 4 },
  { title: 'May', value: 5 },
  { title: 'June', value: 6 },
  { title: 'July', value: 7 },
  { title: 'August', value: 8 },
  { title: 'September', value: 9 },
  { title: 'October', value: 10 },
  { title: 'November', value: 11 },
  { title: 'December', value: 12 },
]

const formatDate = (date: string, type: string) => {
  switch (type) {
    case 'time':
      return moment(date).format('hh:mm a')
    case 'date':
      return moment(date).format('dddd DD MMM, YYYY')
  }
}

const Attendance = () => {
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [filterText, setFilterText] = useState('')
  const [filteredItems, setFilteredItems] = useState([])
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const [zone, setZone] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState(moment().format('YYYY'))
  const [day, setDay] = useState('')
  const [daysInMonth, setDaysInMonth] = useState(moment().daysInMonth())
  const [quickFilter, setQuickFilter] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [deleteId, setDeleteId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const quickFilterRef = useRef<HTMLSelectElement>()
  const monthRef = useRef<HTMLSelectElement>()
  const dayRef = useRef<HTMLSelectElement>()
  const zoneRef = useRef<HTMLSelectElement>()
  const yearRef = useRef<HTMLSelectElement>()
  const tableRef = useRef()
  const [isPrintMedia] = useMediaQuery('(Display-mode: print)')
  const [isPrinting, setIsPrinting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const debouncedSearch = useDebounce(filterText, 1000)
  const {
    data: attendance,
    isLoading,
    refetch,
    isFetching,
  } = useGetPaginatedAttendanceQuery({ page, perPage, year, month, day, zone, searchParams: debouncedSearch }, { refetchOnMountOrArgChange: true })

  const toast = useToast()
  const {user} = useAppSelector(state => state.auth)

  const columns = [
    {
      name: 'Date',
      selector: row => moment(row.date).format('dddd DD MMM, YYYY'),
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => `${row.member.firstname} ${row.member.middlename} ${row.member.lastname}`,
      sortable: true,
    },
    {
      name: 'Registration Number',
      selector: row => row.member.cardNo,
      sortable: true,
    },
    {
      name: 'Zone',
      selector: row => row.member.zone.name,
      sortable: true,
    },
    {
      name: 'Time',
      selector: row => moment(row.date).format('hh:mm a'),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <Button
          disabled={user?.role !== 'DIRECTOR'}
          leftIcon={<MdDelete />}
          colorScheme="red"
          size="xs"
          variant="outline"
          onClick={() => handleDeleteAction(row.id)}
        >
          Delete
        </Button>
      ),
    },
  ]

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: 'Attendance Report',
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
  })

  const deleteAttendance = async () => {
    setActionLoading(true)
    try {
      const result = await fetch(`/api/attendance/${deleteId}`, {
        method: 'DELETE',
      })

      if (result.status === 200) {
        toast({
          title: 'Attendance deleted',
          description: 'Attendance has been deleted',
          status: 'success',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })
        setActionLoading(false)
        onAlertClose()
      } else {
        toast({
          title: 'Error',
          description: 'An error occured',
          status: 'error',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        })
        setActionLoading(false)
        onAlertClose()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occured',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      })
      setActionLoading(false)
      onAlertClose()
    }
  }

  const handlePreview = () => {
    onOpen()
  }

  const handleDeleteAction = id => {
    onAlertOpen()
    setDeleteId(id)
  }

  const handlePageChange = page => {
    setPage(page)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    setPage(page)
  }

  useEffect(() => {
    setDaysInMonth(moment().month(month).daysInMonth())

    const handleQuickFilter = () => {
      if (quickFilter !== '') {
        if (quickFilter === 'Today') {
          handleTagClose('Month')
          handleTagClose('Year')
          setDay(new Date().getDate().toString())
        } else if (quickFilter === 'Last Sunday') {
          handleTagClose('Month')
          handleTagClose('Year')
          setDay(getLastSunday())
        } else if (quickFilter === 'Last Monday') {
          handleTagClose('Month')
          handleTagClose('Year')
          setDay(getLastMonday())
        } else if (quickFilter === 'Last Wednesday') {
          handleTagClose('Month')
          handleTagClose('Year')
          setDay(getLastWednesday())
        } else if (quickFilter === 'Last Friday') {
          handleTagClose('Month')
          handleTagClose('Year')
          setDay(getLastFriday())
        } else if (quickFilter === 'This Month') {
          handleTagClose('Year')
          handleTagClose('Day')
          setMonth((new Date().getMonth() + 1).toString())
        } else if (quickFilter === 'Last Month') {
          setMonth(new Date().getMonth().toString())
          handleTagClose('Year')
          handleTagClose('Day')
        }
      }
    }
    handleQuickFilter()
    if (!isLoading) {
      setTotalRows(attendance?.metaData?.total)
    }
  }, [attendance, isLoading, zone, month, day, year, quickFilter])

  const convertToMonth = (month: number) => {
    const date = new Date()
    date.setMonth(month - 1)
    return date.toLocaleString('en-US', {
      month: 'long',
    })
  }

  const getLastSunday = () => {
    return moment().day(0).format('D')
  }
  const getLastMonday = () => {
    return moment().day(1).format('D')
  }
  const getLastWednesday = () => {
    return moment().day(3).format('D')
  }
  const getLastFriday = () => {
    return moment().day(5).format('D')
  }

  useEffect(() => {
    setActiveFilters(prev => {
      const index = prev.findIndex(item => item.name === 'Year')
      if (index !== -1) {
        prev.splice(index, 1)
      }
      return year === '' ? [...prev] : [...prev, { name: 'Year', value: year }]
    })
  }, [year])

  useEffect(() => {
    setActiveFilters(prev => {
      const index = prev.findIndex(item => item.name === 'Month')
      if (index !== -1) {
        prev.splice(index, 1)
      }
      return month === '' ? [...prev] : [...prev, { name: 'Month', value: convertToMonth(parseInt(month)) }]
    })
  }, [month])

  useEffect(() => {
    setActiveFilters(prev => {
      const index = prev.findIndex(item => item.name === 'Day')
      if (index !== -1) {
        prev.splice(index, 1)
      }
      return day === '' ? [...prev] : [...prev, { name: 'Day', value: day }]
    })
  }, [day])

  useEffect(() => {
    setActiveFilters(prev => {
      const index = prev.findIndex(item => item.name === 'Zone')
      if (index !== -1) {
        prev.splice(index, 1)
      }
      return zone === '' ? [...prev] : [...prev, { name: 'Zone', value: `Zone ${zone}` }]
    })
  }, [zone])

  useEffect(() => {
    setActiveFilters(prev => {
      const index = prev.findIndex(item => item.name === 'QuickFilter')
      if (index !== -1) {
        prev.splice(index, 1)
      }
      return quickFilter === '' ? [...prev] : [...prev, { name: 'QuickFilter', value: quickFilter }]
    })
  }, [quickFilter])

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle)
      setFilterText('')
    }
  }

  const handleTagClose = name => {
    if (name === 'Day') {
      setDay('')
      dayRef.current.value = ''
    }
    if (name === 'Year') {
      setYear(moment().format('YYYY'))
      yearRef.current.value = moment().format('YYYY')
    }
    if (name === 'Month') {
      setMonth('')
      setDay('')
      dayRef.current.value = ''
      monthRef.current.value = ''
    }
    if (name === 'Zone') {
      setZone('')
      zoneRef.current.value = ''
    }
    if (name === 'QuickFilter') {
      setQuickFilter('')
      quickFilterRef.current.value = ''
    }
  }

  const years = () => {
    let years = []
    for (let i = 2023; i <= 2030; i++) {
      years.push(i)
    }
    return years
  }

  const getCaption = () => {
    let caption = 'Attendance for '
    if (day !== '') {
      caption += `${day}`
    }
    if (month !== '') {
      caption += ` ${convertToMonth(parseInt(month))}`
    }
    if (year !== '') {
      caption += ` ${year}`
    }
    if (zone !== '') {
      caption += ` (Zone ${zone})`
    }
    return caption
  }

  return (
    <Box>
      <Head>
        <title>COC - Attendance</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Attendance" breadCrumb={links} />
      </Box>
      <Box shadow="md" rounded="sm" p="1rem" bg="white">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="start">
          <Text fontWeight="semibold">Attendance List</Text>
          <Stack direction={'row'}>
            <Button leftIcon={<MdPrint />} onClick={handlePreview}>
              preview
            </Button>
            <InputGroup zIndex={0}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input type="text" placeholder="Search by name" onChange={e => setFilterText(e.target.value)} value={filterText} />
              <InputRightElement onClick={() => handleClear()}>
                <IconButton aria-label="close" variant="ghost" icon={<MdClose />} />
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Flex>

        <Accordion allowToggle maxW="70%" display={isPrintMedia ? 'none' : ''}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">
                  Filters
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex gap="3">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Year
                  </FormLabel>
                  <Select
                    _placeholder={{ fontSize: 'sm' }}
                    onChange={e => {
                      setYear(e.target.value)
                    }}
                    ref={yearRef}
                    cursor="pointer"
                  >
                    {years().map((month, index) => (
                      <option key={index}>{month}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Month
                  </FormLabel>
                  <Select
                    ref={monthRef}
                    _placeholder={{ fontSize: 'sm' }}
                    onChange={e => {
                      setMonth(e.target.value)
                    }}
                  >
                    <option value="">All</option>
                    {months.map((month, index) => (
                      <option value={month.value} key={index}>
                        {month.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl display={month === '' ? 'none' : 'block'}>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Day
                  </FormLabel>
                  <Select
                    ref={dayRef}
                    _placeholder={{ fontSize: 'sm' }}
                    onChange={e => {
                      setDay(e.target.value)
                    }}
                  >
                    <option value="">All</option>
                    {Array.from(Array(daysInMonth).keys()).map((day, index) => (
                      <option value={day + 1} key={index}>
                        {day + 1}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Zone
                  </FormLabel>
                  <Select
                    ref={zoneRef}
                    _placeholder={{ fontSize: 'sm' }}
                    onChange={e => {
                      setZone(e.target.value)
                    }}
                  >
                    <option value="">All</option>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                    <option value="E">Zone E</option>
                    <option value="F">Zone F</option>
                    <option value="F">Zone G</option>
                    <option value="F">Zone H</option>
                    <option value="F">Zone I</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Quick filters
                  </FormLabel>
                  <Select
                    ref={quickFilterRef}
                    _placeholder={{ fontSize: 'sm' }}
                    onChange={e => {
                      setQuickFilter(e.target.value)
                    }}
                  >
                    <option value="">None</option>
                    <option value="Today">Today</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Sunday">Last Sunday</option>
                    <option value="Last Monday">Last Monday</option>
                    <option value="Last Wednesday">Last Wednesday</option>
                    <option value="Last Friday">Last Friday</option>
                    <option value="Last Month">Last Month</option>
                  </Select>
                </FormControl>
              </Flex>
              <Flex mt="0.5rem">
                <Text fontSize="sm" fontWeight="semibold" mr="5px">
                  Active Filters:
                </Text>
                <HStack spacing={2}>
                  {activeFilters.length > 0 &&
                    activeFilters.map((filter, index) => (
                      <Tag colorScheme="cyan" size="sm" key={index}>
                        <TagLabel>{filter.value}</TagLabel>
                        <TagCloseButton
                          onClick={() => {
                            handleTagClose(filter.name)
                          }}
                        />
                      </Tag>
                    ))}
                </HStack>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Divider py="1rem" />
        <Box>
          <DataTable
            columns={columns}
            data={attendance?.data}
            paginationResetDefaultPage={resetPaginationToggle}
            pagination
            progressComponent={<Spinner />}
            progressPending={isLoading || isFetching}
            paginationServer
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
          />
        </Box>
      </Box>
      <Alert
        text="Are you sure you want to delete this Item"
        title="Delete Attendance"
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onOpen={onAlertOpen}
        affirm={deleteAttendance}
        loading={actionLoading}
      />
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer ref={tableRef} border="1px" borderRadius="md">
              <Table size="md" colorScheme="green">
                <TableCaption placement="top" color="red" fontSize="2xl">
                  {getCaption()}
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Name</Th>
                    <Th>Card</Th>
                    <Th>Zone</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {attendance &&
                    attendance?.data.map((item, index) => (
                      <Tr key={index}>
                        <Td border="1px">{formatDate(item.date, 'date')}</Td>

                        <Td border="1px">{`${item.member.firstname} ${item.member.middlename} ${item.member.lastname}`}</Td>
                        <Td border="1px">{item.member.cardNo}</Td>
                        <Td border="1px">{item.member.zone.name}</Td>
                        <Td border="1px">{formatDate(item.date, 'time')}</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} leftIcon={<MdPrint />} colorScheme="blue" ml={3}>
              Print
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}
export default Attendance
