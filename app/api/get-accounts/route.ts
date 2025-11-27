import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { getBanks } from "@/lib/actions/user.actions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Get all bank connections for user
        const banks = await getBanks({ userId });

        const accounts = await Promise.all(
            banks.map(async (bank: Bank) => {
                const accountsResponse = await plaidClient.accountsGet({
                    access_token: bank.accessToken,
                });

                const acc = accountsResponse.data.accounts[0];

                return {
                    id: acc.account_id,
                    name: acc.name,
                    currentBalance: acc.balances.current!,
                    availableBalance: acc.balances.available!,
                    institutionId: accountsResponse.data.item.institution_id!,
                    mask: acc.mask!,
                    type: acc.type,
                    subtype: acc.subtype,
                    appwriteItemId: bank.$id,
                    sharableId: bank.sharableId,
                };
            })
        );

        const totalBanks = accounts.length;
        const totalCurrentBalance = accounts.reduce(
            (sum, acc) => sum + acc.currentBalance,
            0
        );

        return NextResponse.json({
            data: accounts,
            totalBanks,
            totalCurrentBalance,
        });
    } catch (error) {
        console.error("API Error loading accounts:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
