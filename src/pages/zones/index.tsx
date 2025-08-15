import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/router'
import { Badge, Box, Button, Flex, IconButton, Input, InputGroup, InputLeftElement, InputRightElement, Select, Spinner, Text } from '@chakra-ui/react'
import Head from 'next/head'
import { FaChartBar, FaFemale, FaMale, FaUsers } from 'react-icons/fa'
import DataTable from 'react-data-table-component'
import { MdClose, MdPreview, MdSearch } from 'react-icons/md'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import StatCard from '../../../components/StatCard'
import { badgeColor } from '../../../lib/badgeColor'
import { useAppSelector } from '../../../redux/store/hooks'
import { useGetMembersQuery } from '../../../redux/store/api'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Zone',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const maleIcon = <FaMale />
const femaleIcon = <FaFemale />
const chart = <FaChartBar />
const membersIcon = <FaUsers />

const Zones = () => {
  const {data:members, isLoading, isError} = useGetMembersQuery()
  const {user} = useAppSelector(state => state.auth)
  const [currentZoneMembers, setCurrentZoneMembers] = useState([])
  const [currentzone, setCurrentZone] = useState('A')
  const router = useRouter()
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

  const columns = [
    {
      name: 'Name',
      selector: row => `${row.firstname} ${row.middlename} ${row.lastname}`,
      sortable: true,
      width: '300px',
    },
    {
      name: 'Card Number',
      selector: row => row.cardNo,
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true,
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        <Badge colorScheme={badgeColor(row.status)} variant="subtle" rounded="md" fontSize="xs" textTransform="lowercase">
          {row.status}
        </Badge>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <Button
          disabled={user?.role !== 'DIRECTOR'}
          leftIcon={<MdPreview />}
          colorScheme="green"
          size="xs"
          variant="outline"
          onClick={() => gotoProfile(row.id)}
        >
          View
        </Button>
      ),
    },
  ]

  const filteredItems = currentZoneMembers?.filter(item => {
    let fullname = `${item.firstname} ${item.middlename} ${item.lastname}`
    return fullname.toLowerCase().includes(filterText.toLowerCase())
  })

  useEffect(() => {
    const getMemebers = () => {
      const newMembers = members?.filter(m => m.zone.name === currentzone)
      if (!isLoading) {
        setCurrentZoneMembers(newMembers)
      }
    }
    getMemebers()
  }, [isLoading, currentzone, members])

  const gotoProfile = id => {
    router.push(`/profile/${id}?isProfile=true`)
  }

  const maleMembers = currentZoneMembers?.filter(member => member.gender === 'MALE').length
  const femaleMembers = currentZoneMembers?.filter(member => member.gender === 'FEMALE').length
  const totalMembers = currentZoneMembers?.length
  const activeMembers = currentZoneMembers?.filter(member => member.status === 'ACTIVE').length
  const malePercentage = Math.floor((maleMembers / totalMembers) * 100) || 0
  const femalePercentage = Math.floor((femaleMembers / totalMembers) * 100) || 0
  const zonePercentage = Math.floor((totalMembers / members?.length) * 100) || 0
  const activePercents = Math.floor((activeMembers / totalMembers) * 100) || 0

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle)
      setFilterText('')
    }
  }

  return (
    <Box>
      <Head>
        <title>COC - Zones</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Zones" breadCrumb={links} />
        <Select w="fit-content" size="sm" rounded="md" onChange={e => setCurrentZone(e.target.value)}>
          <option value="A">Zone A</option>
          <option value="B">Zone B</option>
          <option value="C">Zone C</option>
          <option value="D">Zone D</option>
          <option value="E">Zone E</option>
          <option value="F">Zone F</option>
          <option value="G">Zone G</option>
          <option value="H">Zone H</option>
          <option value="I">Zone I</option>
          <option value="J">Zone J</option>
          <option value="K">Zone K</option>
        </Select>
      </Box>
      <Box mt="1rem">
        <Flex wrap="wrap" justifyContent="space-between">
          <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
            <StatCard
              number={totalMembers}
              isLoading={isLoading}
              label="Members"
              arrowType="increase"
              change={zonePercentage}
              changeText="of total members"
              icon={membersIcon}
              isError={isError}
            />
          </Box>
          <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
            <StatCard
              number={maleMembers}
              isLoading={isLoading}
              label="Male members"
              arrowType="increase"
              change={malePercentage}
              changeText="of zone members"
              icon={maleIcon}
              isError={isError}
            />
          </Box>
          <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
            <StatCard
              number={femaleMembers}
              isLoading={isLoading}
              label="Female members"
              arrowType="increase"
              change={femalePercentage}
              changeText="of zone members"
              icon={femaleIcon}
              isError={isError}
            />
          </Box>
          <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
            <StatCard
              number={activeMembers}
              label="Active members"
              labelAddon=""
              isLoading={isLoading}
              arrowType="decrease"
              change={activePercents}
              changeText="of total members"
              icon={chart}
              isError={isError}
            />
          </Box>
        </Flex>
      </Box>
      <Box shadow="md" rounded="sm" p="1rem" bg="white">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="center">
          <Text fontWeight="semibold">Members List</Text>
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
          data={filteredItems}
          paginationResetDefaultPage={resetPaginationToggle}
          pagination
          progressComponent={<Spinner />}
          progressPending={isLoading}
        />
      </Box>
    </Box>
  )
}

export default Zones
