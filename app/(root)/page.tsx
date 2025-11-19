import HeaderBox from "@/components/HeaderBox"
import RecentTransactions from "@/components/RecentTransactions"
import RightSidebar from "@/components/RightSidebar"
import TotalBalanceBox from "@/components/TotalBalanceBox"
import { getAccount, getAccounts } from "@/lib/actions/bank.actions"
import { getLoggedInUser } from "@/lib/actions/user.actions"


const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {

    const currentPage = Number(page as string) || 1;
    const loggedIn = await getLoggedInUser();
    if (!loggedIn)
        // OR Option 2 — return fallback UI
        return <div>You must be logged in to view this page.</div>;


    const accounts = await getAccounts({ userId: loggedIn.$id })
    if (!accounts) return <div>No accounts found.</div>;

    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    const account = await getAccount({ appwriteItemId })

    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome, "
                        user={loggedIn?.firstName || 'Guest'}
                        subtext="Access and manage all your accounts and transactions right here."
                    />

                    <TotalBalanceBox
                        accounts={accountsData}
                        totalBanks={accounts?.totalBanks}
                        totalCurrentBalance={accounts?.totalCurrentBalance}
                    />
                </header>

                <RecentTransactions
                    accounts={accountsData}
                    transactions={account?.transactions}
                    appwriteItemId={appwriteItemId}
                    page={currentPage}
                />
            </div>

            <RightSidebar
                user={loggedIn}
                transactions={account?.transactions}
                banks={accountsData?.slice(0, 2)}
            />
        </section>
    )
}

export default Home