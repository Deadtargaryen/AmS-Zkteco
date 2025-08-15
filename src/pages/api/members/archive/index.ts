import { validateRoute } from '../../../../../lib/auth'
import { client } from '../../../../../lib/prisma'

export default validateRoute(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const disfellowshipList = await client.disfellowship.findMany()
      return res.status(200).json(disfellowshipList)
    } catch (e) {
      console.log(e)
    }
  }
})
