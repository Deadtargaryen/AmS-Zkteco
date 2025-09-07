import {
  Badge,
  Box,
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
} from "@chakra-ui/react";
import Head from "next/head";
import PageHeaderComponent from "../../../components/PageHeaderComponent";
import {
  FaUsers,
  FaMale,
  FaFemale,
  FaChartBar,
  FaTrashAlt,
} from "react-icons/fa";
import { MdOpenInNew, MdSearch, MdClose } from "react-icons/md";
import StatCard from "../../../components/StatCard";
import DataTable from "react-data-table-component";
import {
  useState,
  useEffect,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
} from "react";
import { badgeColor } from "../../../lib/badgeColor";
import Link from "next/link";
import Alert from "../../../components/AlertDialog";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import { useAppSelector } from "../../../redux/store/hooks";
import {
  useDeleteMemberMutation,
  useGetMembersQuery,
} from "../../../redux/store/api";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

const links = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "Members",
    href: "#",
    isLastChild: true,
    isCurrentPage: true,
  },
];

const maleIcon = <FaMale />;
const femaleIcon = <FaFemale />;
const chart = <FaChartBar />;
const membersIcon = <FaUsers />;

const Members = () => {
  const columns = [
    {
      name: "Name",
      selector: (row: { firstname: any; middlename: any; lastname: any }) =>
        `${row.firstname} ${row.middlename} ${row.lastname}`,
      sortable: true,
      width: "300px",
    },
    {
      name: "Card Number",
      selector: (row: { cardNo: any }) => row.cardNo,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row: { address: any }) => row.address,
      sortable: true,
      width: "300px",
    },
    {
      name: "Gender",
      selector: (row: { gender: any }) => row.gender,
      sortable: true,
    },
    {
      name: "Zone",
      selector: (row: { zone: { name: any } }) => row.zone.name,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: {
        status:
          | string
          | number
          | boolean
          | ReactElement<any, string | JSXElementConstructor<any>>
          | ReactFragment;
      }) => (
        <Badge
          colorScheme={badgeColor(row.status as string)}
          variant="subtle"
          rounded="md"
          fontSize="xs"
          textTransform="lowercase"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      name: "Actions",
      cell: (row: { id: any }) => (
        <Flex gap="1">
          <Tooltip
            fontSize="xs"
            hasArrow
            label="View Details"
            bg="gray.600"
            placement="top"
          >
            <Link
              href={{
                pathname: `/profile/${row.id}`,
                query: { isProfile: true },
              }}
            >
              <IconButton
                size="xs"
                variant="solid"
                colorScheme="green"
                aria-label="Search database"
                icon={<MdOpenInNew />}
              />
            </Link>
          </Tooltip>
          <Tooltip
            fontSize="xs"
            hasArrow
            label="Delete"
            bg="gray.600"
            placement="top"
          >
            <IconButton
              size="xs"
              variant="solid"
              colorScheme="red"
              aria-label="Search database"
              icon={<FaTrashAlt />}
              onClick={() => handleDeleteMember(row)}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  const [maleMembers, setMaleMembers] = useState(0);
  const [femaleMembers, setFemaleMembers] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [malePercentage, setMalePercentage] = useState(0);
  const [femalePercentage, setFemalePercentage] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const { data: members, isLoading } = useGetMembersQuery();
  const { user } = useAppSelector((state) => state.auth);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMember, setSelectedMember] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [
    deleteMember,
    { isLoading: deleteLoading, isSuccess, isError, error },
  ] = useDeleteMemberMutation();

  useEffect(() => {
    let filteredItems;
    if (members) {
      filteredItems = members?.filter((item) => {
        let fullname = `${item.firstname} ${item.middlename} ${item.lastname}`;
        return fullname.toLowerCase().includes(filterText.toLowerCase());
      });
    }
    setFilteredItems(filteredItems);
  }, [members, filterText]);

  useEffect(() => {
    if (members) {
      setMaleMembers(
        members?.filter((member) => member.gender === "MALE").length
      );
      setFemaleMembers(
        members?.filter((member) => member.gender === "FEMALE").length
      );
      setTotalMembers(members?.length);
      setActiveMembers(
        members?.filter((member) => member.status === "ACTIVE").length
      );
      setMalePercentage(Math.floor((maleMembers / totalMembers) * 100));
      setFemalePercentage(Math.floor((femaleMembers / totalMembers) * 100));
    }
  }, [members, maleMembers, femaleMembers, totalMembers]);

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText("");
    }
  };

  const handleDeleteMember = (row) => {
    onOpen();
    setSelectedMember(row);
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Member deleted.",
        description: `${selectedMember.firstname} ${selectedMember.lastname} successfully deleted.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      onClose();
    } else if (isError) {
      toast({
        title: "Error.",
        description: `${error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      onClose();
    }
  }, [isSuccess, isError]);

  const deleteEvent = async (id:string) => {
    if (id) {
      deleteMember(id);
    }
  };

  if (user?.role !== "ADMIN" && user?.role !== "DIRECTOR") {
    return (
      <Box>
        <Head>
          <title>Members</title>
        </Head>
        <PageHeaderComponent title="Members Page" breadCrumb={links} />
        <Box p="4">
          <Text>You are not authorized to view this page.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Head>
        <title>COC - Members</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="Members" breadCrumb={links} />
        <Box>
          <Flex wrap="wrap" justifyContent="space-between">
            <Box
              h="9rem"
              bg="white"
              rounded="sm"
              shadow="md"
              flexBasis={{ base: "100%", sm: "46%", lg: "24%" }}
              mb="2rem"
              p="1rem"
            >
              <StatCard
                number={totalMembers}
                label="Members"
                isLoading={isLoading}
                arrowType="increase"
                change={40}
                changeText="since last month"
                icon={membersIcon}
              />
            </Box>
            <Box
              h="9rem"
              bg="white"
              rounded="sm"
              shadow="md"
              flexBasis={{ base: "100%", sm: "46%", lg: "24%" }}
              mb="2rem"
              p="1rem"
            >
              <StatCard
                number={maleMembers}
                label="Male members"
                isLoading={isLoading}
                arrowType="increase"
                change={malePercentage}
                changeText="of total members"
                icon={maleIcon}
              />
            </Box>
            <Box
              h="9rem"
              bg="white"
              rounded="sm"
              shadow="md"
              flexBasis={{ base: "100%", sm: "46%", lg: "24%" }}
              mb="2rem"
              p="1rem"
            >
              <StatCard
                number={femaleMembers}
                label="Female members"
                isLoading={isLoading}
                arrowType="increase"
                change={femalePercentage}
                changeText="of total members"
                icon={femaleIcon}
              />
            </Box>
            <Box
              h="9rem"
              bg="white"
              rounded="sm"
              shadow="md"
              flexBasis={{ base: "100%", sm: "46%", lg: "24%" }}
              mb="2rem"
              p="1rem"
            >
              <StatCard
                number={activeMembers}
                label="Active members"
                isLoading={isLoading}
                arrowType="decrease"
                change={40}
                changeText="of total members"
                icon={chart}
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
              <Input
                type="text"
                placeholder="Search"
                onChange={(e) => setFilterText(e.target.value)}
                value={filterText}
              />
              <InputRightElement onClick={() => handleClear()}>
                <IconButton
                  aria-label="close"
                  variant="ghost"
                  icon={<MdClose />}
                />
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
      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={onClose}
        onDelete={deleteEvent}
        itemId={selectedMember?.id || ""}
        itemName={`${selectedMember?.firstname} ${selectedMember?.lastname}`}
        isLoading={deleteLoading}
      />
    </Box>
  );
};

export default Members;
