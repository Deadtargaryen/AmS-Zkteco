import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import Head from 'next/head'

import DataTable from 'react-data-table-component'
import { FaTrashAlt, FaPlus, FaPencilAlt } from 'react-icons/fa'
import { useRouter } from 'next/router'
import moment from 'moment'
import { useToast } from '@chakra-ui/react'
import Alert from '../../../components/AlertDialog'
import { useAppSelector } from '../../../redux/store/hooks'
import { useDeleteUserMutation, useEditUserMutation, useGetUsersQuery } from '../../../redux/store/api'
import PageHeaderComponent from '../../../components/PageHeaderComponent'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Admin',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const Admin = () => {
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
  const { data, isLoading } = useGetUsersQuery()
  const router = useRouter()
  const [itemId, setItemId] = useState('')
  const toast = useToast()
  const [deleteUser, { isLoading: deleteLoading, isSuccess, isError, error }] = useDeleteUserMutation()
  const [editUser, { isLoading: editLoading, isSuccess: editSuccess, isError: isEditError, error: editError }] = useEditUserMutation()
  const { user } = useAppSelector(state => state.auth)
  const [role, setRole] = useState('')

  const columns = [
    {
      name: 'Username',
      selector: row => row.name,
      sortable: true,
      width: '300px',
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
      cell: row => <Text textTransform="lowercase">{row.role}</Text>,
    },
    {
      name: 'Last Activity',
      selector: row => row.lastActiveAt,
      sortable: true,
      cell: row => <Text>{row.lastActiveAt ? moment(row.lastActiveAt).format('LLLL') : 'N/A'}</Text>,
      width: '300px',
    },
    {
      name: 'Created At',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => <Text>{moment(row.createdAt).format('LLLL')}</Text>,
      width: '300px',
    },
    {
      name: 'Actions',
      cell: row => (
        <Flex gap="1">
          <Tooltip fontSize="xs" hasArrow label="Delete" bg="gray.600" placement="top">
            <IconButton
              size="xs"
              variant="solid"
              colorScheme="red"
              aria-label="Delete user"
              onClick={() => handleDelete(row.id)}
              icon={<FaTrashAlt />}
            />
          </Tooltip>
          <Tooltip fontSize="xs" hasArrow label="Delete" bg="gray.600" placement="top">
            <IconButton
              size="xs"
              variant="solid"
              colorScheme="green"
              aria-label="Edit user"
              onClick={() => handleEdit(row.id)}
              icon={<FaPencilAlt />}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ]
  const handleNewUser = () => {
    router.push('/admin/new')
  }

  const handleEdit = id => {
    onOpen2()
    setItemId(id)
  }

  const handleSave = async () => {
    editUser({ id: itemId, body: { role } }).then(() => {
      onClose2()
    })
  }

  const handleDelete = id => {
    onOpen()
    setItemId(id)
  }

  const deleteItem = async id => {
    deleteUser(id).then(() => {
      onClose()
    })
  }
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'User deleted.',
        description: 'User has been deleted.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
    } else if (isError) {
      const { data } = error as { data: { error: string } }
      toast({
        title: 'Error.',
        description: `${data.error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
    } else if (editSuccess) {
      toast({
        title: 'User updated.',
        description: 'User role has been updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
    } else if (isEditError) {
      const { data } = editError as { data: { error: string } }
      toast({
        title: 'Error.',
        description: `${data.error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      })
    }
  }, [isSuccess, isError, editSuccess, isEditError])

  if (user && user?.role !== 'ADMIN' && user?.role !== 'DIRECTOR') {
    return (
      <Box>
        <Head>
          <title>Admin</title>
        </Head>
        <PageHeaderComponent title="Admin Page" breadCrumb={links} />
        <Box p="4">
          <Text>You are not authorized to view this page.</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Head>
        <title>COC - Admin</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <PageHeaderComponent title="Admin Page" breadCrumb={links} />
      <Box shadow="md" rounded="sm" p="1rem" bg="white">
        <Flex justifyContent="space-between" mb="1.5rem" alignItems="center">
          <Text fontWeight="semibold">Users</Text>
          <Button leftIcon={<FaPlus />} colorScheme="green" size="sm" onClick={() => handleNewUser()}>
            New user
          </Button>
        </Flex>
        <DataTable
          columns={columns}
          data={data}
          paginationResetDefaultPage={resetPaginationToggle}
          pagination
          progressComponent={<Spinner />}
          progressPending={isLoading}
        />
      </Box>
      <Alert
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        affirm={() => deleteItem(itemId)}
        text="Are you sure you want to delete this user?"
        title="Delete Event?"
        loading={deleteLoading}
      />
      <Modal isOpen={isOpen2} onClose={onClose2}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update User Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select placeholder="Select option" value={role} onChange={e => setRole(e.target.value)}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DIRECTOR">DIRECTOR</option>
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose2}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={() => handleSave()} isLoading={editLoading}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
export default Admin
