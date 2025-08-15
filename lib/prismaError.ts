import { NextApiResponse } from 'next'
import { Prisma } from '../lib/prisma'

const prismaError = (e: unknown, res: NextApiResponse) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code as string) {
      case 'P1000':
      case 'P1001':
      case 'P1002':
      case 'P1010':
      case 'P1011':
        res.statusMessage = 'Connection or Network error'
        res.status(500).json({ error: 'Connection error', code: e.code })
        break
      case 'P2001':
        res.status(500).json({
          error: 'Record not found',
          code: e.code,
        })
        break
      case 'P2002':
        res.statusMessage = 'Name or card number already exist'
        res.status(422).json({ error: 'Record or unique field already exist', code: e.code })

        break
      case 'P2003':
      case 'P2004':
        res.statusMessage = 'Bad query'
        res.status(500).json({ error: 'Bad query', code: e.code })
        break
      case 'P2005':
      case 'P2006':
      case 'P2007':
        res.statusMessage = 'Invalid data type'
        res.status(500).json({ error: 'Invalid data type', code: e.code })
        break
      case 'P2011':
      case 'P2012':
      case 'P2013':
        res.statusMessage = 'A required field or value is missing'
        res.status(500).json({ error: 'A required field or value is missing', code: e.code })
        break
      case 'P2014':
      case 'P2015':
      case 'P2016':
      case 'P2017':
      case 'P2018':
      case 'P2025':
        res.statusMessage = 'Bad query params'
        res.status(500).json({ error: 'Bad query params', code: e.code })
        break
      case 'P2021':
      case 'P2022':
      case 'P2023':
        res.statusMessage = 'Record does not exist'
        res.status(500).json({ error: 'Record does not exist', code: e.code })
        break
      default:
        res.statusMessage = 'A required field or value is missing'
        res.status(500).json({ error: 'Unknown query error', code: e.code })
        break
    }
  } else if (e instanceof Prisma.PrismaClientValidationError) {
    res.statusMessage = 'Missing or incorrect field type'
    res.status(400).json({ error: 'Missing or incorrect field type', code: e.message })
  } else {
    res.statusMessage = 'Something went wrong, pls check your network'
    res.status(500).json({ error: 'Something went wrong, please check your network', code: e })
  }
}

export default prismaError
