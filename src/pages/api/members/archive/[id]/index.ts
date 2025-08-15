import { validateRoute } from '../../../../../../lib/auth'
import { client } from '../../../../../../lib/prisma'
import prismaError from '../../../../../../lib/prismaError'

export default validateRoute(async (req, res) => {
  if (req.method === 'POST') {
    const { id } = req.query
    const { disfellowshipDate, reason } = req.body

    const member = await client.member.findUnique({
      where: {
        id: id as string,
      },
    })

    if (!member) {
      return res.status(401).json({ message: 'Member not found' })
    }

    const disfellowshipMember = client.disfellowship.create({
      data: {
        firstname: member.firstname,
        middlename: member.middlename,
        lastname: member.lastname,
        address: member.address,
        contactNo: member.contactNo,
        alternateContact: member.alternateContact,
        membershipId: member.id,
        disfellowshipDate,
        maritalStatus: member.maritalStatus,
        reason,
        avatarUrl: member.avatarUrl,
        spouse: member.spouse,
        gender: member.gender,
        occupation: member.occupation,
        placeOfBirth: member.placeOfBirth,
        dateOfBaptism: member.dateOfBaptism,
        dateOfMembership: member.dateOfMembership,
        dateOfBirth: member.dateOfBirth,
        zone: (await client.zone.findUnique({ where: { id: member.zoneId } })).name,
      },
    })

    const deleteMember = client.member.delete({
      where: { id: id as string },
    })

    try {
      const transaction = await client.$transaction([deleteMember, disfellowshipMember])
      return res.status(200).json({ message: `${member.firstname} ${member.lastname} has been archived successfully`, transaction })
    } catch (e) {
      console.log(e)
      return prismaError(e, res)
    }
  } else if (req.method === 'GET') {
    try {
      const { id } = req.query
      const member = await client.disfellowship.findUnique({
        where: { id },
      })

      if (!member) {
        return res.status(404).json({ error: 'Member does not exist' })
      }

      return res.status(200).json(member)
    } catch (e) {
      console.log(e)
    }
  } else if(req.method === 'DELETE') {
    
  }
})
