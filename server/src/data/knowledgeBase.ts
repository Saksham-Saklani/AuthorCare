import type { TicketCategory } from "../generated/prisma/client.js";

export const knowledgeBase: Record<TicketCategory, string> = {
  ROYALTY_PAYMENTS: `
    ROYALTY AND PAYMENTS

    Royalty Calculation:
    Authors receive 80% of net profit, while BookLeaf retains 20%.
    Net profit is calculated by subtracting printing costs, platform
    commissions (such as Amazon and Flipkart), and shipping costs
    from the book's Maximum Retail Price (MRP).

    Payout Schedule:
    Royalties are calculated quarterly. Payments are made within
    45 days after the end of the relevant quarter.

    Minimum Payout Threshold:
    The minimum payout amount is ₹1,000. Amounts below this threshold
    roll over to the next payout cycle.

    Payment Method:
    Royalties are transferred to the author's linked bank account.

    Royalty Breakdown:
    Authors can check the detailed platform-wise royalty breakdown
    in their BookLeaf dashboard.

    Support Guidance:
    If a payment appears overdue, verify the relevant quarter and
    payout timeline. If it is genuinely overdue, escalate the issue
    and communicate a 48-hour resolution timeline.

    If an author disputes the amount, explain the net-profit
    calculation and offer a detailed, line-by-line breakdown.
  `,

  ISBN_METADATA_ISSUES: `
    ISBN AND BOOK METADATA

    ISBN Assignment:
    BookLeaf provides a unique ISBN for the author's book.
    The ISBN is registered under the BookLeaf imprint.

    Independent Imprint:
    Authors who want to publish under their own imprint must
    obtain their ISBN independently.

    Incorrect ISBN:
    Duplicate or incorrect ISBNs are high-priority issues.
    Escalate them to the production team immediately.

    Support Guidance:
    Acknowledge the issue, confirm the reported discrepancy,
    and communicate a 48-hour escalation timeline for ISBN errors.
  `,

  PRINTING_QUALITY: `
    PRINTING AND QUALITY

    Printing Timeline:
    Printing generally takes 5–7 business days after order confirmation.

    Printing Defects:
    Verified defects, including misprints, binding problems,
    and colour issues, qualify for a free reprint.

    Verification:
    Support may request photographs of the affected copies
    to verify the reported defect.

    Support Guidance:
    Acknowledge the inconvenience and apologise for verified
    printing defects. Explain the verification process and
    the next steps for arranging a free reprint.

    Do not promise a reprint before the reported defect
    has been verified.
  `,

  DISTRIBUTION_AVAILABILITY: `
    DISTRIBUTION AND AVAILABILITY

    Distribution Channels:
    BookLeaf lists books on Amazon India, Flipkart, Amazon US,
    Amazon UK, and the BookLeaf Store.

    New Listings:
    New listings generally appear within 7–10 business days
    after publication is complete.

    Availability Problems:
    A book that is missing from an online store may have
    a stock-synchronisation issue.

    Stock Synchronisation:
    BookLeaf can trigger a stock resynchronisation.
    The expected resolution time is 24–48 hours.

    Support Guidance:
    Establish whether the book has completed publication
    and whether the reported listing is expected to be live.
    Where appropriate, confirm that resynchronisation has
    been triggered and communicate the 24–48-hour timeline.
  `,

  BOOK_STATUS_PRODUCTION: `
    BOOK STATUS AND PRODUCTION

    Publishing Stages:
    1. Manuscript Received
    2. Editing (if opted for)
    3. Cover Design
    4. Typesetting
    5. Proofreading
    6. ISBN Assignment
    7. Printing
    8. Distribution Setup
    9. Published & Live

    Author Updates:
    Authors receive production updates by email.

    Common Delay Points:
    Cover design may be delayed while awaiting author approval.
    Proofreading may take longer when revisions are required.

    Support Guidance:
    Check the book's actual production status before responding.
    Explain the current stage and provide a specific timeline
    when reliable information is available.

    Be transparent about delays. Do not blame the author or
    invent a production status or completion date.
  `,

  GENERAL_INQUIRY: `
    GENERAL SUPPORT

    Company Overview:
    BookLeaf operates in India and the United States.
    It offers Standard Free and Bestseller Breakthrough packages
    and provides services related to book design, typesetting,
    ISBN assignment, printing, distribution, and royalties.

    Printing Facilities:
    BookLeaf has a Delhi facility and works with printing
    partners including Repro India and Epitome Books.

    Book Description Updates:
    Updates to a book's Amazon description generally reflect
    within 3–5 business days. Authors can check their dashboard
    or email for updates.

    Production Overview:
    The standard production stages run from manuscript receipt
    through editing (if opted for), cover design, typesetting,
    proofreading, ISBN assignment, printing, distribution setup,
    and publication.

    Support Guidance:
    Identify the author's actual question and provide a response
    supported by the available BookLeaf policies.

    If the question requires information that is not available,
    do not invent an answer. Explain what needs to be checked
    and identify the appropriate next step.
  `,
};