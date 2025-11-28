"use client";

import PlaidLink from "./PlaidLink";

interface AddBankLinkProps {
    user: User;
}

export default function AddBankLink({ user }: AddBankLinkProps) {
    return (
        <PlaidLink user={user} variant="default" />
    );
}
