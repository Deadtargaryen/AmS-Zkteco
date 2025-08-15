import { validateRoute } from '../../../../../../lib/auth'
import { client } from '../../../../../../lib/prisma'
import prismaError from '../../../../../../lib/prismaError'

const validatePhoneNumber = input => {
  // Define a regular expression pattern for a valid phone number.
  // This pattern allows for 10 or more digits and may include spaces, hyphens, or parentheses.
  const phoneNumberPattern = /^\+?[0-9\s\-()]+$/

  // Remove any spaces, hyphens, or parentheses from the input
  const cleanedInput = input.replace(/[\s\-()]/g, '')

  // Check if the cleaned input matches the phone number pattern
  return phoneNumberPattern.test(cleanedInput) && cleanedInput.length >= 10
}

export default validateRoute(async (req, res) => {
  if (req.method === 'POST') {
    const { id } = req.query
    const {
      firstname,
      middlename,
      lastname,
      cardNo,
      address,
      contactNo,
      email,
      avatarUrl,
      dateOfBaptism,
      dateOfMembership,
      status,
      gender,
      placeOfBirth,
      occupation,
      maritalStatus,
      spouse,
      zone,
      alternateContact,
    } = req.body
    try {
      if (!validatePhoneNumber(contactNo)) {
        return res.status(400).json({ error: 'Please enter a valid phone number' })
      }

      if (alternateContact && !validatePhoneNumber(alternateContact)) {
        return res.status(400).json({ error: 'Please enter a valid alternate number' })
      }

      if (!cardNo) {
        return res.status(400).json({ error: 'No card number assigned.' })
      }

      if (!zone) {
        return res.status(400).json({ error: 'Please select member zone' })
      }

      const selectedZone = await client.zone.findUnique({
        where: { name: zone },
      })

      const member = await client.member.findUnique({
        where: {
          cardNo_zoneId: { cardNo: parseInt(cardNo), zoneId: selectedZone.id },
        },
      })

      if (member) {
        return res.status(400).json({ error: `Card number ${cardNo} already assigned in Zone ${zone}.` })
      }

      const createMember = client.member.create({
        data: {
          firstname: firstname !== '' ? firstname : null,
          middlename: middlename !== '' ? middlename : null,
          lastname: lastname !== '' ? lastname : null,
          cardNo: Number(cardNo),
          address: address !== '' ? address : null,
          contactNo,
          alternateContact: alternateContact !== '' ? alternateContact : null,
          email,
          avatarUrl,
          dateOfBaptism: dateOfBaptism !== null ? new Date(dateOfBaptism) : null,
          dateOfMembership: dateOfMembership !== null ? new Date(dateOfMembership) : null,
          status,
          gender,
          placeOfBirth,
          occupation: occupation !== '' ? occupation : null,
          maritalStatus,
          spouse,
          zone: {
            connectOrCreate: {
              where: {
                name: zone,
              },
              create: {
                name: zone,
              },
            },
          },
        },
      })

      const deleteFromArchive = client.disfellowship.delete({
        where: { id },
      })

      const transaction = await client.$transaction([createMember, deleteFromArchive])
      return res.status(200).json({ message: `${firstname} ${lastname} has been successfully restored`, transaction })
    } catch (error) {
      console.log(error)
      return prismaError(error, res)
    }
  }
})
