'use server';

import { createSessionClient, createAdminClient } from "../appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export async function setSessionCookie(sessionSecret: string) {
    const cookieStore = await cookies();
    cookieStore.set("my-custom-session", sessionSecret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
    });
}

export const signIn = async () => {
    try {
        // Mutation / Database / Make a Fetch
    } catch (error) {
        console.error('Error', error);
    }
}

export const signUp = async (userData: SignUpParams) => {

    const { email, password, firstName, lastName } = userData;

    try {
        // Mutation / Database / Make a Fetch
        // Create a user account using AppWrite
        const { account } = await createAdminClient();

        const newUserAccount = await account.create({
            userId: ID.unique(),
            email: email,
            password: password,
            name: `${firstName} ${lastName}`,
        });


        const session = await account.createEmailPasswordSession({
            email,
            password
        });

        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error('Error', error);
    }
}

// ... your initilization functions
export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        return await account.get();
    } catch (error) {
        return null;
    }
}


