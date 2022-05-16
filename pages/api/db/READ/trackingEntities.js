import { prisma } from '../../../../db'

export default async function handler(req,res)  {

    const trackingEntities = await prisma.adAccount.findMany()
    res.status(200).json(trackingEntities)
}