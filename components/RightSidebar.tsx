import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import BankCard from './BankCard'
import { countTransactionCategories } from '@/lib/utils'
import { Category } from './Category'
import AddBankLink from './AddBankLink'

// Props typing
declare interface RightSidebarProps {
    user: User
    transactions: Transaction[]
    banks: Account[]
}

const RightSidebar: React.FC<RightSidebarProps> = ({ user, transactions, banks }) => {
    const categories: CategoryCount[] = countTransactionCategories(transactions)



    return (
        <aside className="right-sidebar flex flex-col h-full">
            {/* Profile Section */}
            <section className="flex flex-col pb-8">
                <div className="profile-banner" />
                <div className="profile flex items-center gap-4 mt-4">
                    <div className="profile-img flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                        <span className="text-5xl font-bold text-blue-500">{user.firstName[0]}</span>
                    </div>

                    <div className="profile-details">
                        <h1 className="profile-name font-semibold text-lg">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="profile-email text-gray-500 text-sm">{user.email}</p>
                    </div>
                </div>
            </section>

            {/* Banks Section */}
            <section className="banks flex flex-col gap-6 flex-1">
                {/* Header */}
                <div className="flex w-full justify-between items-center">
                    <h2 className="header-2 text-lg font-semibold">My Banks</h2>
                    <AddBankLink user={user} />
                </div>

                {/* Stacked Cards */}
                {banks.length > 0 && (
                    <div
                        className="relative w-full flex flex-col items-center justify-start"
                        style={{ minHeight: `${banks.length * 60 + 120}px` }} // Reserve space for absolute cards
                    >
                        {banks.map((bank, index) => {
                            const offset = index * 40
                            return (
                                <div
                                    key={bank.appwriteItemId} // unique key
                                    className="absolute w-[90%] transition-all duration-300"
                                    style={{
                                        top: `${offset}px`,
                                        right: `${offset / 2}px`,
                                        transform: `scale(${1 - index * 0.05})`,
                                        opacity: 1 - index * 0.1,
                                        zIndex: banks.length - index,
                                    }}
                                >
                                    <BankCard
                                        account={bank} // ✅ fully typed Account
                                        userName={`${user.firstName} ${user.lastName}`}
                                        showBalance={false}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Top Categories at bottom */}
                <div className="mt-auto flex flex-col gap-6">
                    <h2 className="header-2 text-lg font-semibold">Top categories</h2>
                    <div className="space-y-5">
                        {categories.map((category) => (
                            <Category key={category.name} category={category} /> // ✅ unique key
                        ))}
                    </div>
                </div>
            </section>
        </aside>
    )
}

export default RightSidebar
