import { Box } from '@chakra-ui/react'
import Head from 'next/head'
import React, { useState } from 'react'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import Editor from '../../../components/editor'

const links = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Members',
    href: '/members',
  },
  {
    name: 'New Member',
    href: '#',
    isLastChild: true,
    isCurrentPage: true,
  },
]

const Add = () => {
  return (
    <Box>
      <Head>
        <title>COC - New Member</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title="New Member" breadCrumb={links} />
        <Editor
          address=""
          cardNo={0}
          contactNo=""
          alternateContact=""
          email=""
          firstname=""
          gender={null}
          lastname=""
          maritalStatus={null}
          middlename=""
          occupation=""
          placeOfBirth=""
          status="ACTIVE"
          zone={null}
          isEditing={false}
          isRestore={false}
          nextOfKin=""
          kinContact=""
          businessAddress=""
        />
      </Box>
    </Box>
  )
}

export default Add
