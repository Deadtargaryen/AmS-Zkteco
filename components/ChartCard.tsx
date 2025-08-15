import { Box, Button, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, StackDivider, Text } from '@chakra-ui/react'
import { FaChevronDown } from 'react-icons/fa'
import React from 'react'
import { NumericFormat } from 'react-number-format'
import CountUp from 'react-countup'
import dynamic from 'next/dynamic'
import data from '../lib/attendanceChartData'
import { useState, useEffect } from 'react'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
import { Stats } from '../lib/attendanceChartData'

type ChartCardProps = {
  totalMembers: number
  isLoading: boolean
  stats: Stats
}
const ChartCard = (props: ChartCardProps) => {
  const [sortby, setSortby] = React.useState('Monthly')
  const [options, setOptions] = useState({})
  const [series, setSeries] = useState([])

  useEffect(() => {
    if (!props.isLoading) {
      const { series, options } = data(sortby, props.stats)
      setSeries(series)
      setOptions(options)
    }
  }, [props.stats, sortby, props.isLoading])

  return (
    <Box h="100%" p="1rem">
      <Flex justifyContent="space-between">
        <Text as="h3" fontWeight="semibold">
          Attendance Analytics
        </Text>
        <Menu>
          <MenuButton as={Button} rightIcon={<FaChevronDown />} fontSize="sm">
            <Box as="span" fontSize="xs" fontWeight="normal">
              {sortby}
            </Box>
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => {
                setSortby('Monthly')
              }}
            >
              Monthly
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortby('Quarterly')
              }}
            >
              Quarterly
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Box px="2rem" mt="1.5rem">
        <HStack spacing="4" divider={<StackDivider borderColor="gray.200" />}>
          <Box>
            <Text as="span" fontSize="2xl" fontWeight="semibold" pr="1rem" color="primary">
              <CountUp end={props.totalMembers} duration={2} />
            </Text>
            <Text as="span" fontSize="sm" fontWeight="medium" color="gray.500">
              Members
            </Text>
          </Box>
          <Box>
            <Text as="span" fontSize="2xl" fontWeight="semibold" pr="1rem">
              <NumericFormat displayType="text" value={props.stats.avgMonthAttendance} thousandSeparator="," suffix="%" />
            </Text>
            <Text as="span" fontSize="sm" fontWeight="medium" color="gray.500">
              Avg. Attendance this month
            </Text>
          </Box>
          <Box>
            <Text as="span" fontSize="2xl" fontWeight="semibold" pr="1rem">
              <NumericFormat displayType="text" value={props.stats.avgYearAttendance} suffix="%" />
            </Text>
            <Text as="span" fontSize="sm" fontWeight="medium" color="gray.500">
              Avg. Attendance this year
            </Text>
          </Box>
        </HStack>
      </Box>
      <Box h="100%">{typeof window !== 'undefined' && <Chart options={options} series={series} type="bar" width="100%" height="80%" />}</Box>
    </Box>
  )
}

export default ChartCard
