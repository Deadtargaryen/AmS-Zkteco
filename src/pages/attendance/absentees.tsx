import { useState, useEffect, useRef, ReactElement, JSXElementConstructor, ReactFragment } from 'react'
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
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { useAbsenteeReportQuery, useGetPaginatedAttendanceQuery } from '../../../redux/store/api'
import { useSession } from 'next-auth/react'
import { useDebounce } from '../../../redux/store/hooks'
import { badgeColor } from '../../../lib/badgeColor'
import { GetServerSideProps } from 'next'

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

const Absentee = () => {
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const [zone, setZone] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState(moment().format('YYYY'))
  const [day, setDay] = useState('')
  const [quickFilter, setQuickFilter] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [deleteId, setDeleteId] = useState('')
  const zoneRef = useRef<HTMLSelectElement>()
  const tableRef = useRef()
  const [isPrintMedia] = useMediaQuery('(Display-mode: print)')
  const [isPrinting, setIsPrinting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
  const debouncedSearch = useDebounce(filterText, 1000)
  const [date, setDate] = useState()
  const {
    data: attendance,
    isLoading,
    refetch,
    isFetching,
  } = useAbsenteeReportQuery({ page, perPage, day, zone, searchParams: debouncedSearch }, { refetchOnMountOrArgChange: true })


  const columns = [
    {
      name: 'Name',
      selector: row => `${row.firstname} ${row.middlename} ${row.lastname}`,
      sortable: true,
    },
    {
      name: 'Registration Number',
      selector: row => row.cardNo,
      sortable: true,
    },
    {
      name: 'Zone',
      selector: row => row.zone.name,
      sortable: true,
    },
    {
      name: 'Contact',
      selector: row => row.contactNo,
      sortable: true,
    },
    {
        name: 'Address',
        selector: row => row.address,
        sortable: true,
      },
    {
      name: 'Status',
      cell: (row: { status: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment }) => (
        <Badge colorScheme={badgeColor(row.status as string)} variant="subtle" rounded="md" fontSize="xs" textTransform="lowercase">
          {row.status}
        </Badge>
      ),
    },
  ]

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: 'Attendance Report',
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
  })



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
  // const getLastMonday = () => {
  //   return moment().day(1).format('D')
  // }
  const getLastWednesday = () => {
    return moment().day(3).format('D')
  }
  // const getLastFriday = () => {
  //   return moment().day(5).format('D')
  // }

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



  const handleDate = e => {
    const year = new Date(e.target.value).getFullYear()
    const month = new Date(e.target.value).getMonth() + 1
    const day = new Date(e.target.value).getDate()
    setDate(e.target.value)
    setYear(year.toString())
    setMonth(month.toString())
    setDay(day.toString())
  }

  const getCaption = () => {
    let caption = 'Absentees List for '
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
        <title>COC - Absentees</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Absentees" breadCrumb={links} />
      </Box>
      <Box shadow="md" rounded="sm" p="1rem" bg="white">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="start">
          <Text fontWeight="semibold">Absentees List</Text>
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
                    Date
                  </FormLabel>
                  <Input type="date" _placeholder={{ fontSize: 'sm' }} onChange={handleDate} value={moment(date).format('yyyy-MM-DD') || ''} />
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
                    <option value="F">Zone G</option>
                    <option value="F">Zone H</option>
                    <option value="F">Zone I</option>
                  </Select>
                </FormControl>
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
            paginationTotalRows={attendance?.metaData?.total}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
          />
        </Box>
      </Box>
      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Absentees Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer ref={tableRef} border="1px" borderRadius="md">
              <Table size="md" colorScheme="green">
                <TableCaption placement="top" color="red" fontSize="2xl">
                  {getCaption()}
                </TableCaption>
                <Thead border="1px">
                  <Tr>
                    <Th border="1px">Name</Th>
                    <Th border="1px">Registration Number</Th>
                    <Th border="1px">Zone</Th>
                    <Th border="1px">Phone</Th>
                    <Th border="1px">Address</Th>
                    <Th border="1px">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {attendance &&
                    attendance?.data.map((item, index) => (
                      <Tr key={index} border="1px">
                        <Td border="1px">{`${item.firstname} ${item.middlename} ${item.lastname}`}</Td>
                        <Td border="1px">{item.cardNo}</Td>
                        <Td border="1px">{item.zone.name}</Td>
                        <Td border="1px">{item.contactNo}</Td>
                        <Td border="1px">{item.address}</Td>
                        <Td border="1px">{item.status}</Td>
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
export default Absentee
