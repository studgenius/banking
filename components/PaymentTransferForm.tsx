"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { getBank, getBankByAccountId } from "@/lib/actions/user.actions";
import { decryptId } from "@/lib/utils";

import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

// Zod schema
const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(0, "Transfer note is too short"), // optional note
    amount: z.string().min(1, "Amount is required"),
    senderBank: z.string().min(1, "Please select a valid bank account"),
    sharableId: z.string().min(8, "Please select a valid sharable Id"),
});

type FormValues = z.infer<typeof formSchema>;

// Field definitions
const fields: {
    name: keyof FormValues;
    label: string;
    placeholder?: string;
    description?: string;
    type?: "input" | "textarea" | "bank";
}[] = [
        {
            name: "senderBank",
            label: "Select Source Bank",
            description: "Select the bank account you want to transfer funds from",
            type: "bank",
        },
        {
            name: "name",
            label: "Transfer Note (Optional)",
            placeholder: "Write a short note here",
            description: "Provide any additional information or instructions",
            type: "textarea",
        },
        {
            name: "email",
            label: "Recipient's Email Address",
            placeholder: "ex: johndoe@gmail.com",
            type: "input",
        },
        {
            name: "sharableId",
            label: "Receiver's Plaid Sharable Id",
            placeholder: "Enter the public account number",
            type: "input",
        },
        {
            name: "amount",
            label: "Amount",
            placeholder: "ex: 5.00",
            type: "input",
        },
    ];

interface PaymentTransferFormProps {
    accounts: any[];
}

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            amount: "",
            senderBank: "",
            sharableId: "",
        },
    });

    const submit = async (data: FormValues) => {
        setIsLoading(true);

        try {
            const receiverAccountId = decryptId(data.sharableId);

            // Fetch banks concurrently
            const [receiverBank, senderBank] = await Promise.all([
                getBankByAccountId({ accountId: receiverAccountId }),
                getBank({ documentId: data.senderBank }),
            ]);

            const transfer = await createTransfer({
                sourceFundingSourceUrl: senderBank.fundingSourceUrl,
                destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
                amount: data.amount,
            });

            if (!transfer) return;

            const transaction = {
                name: data.name,
                amount: data.amount,
                senderId: senderBank.userId,
                senderBankId: senderBank.$id,
                receiverId: receiverBank.userId,
                receiverBankId: receiverBank.$id,
                email: data.email,
            };

            const newTransaction = await createTransaction(transaction);

            if (newTransaction) {
                form.reset();
                router.push("/");
            }
        } catch (error) {
            console.error("Submitting create transfer request failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
                {fields.map((field) => (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: controllerField }) => (
                            <FormItem className="border-t border-gray-200">
                                <div className="payment-transfer_form-item py-5">
                                    <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
                                        {field.label}
                                    </FormLabel>
                                    {field.description && (
                                        <FormDescription className="text-12 font-normal text-gray-600">
                                            {field.description}
                                        </FormDescription>
                                    )}
                                    <div className="flex w-full flex-col">
                                        <FormControl>
                                            {field.type === "textarea" ? (
                                                <Textarea
                                                    placeholder={field.placeholder}
                                                    className="input-class"
                                                    {...controllerField}
                                                />
                                            ) : field.type === "bank" ? (
                                                <BankDropdown
                                                    accounts={accounts}
                                                    setValue={form.setValue}
                                                    otherStyles="w-full!"
                                                />
                                            ) : (
                                                <Input
                                                    placeholder={field.placeholder}
                                                    className="input-class"
                                                    {...controllerField}
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage className="text-12 text-red-500" />
                                    </div>
                                </div>
                            </FormItem>
                        )}
                    />
                ))}

                <div className="payment-transfer_btn-box">
                    <Button type="submit" className="payment-transfer_btn">
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
                            </>
                        ) : (
                            "Transfer Funds"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PaymentTransferForm;
