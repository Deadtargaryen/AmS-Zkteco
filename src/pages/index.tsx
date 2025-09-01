import { Avatar, Box, Flex, Text, VStack } from '@chakra-ui/react'
import { FaUsers, FaMale, FaFemale, FaChartBar } from 'react-icons/fa'
import Head from 'next/head'
import PageHeaderComponent from '../../components/PageHeaderComponent'
import StatCard from '../../components/StatCard'
import ChartCard from '../../components/ChartCard'
import TopActiveWidget from '../../components/widgets/TopActiveWidget'
import { client as PrismaClient, client } from '../../lib/prisma'
import moment from 'moment'
import { Suspense } from 'react'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Dashboard',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]
const maleIcon = <FaMale />
const femaleIcon = <FaFemale />
const chart = <FaChartBar />
const membersIcon = <FaUsers />

const Home = ({
  maleMembers,
  femaleMembers,
  activeMembers,
  totalMembers,
  lastSundayAttendance,
  // lastMondayAttendance,
  lastWednesdayAttendance,
  // lastFridayAttendance,
  stats,
  isError,
}) => {
  const malePercent = Math.round((maleMembers / totalMembers) * 100)
  const femalePercent = Math.round((femaleMembers / totalMembers) * 100)
  const activePercent = Math.round((activeMembers / totalMembers) * 100)
  const isLoading = !totalMembers || !stats
  if (isError) {
    return (
      <>
        <h1>An error occurred</h1>
      </>
    )
  }
  return (
    <Suspense
      fallback={
        <>
          <h1>...LOADING</h1>
        </>
      }
    >
      <Box h="100%" color="gray.700">
        <Head>
          <title>Dashboard | COC Four Towns</title>
          <meta name="description" content="COC Attendance management system" />
          <link rel="icon" href="/coclogo.png" />
        </Head>

        <Box h="100%">
          <PageHeaderComponent title="Dashboard" breadCrumb={links} />
          <Box>
            <Flex wrap="wrap" justifyContent="space-between">
              <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
                <StatCard
                  isLoading={isLoading}
                  number={totalMembers}
                  label="Members"
                  arrowType="increase"
                  change={40}
                  changeText="since last month"
                  icon={membersIcon}
                />
              </Box>
              <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
                <StatCard
                  number={maleMembers}
                  label="Male members"
                  isLoading={isLoading}
                  arrowType="increase"
                  change={malePercent}
                  changeText="of total members"
                  icon={maleIcon}
                />
              </Box>
              <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
                <StatCard
                  number={femaleMembers}
                  label="Female members"
                  isLoading={isLoading}
                  arrowType="increase"
                  change={femalePercent}
                  changeText="of total members"
                  icon={femaleIcon}
                />
              </Box>
              <Box h="9rem" bg="white" rounded="sm" shadow="md" flexBasis={{ base: '100%', sm: '46%', lg: '24%' }} mb="2rem" p="1rem">
                <StatCard
                  number={activeMembers}
                  label="Active members"
                  isLoading={isLoading}
                  arrowType="increase"
                  change={activePercent}
                  changeText="of total members"
                  icon={chart}
                />
              </Box>
            </Flex>
          </Box>
          <Flex gap="1rem" h="550px" overflow="hidden" py="0.5rem">
            <Box flexBasis="65%" h="100%" shadow="md" bg="white" rounded="sm">
              <ChartCard stats={stats} isLoading={isLoading} totalMembers={totalMembers} />
            </Box>
            <Flex flexDirection="column" flexGrow="1" h="100%" gap="1rem">
              <Box flexBasis="60%" shadow="md" bg="white" rounded="sm" p="1rem">
                <TopActiveWidget stats={stats} isLoading={!stats} />
              </Box>
              <Box flexGrow="1" shadow="md" bg="white" rounded="sm" p="1rem">
                <Box>
                  <Text as="h3" fontWeight="semibold">
                    This Week Attendance
                  </Text>
                </Box>
                <Flex justifyContent="space-evenly" mt="1.5rem">
                  <VStack spacing="2">
                    <Avatar size="sm" name="S U" />
                    <Text as="h4" fontSize="sm" fontWeight="semibold">
                      Sunday
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                      {lastSundayAttendance}
                    </Text>
                  </VStack>
                  {/* <VStack spacing="2">
                    <Avatar size="sm" name="M O N" />
                    <Text as="h4" fontSize="sm" fontWeight="semibold">
                      Monday
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                      {lastMondayAttendance}
                    </Text>
                  </VStack> */}
                  <VStack spacing="2">
                    <Avatar size="sm" name="W E" />
                    <Text as="h4" fontSize="sm" fontWeight="semibold">
                      Wednesday
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                      {lastWednesdayAttendance}
                    </Text>
                  </VStack>
                  {/* <VStack spacing="2">
                    <Avatar size="sm" name="F R" />
                    <Text as="h4" fontSize="sm" fontWeight="semibold">
                      Friday
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                      {lastFridayAttendance}
                    </Text>
                  </VStack> */}
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Suspense>
  )
}

export async function getStaticProps() {
  try {
    const totalMembers = await PrismaClient.member.count()
    const maleMembers = await PrismaClient.member.count({
      where: {
        gender: 'MALE',
      },
    })
    const femaleMembers = await PrismaClient.member.count({
      where: {
        gender: 'FEMALE',
      },
    })
    const activeMembers = await PrismaClient.member.count({
      where: {
        status: 'ACTIVE',
      },
    })
    const res = await PrismaClient.attendance.findMany({
      include: {
        member: {
          select: {
            gender: true,
          },
        },
      },
    })
    const attendance = JSON.parse(JSON.stringify(res))

    const lastSunday = moment().day(0).format('LL')
    // const lastMonday = moment().day(1).format('LL')
    const lastWednesday = moment().day(3).format('LL')
    // const lastFriday = moment().day(5).format('LL')

    const lastSundayAttendance = attendance.filter(item => {
      return moment(item.date).format('LL') === lastSunday
    }).length

    // const lastMondayAttendance = attendance.filter(item => {
    //   return moment(item.date).format('LL') === lastMonday
    // }).length

    const lastWednesdayAttendance = attendance.filter(item => {
      return moment(item.date).format('LL') === lastWednesday
    }).length

    // const lastFridayAttendance = attendance.filter(item => {
    //   return moment(item.date).format('LL') === lastFriday
    // }).length

    // Attendance statistics for year
    const yearAttendanceStat = await PrismaClient.attendance.groupBy({
      by: ['memberId'],
      where: {
        year: new Date().getFullYear(),
      },
      _count: { memberId: true },
      orderBy: {
        _count: {
          memberId: 'desc',
        },
      },
      take: 5,
    })

    // Attendance statistics for month
    const monthAttendanceStat = await PrismaClient.attendance.groupBy({
      by: ['memberId'],
      where: {
        month: new Date().getMonth() + 1,
      },
      _count: { memberId: true },
      orderBy: {
        _count: {
          memberId: 'desc',
        },
      },
      take: 5,
    })

    // Get total number of days attendance taken in Year
    const attendanceDatesInYear = async () => {
      const result = await PrismaClient.attendance.groupBy({
        by: ['day', 'month', 'year'],
        where: {
          year: new Date().getFullYear(),
        },
        _count: { date: true },
      })
      return result.length
    }

    // GET TOTAL NUMBER OF DAYS ATTENDANCE TAKE IN MONTH
    const attendanceDatesInMonth = async month => {
      const result = await client.attendance.groupBy({
        by: ['day', 'month', 'year'],
        where: {
          month,
          year: new Date().getFullYear(),
        },
        _count: { date: true },
      })
      return result.length
    }

    const getMember = async id => {
      const member = await PrismaClient.member.findUnique({
        where: {
          id: id,
        },
        select: {
          firstname: true,
          lastname: true,
        },
      })
      return `${member.firstname} ${member.lastname}`
    }
    const monthlyAttendance = await Promise.all(
      monthAttendanceStat.map(async item => {
        const percentAtt = Math.floor((item._count.memberId / (await attendanceDatesInMonth(new Date().getMonth() + 1))) * 100)
        return { count: percentAtt, name: await getMember(item.memberId) }
      })
    )

    const yearlyAttendance = await Promise.all(
      yearAttendanceStat.map(async item => {
        const percentAtt = Math.floor((item._count.memberId / (await attendanceDatesInYear())) * 100)
        return { count: percentAtt, name: await getMember(item.memberId) }
      })
    )

    // GET ATTENDANCE AVG FOR YEAR
    const yearAttendanceTotal = await PrismaClient.attendance.count({
      where: {
        year: new Date().getFullYear(),
      },
    })
    const avgYearAttendance = Math.floor((yearAttendanceTotal / ((await attendanceDatesInYear()) * totalMembers)) * 100)

    // GET ATTENDANCE AVERAGE FOR MONTH
    const monthAttendanceTotal = await PrismaClient.attendance.count({
      where: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
    })
    const avgMonthAttendance = Math.floor((monthAttendanceTotal / ((await attendanceDatesInMonth(new Date().getMonth() + 1)) * totalMembers)) * 100)

    //GET ATTENDANCE PERCENTAGE DATA FOR MONTHS OF THE YEAR IN FEMALE CATEGORY
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const perMonthAttendanceTotalFemale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: {
              gender: 'FEMALE',
            },
          },
        })
        const percentMonthAttendanceFemale = Math.floor((result / ((await attendanceDatesInMonth(month)) * femaleMembers)) * 100)
        return percentMonthAttendanceFemale
      })
    )

    //GET ATTENDANCE PERCENTAGE DATA FOR MONTHS OF THE YEAR IN MALE CATEGORY
    const perMonthAttendanceTotalMale = await Promise.all(
      months.map(async month => {
        const result = await client.attendance.count({
          where: {
            year: new Date().getFullYear(),
            month,
            member: {
              gender: 'MALE',
            },
          },
        })
        const percentMonthAttendanceMale = Math.floor((result / ((await attendanceDatesInMonth(month)) * maleMembers)) * 100)
        return percentMonthAttendanceMale
      })
    )

    return {
      props: {
        maleMembers,
        femaleMembers,
        totalMembers,
        activeMembers,
        lastSundayAttendance,
        // lastMondayAttendance,
        lastWednesdayAttendance,
        // lastFridayAttendance,
        stats: {
          monthlyAttendance,
          yearlyAttendance,
          avgMonthAttendance,
          avgYearAttendance,
          perMonthAttendanceTotalFemale,
          perMonthAttendanceTotalMale,
        },
      },
      revalidate: 10,
    }
  } catch {
    return {
      notFound:true
    }
  }
}

export default Home
