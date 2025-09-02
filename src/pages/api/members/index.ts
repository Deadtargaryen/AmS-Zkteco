import type { NextApiResponse, NextApiRequest } from 'next'
import { client } from '../../../../lib/prisma'
import prismaError from '../../../../lib/prismaError'
import { validateRoute } from '../../../../lib/auth'

const validatePhoneNumber = input => {
  // Define a regular expression pattern for a valid phone number.
  // This pattern allows for 10 or more digits and may include spaces, hyphens, or parentheses.
  const phoneNumberPattern = /^\+?[0-9\s\-()]+$/

  // Remove any spaces, hyphens, or parentheses from the input
  const cleanedInput = input.replace(/[\s\-()]/g, '')

  // Check if the cleaned input matches the phone number pattern
  return phoneNumberPattern.test(cleanedInput) && cleanedInput.length >= 10
}

export default validateRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const members = await client.member.findMany({
      select: {
        avatarUrl: false,
        zone: true,
        firstname: true,
        lastname: true,
        middlename: true,
        cardNo: true,
        address: true,
        gender: true,
        status: true,
        id: true,
      },
      orderBy: {
        cardNo: 'asc',
      },
    })
    return res.json(members)
  } else if (req.method === 'POST') {
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
      businessAddress,
      nextOfKin,
      kinContact,
    } = req.body
    try {
      if (!validatePhoneNumber(contactNo)) {
        return res.status(400).json({ error: 'Please enter a valid phone number' })
      }

      if (alternateContact && !validatePhoneNumber(alternateContact)) {
        return res.status(400).json({ error: 'Please enter a valid alternate number' })
      }

      if (kinContact && !validatePhoneNumber(kinContact)) {
        return res.status(400).json({ error: 'please enter a valid number for next of kin' })
      }

      if (!cardNo) {
        return res.status(400).json({ error: 'Please enter member card Number' })
      }

      if (!zone) {
        return res.status(400).json({ error: 'Please select member zone' })
      }

      const selectedZone = await client.zone.findUnique({
        where: { name: zone },
      })

      let member = null
      if (selectedZone) {
        member = await client.member.findFirst({
          where: {
            cardNo: parseInt(cardNo),
            zoneId: selectedZone.id,
          },
        })
      }

      if (member) {
        return res.status(400).json({ error: `Card number ${cardNo} already assigned in Zone ${zone}.` })
      }

      await client.member.create({
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
          businessAddress,
          nextOfKin,
          kinContact,
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
      return res.status(200).json({ message: 'Member added successfully' })
    } catch (error) {
      console.log(error)
      return prismaError(error, res)
    }
  }
})
