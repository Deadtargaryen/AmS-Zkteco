import { useState } from 'react'
import { Box, Flex, IconButton, Input, InputGroup, InputLeftElement, InputRightElement, Select, Spinner, Text } from '@chakra-ui/react'
import Head from 'next/head'
import DataTable from 'react-data-table-component'
import { MdClose, MdSearch } from 'react-icons/md'
import PageHeaderComponent from '../../../../components/PageHeaderComponent'

import { useDebounce } from '../../../../redux/store/hooks'
import { useAttendanceReportQuery } from '../../../../redux/store/api'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Monthly Report',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const MonthlyReport = () => {
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [month, setMonth] = useState<number | string>('')
  const debouncedSearch = useDebounce(filterText, 1000)

  const {
    data: attendanceReport,
    isLoading: reportLoading,
    isFetching,
  } = useAttendanceReportQuery({ page, perPage, month, searchParams: debouncedSearch }, { refetchOnMountOrArgChange: true })

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      width: '300px',
    },
    {
      name: 'Card Number',
      selector: row => row.cardNo,
      sortable: true,
    },
    {
      name: 'Sundays',
      selector: row => row.totalSundayAttendance,
      sortable: true,
    },
    // {
    //   name: 'Mondays',
    //   selector: row => row.totalMondayAttendance,
    //   sortable: true,
    // },
    {
      name: 'Wednesdays',
      selector: row => row.totalWednesdayAttendance,
      sortable: true,
    },
    // {
    //   name: 'Fridays',
    //   selector: row => row.totalFridayAttendance,
    //   sortable: true,
    // },
    {
      name: 'Total',
      selector: row => row.totalAttendance,
      sortable: true,
    },
  ]

  const handlePageChange = page => {
    setPage(page)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    setPage(page)
  }

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle)
      setFilterText('')
    }
  }

  const months = [
    { title: 'All', value: null },
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

  return (
    <Box>
      <Head>
        <title>COC - Monthly report</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Monthly Report" breadCrumb={links} />
        <Select w="fit-content" size="sm" rounded="md" onChange={e => setMonth(e.target.value)}>
          {months.map(month => (
            <option key={month.title} value={month.value ?? ''}>
              {month.title}
            </option>
          ))}
        </Select>
      </Box>
      <Box shadow="md" rounded="sm" p="1rem" bg="white" mt="2">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="center">
          <Text fontWeight="semibold">Attendance Summary</Text>
          <InputGroup maxW="20%">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search" onChange={e => setFilterText(e.target.value)} value={filterText} />
            <InputRightElement onClick={() => handleClear()}>
              <IconButton aria-label="close" variant="ghost" icon={<MdClose />} />
            </InputRightElement>
          </InputGroup>
        </Flex>
        <DataTable
          columns={columns}
          data={attendanceReport?.data}
          paginationResetDefaultPage={resetPaginationToggle}
          pagination
          progressComponent={<Spinner />}
          progressPending={reportLoading || isFetching}
          paginationServer
          paginationTotalRows={attendanceReport?.metaData?.total}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
        />
      </Box>
    </Box>
  )
}

export default MonthlyReport
