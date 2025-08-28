import { useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react'
import { MdErrorOutline, MdReorder } from 'react-icons/md'

interface RankedMember {
  name: string
  count: number
}


const TopActiveZonesWidget = ({ stats = [], isLoading }) => {
  const [sortby, setSortby] = useState('Year')
  const [data, setData] = useState<RankedMember[]>([])

  useEffect(() => {
    
    if (!stats || stats.length === 0) return

    // Example: you might later differentiate Year vs Month if you have attendance logs
    let baseData = stats

    // Group by member inside the selected zone
    const memberMap : Record<string, RankedMember> = {}
    baseData.forEach((m) => {
      const name = `${m.firstname} ${m.middlename} ${m.lastname}`
      if (!memberMap[name]) {
        memberMap[name] = { name, count: 0 }
      }
      // Increase based on activity — right now we only use "status === ACTIVE"
      memberMap[name].count += m.status === 'ACTIVE' ? 1 : 0
    })

    // Sort members by activity
    const grouped = Object.values(memberMap).sort((a, b) => b.count - a.count)

    setData(grouped)
  }, [sortby, stats])

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
          Top Active Members in Zone {`${sortby === 'Year' ? '( Year )' : '( Month )'}`}
        </Text>
        <Menu>
          <MenuButton as={IconButton} aria-label="Options" icon={<MdReorder />} variant="outline">
            <Box as="span" fontSize="sm" fontWeight="normal">
              {sortby}
            </Box>
          </MenuButton>
          <MenuList>
            <MenuItem fontSize="xs" onClick={() => setSortby('Year')}>
              Sort By Year
            </MenuItem>
            <MenuItem fontSize="xs" onClick={() => setSortby('Month')}>
              Sort By Month
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <SkeletonText isLoaded={!isLoading} noOfLines={8} spacing="4" mt="4">
        <Box mt="1.5rem">
          <Stack spacing="2">
            {data.map((item, index) => (
              <Flex alignItems="center" justifyContent="space-between" key={index}>
                <Text fontSize="xs" pr="6px">
                  {index + 1}.
                </Text>
                <Text fontSize="xs" fontWeight="bold" mr="1rem" width="50%">
                  {item.name}
                </Text>
                <CircularProgress value={item.count * 10} color="green.400" size="40px" thickness="10px">
                  <CircularProgressLabel>{item.count}</CircularProgressLabel>
                </CircularProgress>
              </Flex>
            ))}
          </Stack>
        </Box>
      </SkeletonText>
    </Box>
  )
}

export default TopActiveZonesWidget
