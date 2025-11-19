import HeaderBox from '@/components/HeaderBox'
import TransactionsTable from '@/components/TransactionsTable';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { formatAmount } from '@/lib/utils';
import React from 'react'

const TransactionHistory = async ({ searchParams: { id, page } }: SearchParamProps) => {

    const currentPage = Number(page as string) || 1;
    const loggedIn = await getLoggedInUser();
    if (!loggedIn) {
        // OR Option 2 — return fallback UI
        return <div>You must be logged in to view this page.</div>;
    }

    const accounts = await getAccounts({ userId: loggedIn.$id })
    if (!accounts) return;

    // Must match PLAID’s appwriteItemId EXACTLY
    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    if (!accounts) {
        return <div>No account found.</div>;
    }

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
                {/* ACCOUNT HEADER */}
                <div className="transactions-account">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-18 font-bold text-white">{account?.data.name}</h2>
                        <p className="text-14 text-blue-25">
                            {account?.data.officialName}
                        </p>
                        <p className="text-14 font-semibold tracking-[1.6px] text-white">
                            ●●●● ●●●● ●●●● {account?.data.mask}
                        </p>
                    </div>

                    <div className="transactions-account-balance">
                        <p className="text-14 text-white">Current Balance</p>
                        <p className="text-24 text-center tracking-[1.1px] font-bold text-white">
                            {formatAmount(account?.data.currentBalance)}
                        </p>
                    </div>
                </div>

                <section className="flex w-full flex-col gap-6">
                    <TransactionsTable transactions={account?.transactions} />
                </section>
            </div>
        </div>
    )
}

export default TransactionHistory