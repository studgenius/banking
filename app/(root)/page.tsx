import HeaderBox from "@/components/HeaderBox"
import RightSidebar from "@/components/RightSidebar"
import TotalBalanceBox from "@/components/TotalBalanceBox"
import { getAccount, getAccounts } from "@/lib/actions/bank.actions"
import { getLoggedInUser } from "@/lib/actions/user.actions"

const Home = async ({ searchParams }: SearchParamProps) => {
    const params = await searchParams;
    const id = params?.id;
    const page = params?.page;

    const loggedIn = await getLoggedInUser();

    const accounts = await getAccounts({ userId: loggedIn.$id })
    if (!accounts) return;

    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    const account = await getAccount({ appwriteItemId })

    console.log({
        accountsData,
        account
    })

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

                RECENT TRANSACTIONS
            </div>

            <RightSidebar
                user={loggedIn}
                transactions={accounts?.transactions}
                banks={accountsData?.slice(0, 2)}
            />
        </section>
    )
}

export default Home