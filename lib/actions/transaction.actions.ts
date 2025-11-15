
"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (transaction: CreateTransactionProps) => {
    try {
        const { database } = await createAdminClient();

        const newTransaction = await database.createDocument({
            databaseId: DATABASE_ID!,
            collectionId: TRANSACTION_COLLECTION_ID!,
            documentId: ID.unique(),
            data: {
                channel: 'online',
                category: 'Transfer',
                ...transaction
            },
        });

        return parseStringify(newTransaction);
    } catch (error) {
        console.log(error);
    }
}

export const getTransactionsByBankId = async ({ bankId }: getTransactionsByBankIdProps) => {
    try {
        const { database } = await createAdminClient();

        const senderTransactions = await database.listDocuments({
            databaseId: DATABASE_ID!,
            collectionId: TRANSACTION_COLLECTION_ID!,
            queries:
                [
                    Query.equal('senderBankId', bankId)
                ],
        });

        const receiverTransactions = await database.listDocuments({
            databaseId: DATABASE_ID!,
            collectionId: TRANSACTION_COLLECTION_ID!,
            queries:
                [
                    Query.equal('receiverBankId', bankId)
                ],
        });

        const transactions = {
            total: senderTransactions.total + receiverTransactions.total,
            documents: [
                ...senderTransactions.documents,
                ...receiverTransactions.documents,
            ]
        }

        return parseStringify(transactions);
    } catch (error) {
        console.log(error);
    }
}
