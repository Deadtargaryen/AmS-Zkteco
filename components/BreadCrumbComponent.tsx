import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'

type BreadCrumbComponentProps = {
  links: {
    name: string
    href: string
    isLastChild?: boolean
    isCurrentPage?: boolean
  }[]
}
const BreadCrumbComponent = (props: BreadCrumbComponentProps) => {
  return (
    <Breadcrumb fontSize="sm" fontWeight="semibold">
      {props.links.map(link => (
        <BreadcrumbItem
          key={link.name}
          isLastChild={link.isLastChild}
          fontWeight={link.isLastChild ? 'normal' : ''}
          opacity={link.isCurrentPage ? '0.8' : ''}
        >
          <BreadcrumbLink as={NextLink} href={link.href}>
            {link.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}

export default BreadCrumbComponent
