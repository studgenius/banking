import Link from 'next/link'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankTabItem } from './BankTabItem'
import BankInfo from './BankInfo'
import TransactionsTable from './TransactionsTable'

const RecentTransactions = ({
    accounts,
    transactions = [],
    activeAccountId,
}: RecentTransactionsProps) => {

    // Default to first account if none selected
    const currentAccountId = activeAccountId || accounts[0]?.id;

    return (
        <section className="recent-transactions">
            <header className="flex items-center justify-between">
                <h2 className="recent-transactions-label">
                    Recent Transactions
                </h2>
                <Link href={`/transaction-history/?id=${currentAccountId}`} className='view-all-btn'>
                    View All
                </Link>
            </header>

            <Tabs defaultValue={currentAccountId} className="w-full">
                <TabsList className="recent-transactions-tablist">
                    {accounts.map((account: Account) => (
                        <TabsTrigger key={account.id} value={account.id}>
                            <BankTabItem account={account} />
                        </TabsTrigger>
                    ))}
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                {accounts.map((account: Account) => (
                    <TabsContent
                        value={account.id}
                        key={account.id}
                        className="space-y-4"
                    >

                        <BankInfo
                            account={account}
                            appwriteItemId={account.id}
                            type="full"
                        />

                        <TransactionsTable
                            transactions={transactions.filter(
                                t => t.accountId === account.id
                            )}
                        />
                    </TabsContent>
                ))}
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
        </section>
    )
}

export default RecentTransactions