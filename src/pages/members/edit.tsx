import { Box } from '@chakra-ui/react'
import Head from 'next/head'
import Editor from '../../../components/editor'
import PageHeaderComponent from '../../../components/PageHeaderComponent'
import { client as prismaClient } from '../../../lib/prisma'

const Edit = ({ member, isMember }) => {
  const links = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Member',
      href: `/profile/${member.id}?isProfile=${member.cardNo ? true : false}`,
    },
    {
      name: 'Edit Info',
      href: '#',
      isLastChild: true,
      isCurrentPage: true,
    },
  ]

  return (
    <Box>
      <Head>
        <title>COC - {isMember === 'true' ? 'New Member' : 'Restore Member'}</title>
        <meta name="description" content="COC Attendance management system" />
        <link rel="icon" href="/coclogo.png" />
      </Head>
      <Box>
        <PageHeaderComponent title={isMember === 'true' ? 'Edit info' : 'Restore Member'} breadCrumb={links} />
        <Editor
          address={member.address}
          cardNo={member.cardNo || null}
          contactNo={member.contactNo}
          alternateContact={member.alternateContact}
          email={member.email}
          firstname={member.firstname}
          gender={member.gender}
          lastname={member.lastname}
          maritalStatus={member.maritalStatus}
          middlename={member.middlename}
          occupation={member.occupation}
          placeOfBirth={member.placeOfBirth}
          status={member.status}
          zone={member.zone.name || null}
          dateOfBaptism={member.dateOfBaptism}
          dateOfMembership={member.dateOfMembership}
          spouse={member.spouse}
          isEditing={isMember === 'true'}
          id={member.id}
          avatarUrl={member.avatarUrl}
          nextOfKin={member.nextOfKin}
          kinContact={member.kinContact}
          businessAddress={member.businessAddress}
          isRestore={isMember === 'false'}
        />
      </Box>
    </Box>
  )
}

export async function getServerSideProps(context) {
  const { id, isMember } = context.query
  let res
  if (isMember === 'true') {
    res = await prismaClient.member.findUnique({
      where: {
        id,
      },
      include: {
        zone: true,
      },
    })
  } else {
    res = await prismaClient.disfellowship.findUnique({
      where: { id },
    })
  }
  const member = JSON.parse(JSON.stringify(res))
  return {
    props: {
      member,
      isMember,
    },
  }
}
export default Edit
