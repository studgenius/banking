import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/actions/bank.actions'
import { getLoggedInUser } from '@/lib/actions/user.actions'

const Transfer = async () => {
    const loggedIn = await getLoggedInUser();

    // If no user, handle gracefully
    if (!loggedIn) {
        return (
            <section className="payment-transfer">
                <HeaderBox
                    title="Payment Transfer"
                    subtext="You must be logged in to view this page."
                />
                <p className="text-center mt-4">Please log in to continue.</p>
            </section>
        );
    }
    const accounts = await getAccounts({
        userId: loggedIn.$id
    })

    if (!accounts) return;

    const accountsData = accounts?.data

    return (
        <section className="payment-transfer">
            <HeaderBox
                title="Payment Transfer"
                subtext="Please provide any specific details or notes related to the payment transfer."
            />

            <section className="sixe-full pt-5">
                <PaymentTransferForm accounts={accountsData} />
            </section>
        </section>
    )
}

export default Transfer