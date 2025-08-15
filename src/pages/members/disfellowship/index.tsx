import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import Head from 'next/head'
import PageHeaderComponent from '../../../../components/PageHeaderComponent'
import { FaUsers, FaMale, FaFemale, FaChartBar, FaTrashAlt } from 'react-icons/fa'
import { MdOpenInNew, MdSearch, MdClose, MdPreview } from 'react-icons/md'
import DataTable from 'react-data-table-component'
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactFragment } from 'react'
import { badgeColor } from '../../../../lib/badgeColor'
import Link from 'next/link'
import Alert from '../../../../components/AlertDialog'
import { useAppSelector } from '../../../../redux/store/hooks'
import { useDeleteMemberMutation, useGetArchivedMembersQuery, useGetMembersQuery } from '../../../../redux/store/api'
import moment from 'moment'
import { useRouter } from 'next/router'

const links = [
  {
    name: 'Dashboard',
    href: '/',
  },
  {
    name: 'Members',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const maleIcon = <FaMale />
const femaleIcon = <FaFemale />
const chart = <FaChartBar />
const membersIcon = <FaUsers />

const Members = () => {
  const columns = [
    {
      name: 'Name',
      selector: (row: { firstname: any; middlename: any; lastname: any }) => `${row.firstname} ${row.middlename} ${row.lastname}`,
      sortable: true,
      width: '300px',
    },
    {
      name: 'Disfellowship date',
      selector: (row: { disfellowshipDate: any }) => moment(row.disfellowshipDate).format('LL'),
      sortable: true,
      width: '200px',
    },
    {
      name: 'Address',
      selector: (row: { address: any }) => row.address,
      sortable: true,
      width: '300px',
    },
    {
      name: 'Gender',
      selector: (row: { gender: any }) => row.gender,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row: { id: any }) => (
        
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

  const [totalMembers, setTotalMembers] = useState(0)
  const [filterText, setFilterText] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const { data: members, isLoading } = useGetArchivedMembersQuery()
  const { user } = useAppSelector(state => state.auth)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedMember, setSelectedMember] = useState(null)
  const [filteredItems, setFilteredItems] = useState([])
  const [deleteMember, { isLoading: deleteLoading, isSuccess, isError, error }] = useDeleteMemberMutation()
  const router = useRouter()

  useEffect(() => {
    let filteredItems
    if (members) {
      filteredItems = members?.filter(item => {
        let fullname = `${item.firstname} ${item.middlename} ${item.lastname}`
        return fullname.toLowerCase().includes(filterText.toLowerCase())
      })
    }
    setFilteredItems(filteredItems)
  }, [members, filterText])

  useEffect(() => {
    if (members) {
      setTotalMembers(members?.length)
    }
  }, [members, totalMembers])

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle)
      setFilterText('')
    }
  }

  const gotoProfile = id => {
    router.push({ pathname: `/profile/${id}`, query: { isProfile: false } })
  }

  const handleDeleteMember = row => {
    onOpen()
    setSelectedMember(row)
  }

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Member deleted.',
        description: `${selectedMember.firstname} ${selectedMember.lastname} successfully deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
      onClose()
    } else if (isError) {
      toast({
        title: 'Error.',
        description: `${error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
      onClose()
    }
  }, [isSuccess, isError])

  const deleteEvent = async () => {
    deleteMember(selectedMember?.id)
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTOR') {
    return (
      <Box>
        <Head>
          <title>Disfellowship</title>
        </Head>
        <PageHeaderComponent title="Members Page" breadCrumb={links} />
        <Box p="4">
          <Text>You are not authorized to view this page.</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Head>
        <title>COC - Disfellowshipped Members</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Disfellowshipped Members" breadCrumb={links} />

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
      <Alert
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        affirm={deleteEvent}
        text={`Do you want to delete ${selectedMember?.firstname} ${selectedMember?.lastname}?`}
        title="Delete Member?"
        loading={deleteLoading}
      />
    </Box>
  )
}

export default Members
