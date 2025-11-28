import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getAccounts, getAccount } from '@/lib/actions/bank.actions';
import { formatAmount } from '@/lib/utils';
import TransactionsTable from '@/components/TransactionsTable';

const TransactionHistory = async () => {

    const loggedIn = await getLoggedInUser();
    const accounts = await getAccounts({ userId: loggedIn.$id });

    if (!accounts) return null;

    const accountsData = accounts.data;

    // Fetch full details for each account
    const allAccounts = await Promise.all(
        accountsData.map(async (acc: Account) => {
            const details = await getAccount({ appwriteItemId: acc.appwriteItemId });
            return details;
        })
    );

    return (
        <div className="transactions">
            <div className="transactions-header">
                <section className="flex items-center justify-right gap-165">
                    <HeaderBox
                        title="Transaction History"
                        subtext="See all your accounts and transactions."
                    />
                    <a
                        href="/api/transactions-pdf"
                        target="_blank"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Download PDF
                    </a>
                </section>
            </div>

            <div className="space-y-10">
                {allAccounts.map((account, index) => (
                    <div key={index} className="space-y-6">
                        {/* Blue Bold Separator */}
                        {index > 0 && (
                            <div className="w-full border-t-2 border-blue-600 my-6"></div>
                        )}

                        {/* ACCOUNT HEADER */}
                        <div className="transactions-account">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-18 font-bold text-white">
                                    {account?.data.name}
                                </h2>
                                <p className="text-14 text-blue-25">
                                    {account?.data.officialName}
                                </p>
                                <p className="text-14 font-semibold tracking-[1.1px] text-white">
                                    ●●●● ●●●● ●●●● <span className="text-16">{account?.data.mask}</span>
                                </p>
                            </div>

                            <div className="transactions-account-balance">
                                <p className="text-14">Current Balance</p>
                                <p className="text-24 text-center font-bold">
                                    {formatAmount(account?.data.currentBalance)}
                                </p>
                            </div>
                        </div>

                        {/* FULL TRANSACTION TABLE */}
                        <TransactionsTable transactions={account?.transactions} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
