"use server";

import { revalidateTag } from "next/cache";

export async function refreshAccountsCache() {
    revalidateTag("accounts", "default");
}
