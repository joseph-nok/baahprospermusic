'use node'

import { internalAction } from './_generated/server'
import { Resend } from '@convex-dev/resend'
import { components } from './_generated/api'
import { v } from 'convex/values'

/**
 * Process a successful Paystack payment and send a premium HTML receipt to the business inbox.
 */
export const processSuccessfulOrder = internalAction({
  args: {
    amount: v.number(),
    currency: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    orderItems: v.string(),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Initialize the official Convex Resend component
    const resend = new Resend(components.resend, { testMode: false })

    // Escape dynamic HTML parameters for security
    const escapeHtml = (val: string) =>
      val
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')

    const formattedAmount = `${args.currency} ${args.amount.toFixed(2)}`
    const cleanCustomerName = escapeHtml(args.customerName)
    const cleanCustomerEmail = escapeHtml(args.customerEmail)
    const cleanTransactionId = escapeHtml(args.transactionId)
    const cleanOrderItems = escapeHtml(args.orderItems)

    // Construct a premium, modern, fully responsive HTML email template
    const emailHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Receipt</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #0b0f19;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #f3f4f6;
            }
            .wrapper {
              width: 100%;
              background-color: #0b0f19;
              padding: 40px 10px;
              box-sizing: border-box;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #111827;
              border: 1px solid #1f2937;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            }
            .header {
              background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 800;
              color: #ffffff;
              letter-spacing: -0.025em;
            }
            .header p {
              margin: 0;
              font-size: 15px;
              color: #e0e7ff;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .content {
              padding: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #ffffff;
              margin: 0 0 16px 0;
              border-left: 4px solid #6366f1;
              padding-left: 12px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .details-table td {
              padding: 12px 0;
              border-bottom: 1px solid #1f2937;
              font-size: 14px;
            }
            .details-table td.label {
              color: #9ca3af;
              font-weight: 500;
              width: 35%;
            }
            .details-table td.value {
              color: #f3f4f6;
              font-weight: 600;
              text-align: right;
            }
            .items-box {
              background-color: #1f2937;
              border: 1px solid #374151;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 10px;
              white-space: pre-wrap;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 14px;
              line-height: 1.6;
              color: #e5e7eb;
            }
            .footer {
              background-color: #0f172a;
              padding: 20px 30px;
              text-align: center;
              border-top: 1px solid #1f2937;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <p>Payment Successful</p>
                <h1>${formattedAmount}</h1>
              </div>
              <div class="content">
                <div class="section-title">Order Information</div>
                <table class="details-table">
                  <tr>
                    <td class="label">Customer Name</td>
                    <td class="value">${cleanCustomerName}</td>
                  </tr>
                  <tr>
                    <td class="label">Customer Email</td>
                    <td class="value">${cleanCustomerEmail}</td>
                  </tr>
                  <tr>
                    <td class="label">Transaction ID</td>
                    <td class="value" style="font-family: monospace; font-size: 13px;">${cleanTransactionId}</td>
                  </tr>
                  <tr>
                    <td class="label">Total Paid</td>
                    <td class="value" style="color: #34d399;">${formattedAmount}</td>
                  </tr>
                </table>

                <div class="section-title">Product Details</div>
                <div class="items-box">${cleanOrderItems}</div>
              </div>
              <div class="footer">
                This completed order digest was automatically dispatched via Resend.<br />
                &copy; ${new Date().getFullYear()} Bra Music Portal. All rights reserved.
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Fire the completed order digest directly using the official Resend component
    await resend.sendEmail(ctx, {
      from: 'onboarding@resend.dev',
      to: process.env.ORDER_NOTIFICATION_EMAIL || 'josephnok088@gmail.com',
      subject: `🔔 Order Receipt: ${formattedAmount} from ${args.customerName}`,
      html: emailHtml,
    })
  },
})
