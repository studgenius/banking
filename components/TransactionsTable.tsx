import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { transactionCategoryStyles } from "@/constants"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils"

const CategoryBadge = ({ category }: CategoryBadgeProps) => {

    const {
        borderColor,
        backgroundColor,
        textColor,
        chipBackgroundColor,
    } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default

    return (
        <div className={cn('category-badge', borderColor, chipBackgroundColor)} >
            <div className={cn('size-2 rounded-full', backgroundColor)} />
            <p className={cn('text-12 font-medium', textColor)}>{category}</p>
        </div>
    )
}

const TransactionsTable = ({ transactions }: TransactionTableProps) => {

    return (
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2">Transaction</TableHead>
                    <TableHead className="px-2">Amount</TableHead>
                    <TableHead className="px-2">Status</TableHead>
                    <TableHead className="px-2">Date</TableHead>
                    <TableHead className="px-2 max-md:hidden">Channel</TableHead>
                    <TableHead className="px-2 max-md:hidden">Category</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((t: Transaction) => {

                    { console.log("TRANSACTION:", t) }
                    { console.log("NAME:", t.name) }
                    const status = getTransactionStatus(new Date(t.date))
                    const amount = formatAmount(t.amount)

                    const isDebit = t.type === 'debit';
                    const isCredit = t.type === 'credit';

                    return (
                        <TableRow key={t.id} className={`${isDebit || amount[0] === '-' ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]'} over:bg-none! border-b-DEFAULT!`}>
                            <TableCell className="max-w-[250px] pl-2 pr-10">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-14 truncate font-semibold text-black-2">
                                        {removeSpecialCharacters(t.name)}
                                    </h1>
                                </div>
                            </TableCell>

                            <TableCell className={`pl-2 pr-10 font-semibold 
                                ${isDebit || amount[0] === '-' ?
                                    'text-[#F04438]'
                                    : 'text-[#039855]'
                                }`}>
                                {isDebit ? `-${amount}` : isCredit ? amount : amount}
                            </TableCell>

                            <TableCell className="pr-2 pl-5">
                                <CategoryBadge category={status} />
                            </TableCell>

                            <TableCell className="min-w-30 pr-2 pl-5">
                                {formatDateTime(new Date(t.date)).dateTime}
                            </TableCell>

                            <TableCell className="pr-2 pl-5 capitalize min-w-2/12">
                                {t.paymentChannel}
                            </TableCell>

                            <TableCell className="pr-2 pl-5 max-md:hidden">
                                <CategoryBadge category={t.category} />
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default TransactionsTable