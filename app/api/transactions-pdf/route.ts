import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts, getAccount } from "@/lib/actions/bank.actions";

// --------------------
// Helper functions
// --------------------

// Format transaction name: remove special characters
function formatTransactionName(name: string) {
  return name.replace(/[^a-zA-Z0-9 ]/g, "");
}

// Format category: remove underscores, capitalize each word
function formatCategory(category: string | undefined) {
  if (!category) return "N/A";
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Format amount to 2 decimal places with $ sign
function formatAmount(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Format date to readable format (e.g., Nov 27, 2025)
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// --------------------
// GET function
// --------------------
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getLoggedInUser();
    const accountsRes = await getAccounts({ userId: user.$id });

    const allAccounts = await Promise.all(
      accountsRes.data.map(async (acc: Account) => {
        const details = await getAccount({ appwriteItemId: acc.appwriteItemId });
        return details as Account & { transactions: Transaction[] };
      })
    );

    const downloadDate = formatDate(new Date().toISOString());
    const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";

    const html = `
      <html>
        <head>
          <style>
            @page { margin: 40px; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .report-header { margin-bottom: 20px; }
            .report-header h1 { margin: 0; font-size: 18px; }
            .report-header p { margin: 2px 0; font-size: 14px; }
            h2 { font-size: 16px; color: #1E40AF; margin-top: 0; }
            .account-summary {
              background-color: #3B82F6;
              color: white;
              padding: 16px 20px;
              border-radius: 8px;
              margin-bottom: 12px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }
            .account-summary h2 { margin: 0 0 6px 0; font-size: 16px; }
            .account-summary p { margin: 2px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; page-break-inside: auto; }  /* allow table to break across pages */
            thead { display: table-header-group; } /* repeat header on each page */
            tbody {display: table-row-group;}
            tr {page-break-inside: avoid; } /* prevent rows from splitting */
            th, td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
            th { background: #3B82F6; color: white; text-align: left; }
            tr:nth-child(even) { background: #f8f8f8; }
            .account-section + .account-section { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Bank Statement</h1>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Downloaded on:</strong> ${downloadDate}</p>
          </div>

          ${allAccounts
        .map(
          (acc) => `
              <div class="account-section">
                <div class="account-summary">
                  <h2>${acc.data.name}</h2>
                  <p><strong>Official Name:</strong> ${acc.data.officialName}</p>
                  <p><strong>Mask:</strong> ${acc.data.mask}</p>
                  <p><strong>Balance:</strong> ${formatAmount(Number(acc.data.currentBalance))}</p>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Channel</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${acc.transactions
              .map(
                (tx: Transaction) => `
                          <tr>
                            <td>${formatTransactionName(tx.name)}</td>
                            <td>${formatAmount(Number(tx.amount))}</td>
                            <td>${tx.pending ? "Pending" : "Completed"}</td>
                            <td>${formatDate(tx.date)}</td>
                            <td>${tx.paymentChannel || tx.channel || "N/A"}</td>
                            <td>${formatCategory(tx.category)}</td>
                          </tr>
                        `
              )
              .join("")}
                  </tbody>
                </table>
              </div>
            `
        )
        .join("")}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "40px", bottom: "40px" },
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdf);
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Bank-Statement.pdf",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
