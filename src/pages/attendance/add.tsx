import {
  Avatar,
  Box,
  Button,
  Center,
  color,
  Flex,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import moment from "moment";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import PageHeaderComponent from "../../../components/PageHeaderComponent";
import DatalistInput from "react-datalist-input";
import "react-datalist-input/dist/styles.css";
import { useAddAttendanceMutation } from "../../../redux/store/api";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { client } from "../../../lib/prisma";

const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Attendance",
    href: "/attendance",
  },
  {
    name: "New Attendance",
    href: "#",
    isLastChild: true,
    isCurrentPage: true,
  },
];

const Add = ({ members }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberZone, setMemberZone] = useState(null);
  const [memberCard, setMemberCard] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const nameRef = useRef<HTMLInputElement>();
  const [newAttendance, { isLoading, data, isError, error, isSuccess }] =
    useAddAttendanceMutation();
  const [id, setId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setInterval(() => {
      setCurrentTime(moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
    }, 1000);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: `${data.message}`,
        position: "top-right",
        isClosable: true,
        status: "success",
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      const { data } = error as { data: { message: string } };
      toast({
        title: `${data.message}`,
        position: "top-right",
        isClosable: true,
        status: "error",
      });
    }
  }, [isError, error]);

  const handleSubmit = async (e) => {
    const date = new Date();
    const body = { id, date };
    newAttendance(body);
  };
  return (
    <Box>
      <Head>
        <title>COC - New Attendance</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="New Attendance" breadCrumb={links} />
        <Flex
          justifyContent="center"
          flexDirection="column"
          gap="6"
          alignItems="center"
          w="48%"
          bg="white"
          shadow="base"
          mx="auto"
          p="3rem"
        >
          <Text fontSize="2xl" fontWeight="semibold" color="primary">
            {currentTime}
          </Text>
          <Box w="100%">
            {/* Search by Member Name */}
            <DatalistInput
              listboxProps={{
                style: { maxHeight: "250px", overflowY: "auto" },
              }}
              label=""
              placeholder="Search by Member Name"
              ref={nameRef}
              onSelect={(item) => {
                setMemberName(item.value);
                setId(item.id);
                setAvatarUrl(item.avatarUrl);
                setMemberZone(item.zone);
                setMemberCard(item.cardNo);
              }}
              items={members.map((member) => ({
                value: `${member.firstname} ${member.middlename} ${member.lastname}`,
                cardNo: member.cardNo,
                zone: member.zone.name,
                id: member.id,
                avatarUrl: member.avatarUrl,
              }))}
            />

            {/* Search by Card Number */}
            <Box mt="4">
              <DatalistInput
                listboxProps={{
                  style: { maxHeight: "250px", overflowY: "auto" },
                }}
                label=""
                placeholder="Search by Card Number"
                onSelect={(item) => {
                  setMemberName(
                    `${item.firstname} ${item.middlename} ${item.lastname}`
                  );
                  setId(item.id);
                  setAvatarUrl(item.avatarUrl);
                  setMemberZone(item.zone);
                  setMemberCard(item.cardNo);
                }}
                items={members.map((member) => ({
                  value: member.cardNo,
                  firstname: member.firstname,
                  middlename: member.middlename,
                  lastname: member.lastname,
                  id: member.id,
                  avatarUrl: member.avatarUrl,
                  zone: member.zone.name,
                  cardNo: member.cardNo,
                }))}
              />
            </Box>
          </Box>

          <Avatar size="2xl" name={memberName} src={avatarUrl} />
          <VStack>
            <Text fontSize="lg" fontWeight="bold">
              {memberName}
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
              Zone: {memberZone}
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
              Card Number: {memberCard}
            </Text>
          </VStack>
          <Button
            colorScheme="blue"
            fontWeight="normal"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Mark Present
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const members = await client.member.findMany({
    select: {
      id: true,
      firstname: true,
      middlename: true,
      lastname: true,
      cardNo: true,
      avatarUrl: true,
      zone: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session, members },
  };
};
export default Add;
