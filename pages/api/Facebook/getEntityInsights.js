import fbEntityByUtmSelect from '../../../utils/fbEntityByUtmSelect'
import { getSession } from 'next-auth/react'
import { prisma } from '../../../db'

const adsSdk = require('facebook-nodejs-business-sdk')
//ToDo: Token hast to come from user


//ToDo: Get Access Token from Session
export default async function handler(req, res) {

    if (req.method !== 'POST') res.status(405).send('Only POST method is allowed')

    const { type, since, until, adAccountId } = req.body
    const session = await getSession({ req })
    const fbAccount = await prisma.account.findFirst({
        where: {
            userId : session.user.id,
            provider: 'facebook'
        }
    })

    const api = adsSdk.FacebookAdsApi.init(fbAccount.access_token)


    const fbEntity = fbEntityByUtmSelect(type)

    const fields = [fbEntity + '_id', fbEntity + '_name', 'spend', 'inline_link_clicks', 'ctr']
    if (fbEntity === 'ad') fields.push('adset_name')
    const params = {
        time_range : { since, until },
        level      : fbEntity,
        limit      : 1000
    }

    const account = new adsSdk.AdAccount(( adAccountId ))
    const insights = await account.getInsights(fields, params)

    const serializesInsights = insights.map(async (item) => {
        item = item._data
        item.name = item[fbEntity + '_name']
        item.id = item[fbEntity + '_id']
        if (fbEntity === 'ad') {
            const ad = new adsSdk.Ad(item.ad_id)
            const creative = await ad.getAdCreatives(['thumbnail_url'])
            item.image = creative[0]._data.thumbnail_url
        }

        return item
    })

    const data = await Promise.all(serializesInsights).then(data => data.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {}))

    res.status(200).json(data)

}



