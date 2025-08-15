import { LinkBox, LinkOverlay, ListIcon, ListItem } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { MdAdminPanelSettings } from 'react-icons/md'
import { useRouter } from 'next/router'

type SingleNavMenuProps = {
  linkto: string
  linkName: string
  role: string
  permission: 'FLEXIBLE' | 'STRICT'
}

const SingleNavMenu = (props: SingleNavMenuProps) => {
  const router = useRouter()
  return (
    <ListItem
      fontWeight="semibold"
      fontSize="sm"
      p="8px"
      rounded="md"
      display={props.permission === 'FLEXIBLE' && props.role !== 'USER' ? 'block' : 'block'}
      sx={router.pathname === props.linkto ? { color: 'primary', bg: 'primaryAccent', _hover: { opacity: 0.9 } } : { _hover: { color: 'gray.700' } }}
    >
      <LinkBox>
        <NextLink href={props.linkto} passHref>
          <LinkOverlay>
            <ListIcon as={MdAdminPanelSettings} fontSize="lg" />
            {props.linkName}
          </LinkOverlay>
        </NextLink>
      </LinkBox>
    </ListItem>
  )
}

export default SingleNavMenu
