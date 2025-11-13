'use server';

import { createAdminClient, createSessionClient } from "../appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";
import { Session } from "node:inspector/promises";


export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const response = await account.createEmailPasswordSession({
            email,
            password,
        });

        //Store session in cookie
        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false, //to change to true (applying to https) in production false for development 
        });

        return parseStringify(response);
    } catch (error) {
        console.error('❌ Sign-in failed:', error);
        return null; // ❗ return something falsy but explicit
    }
}

export const signUp = async (userData: SignUpParams) => {
    const { email, password, firstName, lastName } = userData;

    try {
        // 1️⃣ Create the user (admin privileges)
        const { account } = await createAdminClient();

        const newUserAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name: `${firstName} ${lastName}`,
        });

        // 2️⃣ Create a session for the new user
        const session = await account.createEmailPasswordSession({
            email,
            password,
        });

        // 3️⃣ Store session cookie
        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error("Error", error);
        throw error;
    }
};

// ... your initilization functions
export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();

        (await cookies()).delete('appwrite-session');
        await account.deleteSession({ sessionId: 'current' });
    } catch (error) {
        return null;
    }
}