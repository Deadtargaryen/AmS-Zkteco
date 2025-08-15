import { Flex, Text } from '@chakra-ui/react'
import React from 'react'
import BreadCrumbComponent from './BreadCrumbComponent'

type pageHeaderComponentProps = {
  title: string
  breadCrumb: {
    name: string
    href: string
    isLastChild?: boolean
    isCurrentPage?: boolean
  }[]
}

const PageHeaderComponent = (props: pageHeaderComponentProps) => {
  return (
    <Flex alignItems="center" justifyContent="space-between" mb="2rem" color="blackAlpha.700">
      <Text as="h2" fontWeight="bold" fontSize="lg">
        {props.title}
      </Text>
      <BreadCrumbComponent links={props.breadCrumb} />
    </Flex>
  )
}

export default PageHeaderComponent
