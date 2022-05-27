import useSWR from 'swr'
import { useState } from 'react'
import Select from 'react-select'
import { DateRangePicker, defaultStaticRanges } from 'react-date-range'
import LoadingSpinner from '../layout/components/LoadingSpinner'
import { DateTime} from 'luxon'
import axios from 'axios'
import IconGenerator from '../layout/generator/iconGenerator'
import NoShopsConnected from '../layout/components/NoShopsConnected'

const GET = (...args) => axios.get(...args).then(res => res.data)
const POST = (...args) => axios.post(...args).then(res => res.data)

export default function Home() {
    const [site, setSite] = useState(0)
    const [dateRange, setDateRange] = useState({
        startDate : new Date(),
        endDate   : new Date(),
        key       : 'selection'
    })

    //Data Calls
    const { data : adAccounts } = useSWR('/api/db/READ/connectedShops', GET)
    const validAccountsFound = adAccounts && adAccounts?.length > 0

    const { data : shopifyData } = useSWR(validAccountsFound ? [
        `/api/Shopify/getAverageSessionLength`, {
            since    : DateTime.fromJSDate(dateRange.startDate).toFormat('yyyy-MM-dd'),
            until    : DateTime.fromJSDate(dateRange.endDate).toFormat('yyyy-MM-dd'),
            shopName : adAccounts[site].shop.name
        }
    ] : null, POST)

    if (!adAccounts) return <LoadingSpinner/>
    if (adAccounts.length === 0) return <NoShopsConnected/>

    const siteOptions = adAccounts.map((adAccount, i) => Object.create({ i, label : adAccount.shop.name }))

    if (!shopifyData) return <LoadingSpinner/>

    return ( <div className="card bg-base-100">
        <div className="p-4 md:grid md:grid-cols-2 gap-8 justify-end">
            <div>
                <Select isSearchable={false}
                        defaultValue={siteOptions[0]}
                        options={siteOptions}
                        onChange={(site) => setSite(site.i)}/>
            </div>
            <div className="mt-8 md:mt-0 text-center md:text-left">
                <DateRangePicker className="md:flex md:justify-end"
                                 rangeColors={['#759EF5']}
                                 color={'#759EF5'}
                                 ranges={[dateRange]}
                                 onChange={({ selection }) => setDateRange(selection)}
                                 staticRanges={defaultStaticRanges}/>
            </div>
        </div>
        <div className="p-4">
            <SessionOverview shopifyData={shopifyData}/>
        </div>
    </div> )
}

const orderRow = (order) => {
    const { name, processedAt, customerJourney } = order.node
    return ( <>
        <tr key={name} className="active">
            <td>{name}</td>
            <td>{DateTime.fromISO(processedAt).toFormat('dd.LL.yy')}</td>
            <td>Sessions: {customerJourney?.moments.length}</td>
            <td>Days to Conversion: {customerJourney?.daysToConversion}</td>
        </tr>

        {customerJourney?.moments.map((session, index) => sessionRow(session, index, processedAt))}
    </>
    )
}

const SessionOverview = ({ shopifyData }) => {
    //ToDo: Should be outside of this component
    const orderList = shopifyData.orders.map(orderRow)
    return (
    <div className="p-4">
        <div className="alert alert-info shadow-lg">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     className="stroke-current flex-shrink-0 w-6 h-6">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>Average Session Length: {shopifyData.averageMomentCount?.toFixed(2)} sessions</div>
                <div>Average Days to Conversion: {shopifyData.averageDaysToConversion?.toFixed(2)} days</div>            </div>
        </div>

        <table className="table table-fixed w-full p-8 mt-8">
            {orderList}
        </table>
        <pre>{JSON.stringify(shopifyData, null, 2)}</pre>
    </div>
    )
}

const sessionRow = (session, index, processedAt) => {
    if (session.source === 'an unknown source' && session.utmParameters.source === 'meta_id') {
        session.source = 'facebook'
    }

    //ToDo: Icons for placements
    return (
    <tr key={index} className="bg-white">
        <td className="pr-6">Session {index + 1}</td>
        <td>{DateTime.fromISO(session.occurredAt).toRelative({
            base: DateTime.fromISO(processedAt)
        }).replace('ago', 'before')}</td>
        <td>{IconGenerator(session.source)}</td>
        <td></td>
    </tr>
    )
}







