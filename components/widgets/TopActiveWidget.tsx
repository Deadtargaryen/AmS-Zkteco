import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'

import { MdErrorOutline, MdReorder } from 'react-icons/md'


const TopActiveWidget = ({ stats, isLoading }) => {
  const [sortby, setSortby] = useState('Year')
  const [data, setData] = useState(stats.yearlyAttendance)

  useEffect(() => {
    if (sortby === 'Month') {
      setData(stats.monthlyAttendance)
    } else {
      setData(stats.yearlyAttendance)
    }
  }, [sortby])

  if (!stats && !isLoading)
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <Text fontWeight="medium" mr="1">
          Error
        </Text>
        <MdErrorOutline size="23" />
      </Flex>
    )
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center">
        <Text as="h3" fontWeight="semibold">
          Top Active Members {`${sortby === 'Year' ? '( Year )' : '( Month )'}`}
        </Text>
        <Menu>
          <MenuButton as={IconButton} aria-label="Options" icon={<MdReorder />} variant="outline">
            <Box as="span" fontSize="sm" fontWeight="normal">
              {sortby}
            </Box>
          </MenuButton>
          <MenuList>
            <MenuItem
              fontSize="xs"
              onClick={() => {
                setSortby('Year')
              }}
            >
              Sort By Year
            </MenuItem>
            <MenuItem
              fontSize="xs"
              onClick={() => {
                setSortby('Month')
              }}
            >
              Sort By Month
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <SkeletonText isLoaded={!isLoading} noOfLines={8} spacing="4" mt="4">
        <Box mt="1.5rem">
          <Stack spacing="2">
            {data.map((item, index) => (
              <Flex alignItems="center" justifyContent="space-between" key="index">
                <Text fontSize="xs" pr="6px">
                  {index + 1}.
                </Text>
                <Text fontSize="xs" fontWeight="bold" mr="1rem" width="50%">
                  {item.name}
                </Text>
                <CircularProgress value={item.count} color="green.400" size="40px" thickness="10px" animation="ease-in">
                  <CircularProgressLabel>{item.count}%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
            ))}
          </Stack>
        </Box>
      </SkeletonText>
    </Box>
  )
}

export default TopActiveWidget
