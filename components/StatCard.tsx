import { StatGroup, Stat, Flex, StatNumber, StatLabel, StatHelpText, StatArrow, Box, Skeleton, Text, Center } from '@chakra-ui/react'
import CountUp from 'react-countup'
import { MdErrorOutline } from 'react-icons/md'

type StatCardProps = {
  number: number
  label: string
  change: number
  changeText: string
  arrowType: 'increase' | 'decrease'
  icon: JSX.Element
  labelAddon?: string
  isLoading: boolean
  isError?: boolean
}
const StatCard = (props: StatCardProps) => {
  if (props.isError)
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <Text fontWeight="medium" mr='1'>Error</Text>
        <MdErrorOutline size='23' />
      </Flex>
    )
  return (
    <Skeleton isLoaded={!props.isLoading}>
      <StatGroup>
        <Stat>
          <Flex alignItems="center" justifyContent="space-between">
            <Box>
              <StatNumber>
                <CountUp end={props.number} duration={2} />
                {props.labelAddon}
              </StatNumber>
              <StatLabel fontWeight="normal">{props.label}</StatLabel>
            </Box>
            <Box fontSize="2rem" color="green.400">
              {props.icon}
            </Box>
          </Flex>
          <StatHelpText mt="1.5rem">
            <StatArrow type={props.arrowType} />
            <Box as="span" color="green.300" fontWeight="medium">
              {props.change}%
            </Box>
            {` ${props.changeText}`}
          </StatHelpText>
        </Stat>
      </StatGroup>
    </Skeleton>
  )
}

export default StatCard
