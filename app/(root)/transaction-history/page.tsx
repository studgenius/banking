import HeaderBox from '@/components/HeaderBox'
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
    const { id, page } = await searchParams;

    const currentPage = Number(page as string) || 1;
    const loggedIn = await getLoggedInUser();

    const accounts = await getAccounts({ userId: loggedIn.$id })
    if (!accounts) return;

    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    const account = await getAccount({ appwriteItemId })

    return (
        <div className="transactions">
            <div className="transactions-header">
                <HeaderBox
                    title="Transaction History"
                    subtext="See your bank details and transactions."
                />
            </div>
            <div className="space-y-6">
                <div className="transactions-account">
                    <div className="flex flex-col gap-2">
                        <h2>{account?.data.name}</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionHistory