# AuthorCare --- BookLeaf Author Support Portal

AuthorCare is a full-stack author support and communication portal for
Publishing Houses. Authors can view their books and royalty
information, raise support tickets, and communicate with the support
team. Administrators can manage tickets, respond to authors, and use
AI-assisted classification and reply drafting.

## Live Demo

-   **Frontend:** https://authorcare.onrender.com
-   **Backend API:** https://authorcare-server.onrender.com
-   **Source code:** https://github.com/Saksham-Saklani/AuthorCare

### Demo credentials

**Author portal** - Email: Use an author email from the pre-seeded
dataset. - Password: `Password123` - Email: `meera.nair@email.com`

**Admin portal** - Email: `sxkshm@gmail.com` - Password: `Admin123`

These credentials are intended for evaluating the demo. Do not reuse
these passwords for personal accounts.

## Features

### Author portal

-   Register and log in.
-   View personal books, book metadata, sales, and royalty information.
-   Create support tickets associated with a book or submit a general
    inquiry.
-   View tickets, their statuses, and conversation history.
-   Reply to support messages.
-   Receive real-time ticket status and admin-reply updates 

### Admin portal

-   View and filter tickets by status, category, priority, and date
    range.
-   Assign tickets to the current admin.
-   Update ticket status, category, and priority; manually override AI
    classifications.
-   Send public replies and add internal notes that are not visible to
    authors.
-   Generate AI reply drafts and edit them before sending.

### AI assistance

-   Classifies tickets by category and priority.
-   Generates editable reply drafts for administrators.
-   Uses relevant BookLeaf policy sections rather than including the
    entire knowledge base in every prompt.
-   Retrieves the five most recent ticket messages from the database to
    provide conversation context.
-   Falls back to default category and priority values if classification
    fails or the Gemini API is unavailable or rate-limited; ticket
    creation can still succeed.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  **Frontend:**                           React, Vite, TypeScript, Tailwind CSS

  **Backend:**                             Node.js, Express, TypeScript

  **Database:**                            PostgreSQL (Supabase in production)

  **ORM:**                                 Prisma 7

  **Authentication:**                      JWT using an Authorization header,
                                      with cookie-based authentication as
                                      a fallback

  **Validation:**                          Zod

  **Real-time communication:**             Socket.IO

  **AI/LLM:**                                  Google Gemini API `(gemini-flash-3.8)`

  Password hashing                    bcrypt

  **Hosting:**                             Render

-----
## Architecture Overview

The React/Vite frontend communicates with the Express REST API. The
backend validates incoming data, authenticates requests, applies
author/admin access controls, and uses Prisma to access PostgreSQL.

-   **Authentication and authorization:** JWT authentication supports
    the Authorization header and a cookie fallback. Protected routes
    require a valid identity; admin operations also require the `ADMIN`
    role.
-   **Author data isolation:** Authors can access only their own books
    and tickets. The backend derives the author identity from the
    authenticated user rather than trusting a client-supplied author ID.
-   **Ticket messages:** Public messages are visible to authors;
    internal notes are admin-only.
-   **Real-time events:** Socket.IO emits `ticket:updated` notifications
    for relevant ticket changes. The frontend uses these notifications
    to refresh ticket data.
-   **AI assistance:** Gemini is used for ticket classification and
    admin reply drafts. AI output is assistance for the support
    workflow; admins can review and edit replies before sending.

## Local Setup

### Prerequisites

-   Node.js and npm
-   A PostgreSQL database
-   A Google Gemini API key for AI features

### 1. Clone the repository

``` bash
git clone https://github.com/Saksham-Saklani/AuthorCare.git
cd AuthorCare
```

### 2. Configure the backend

``` bash
cd server
npm install
```

Create `server/.env`:

``` env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

Use your own local PostgreSQL connection string and secrets. Never
commit `.env` files or real API keys.

Apply the Prisma migrations:

``` bash
npx prisma migrate deploy
```

Seed the database using the seed command configured in the backend
project. If the repository's package scripts define `seed`, run:

``` bash
npm run seed
```

If the seed command differs in your checkout, use the script configured
by the project rather than assuming a command name.

Start the backend:

``` bash
npm run dev
```

The API should be available at `http://localhost:3000`.

### 3. Configure the frontend

Open a second terminal from the repository root:

``` bash
cd client
npm install
```

Create `client/.env`:

``` env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Start the frontend:

``` bash
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

> If your active frontend directory is named differently in your
> checkout, run these commands from that directory. The frontend
> environment variables must match the API and Socket.IO URLs for the
> environment being used.

## Database and Seed Data

The production database is pre-seeded with the provided dataset,
including author accounts, books, royalty/sales information, and
existing support tickets.

For local development, configure your own PostgreSQL database, apply the
Prisma migrations, and run the project's seed script. Use the demo
credentials above only if the local seed data includes the corresponding
accounts and passwords.

## API Reference

**Production base URL:** `https://authorcare-server.onrender.com`\
**Local base URL:** `http://localhost:3000`

The health endpoint is `GET /health`. API routes are prefixed with
`/api`.

### Authentication --- `/api/auth`

  Method   Endpoint               Purpose                       Access
  -------- ---------------------- ----------------------------- ---------------
  `POST`   `/api/auth/register`   Register an author            Public
  `POST`   `/api/auth/login`      Log in                        Public
  `POST`   `/api/auth/logout`     Log out / clear auth cookie   Public
  `GET`    `/api/auth/me`         Get current user profile      Authenticated

### Books --- `/api/books`

  ------------------------------------------------------------------------
  Method            Endpoint           Purpose           Access
  ----------------- ------------------ ----------------- -----------------
  `GET`             `/api/books`       List the          Author
                                       authenticated     
                                       author's books    
                                       and royalty       
                                       information       

  `GET`             `/api/books/:id`   Get book details  Authenticated;
                                                         author data
                                                         access is
                                                         restricted
  ------------------------------------------------------------------------

### Tickets --- `/api/tickets`

  -----------------------------------------------------------------------------------------
  Method            Endpoint                            Purpose           Access
  ----------------- ----------------------------------- ----------------- -----------------
  `POST`            `/api/tickets`                      Create a ticket   Author

  `GET`             `/api/tickets`                      List the author's Author
                                                        tickets           

  `GET`             `/api/tickets/:id`                  Get a ticket and  Author; own
                                                        its conversation  ticket only

  `POST`            `/api/tickets/:id/messages`         Add an author     Author; own
                                                        reply             ticket only

  `GET`             `/api/tickets/admin/all`            List/filter       Admin
                                                        tickets with      
                                                        pagination        

  `GET`             `/api/tickets/admin/:id`            Get ticket        Admin
                                                        details,          
                                                        including         
                                                        internal messages 

  `PATCH`           `/api/tickets/admin/:id`            Update ticket     Admin
                                                        status, priority, 
                                                        or category       

  `PATCH`           `/api/tickets/admin/:id/assign`     Assign ticket to  Admin
                                                        the current admin 

  `POST`            `/api/tickets/admin/:id/messages`   Send a public     Admin
                                                        reply or internal 
                                                        note              

  `POST`            `/api/tickets/admin/:id/ai-draft`   Generate an AI    Admin
                                                        reply draft       
  -----------------------------------------------------------------------------------------

The admin ticket list supports filters for `status`, `category`,
`priority`, `from`, `to`, `page`, and `limit`.

### Ticket enums

-   **Status:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
-   **Category:** `ROYALTY_PAYMENTS`, `ISBN_METADATA_ISSUES`,
    `PRINTING_QUALITY`, `DISTRIBUTION_AVAILABILITY`,
    `BOOK_STATUS_PRODUCTION`, `GENERAL_INQUIRY`
-   **Priority:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
-   **Message visibility:** `PUBLIC`, `INTERNAL`

### Authentication details

The API supports JWT authentication through the `Authorization` header,
with cookie-based authentication as a fallback. For browser requests
using cookies, the client must send credentials. Never include actual
tokens or secrets in shared requests or documentation.

### Response and errors

Responses use JSON with a `success` field and, where applicable, a
`message`, `data`, and pagination metadata. Common HTTP status codes
include:

  Status   Meaning
  -------- -------------------------------------
  `200`    Request succeeded
  `201`    Resource created
  `400`    Invalid request or validation error
  `401`    Missing or invalid authentication
  `403`    Authenticated but not permitted
  `404`    Resource not found
  `409`    Conflict, such as a duplicate email
  `500`    Internal server error

## AI Prompt Strategy

### Ticket classification

Gemini classifies a ticket into one of the supported categories and
assigns a priority. If the classification call fails or is rate-limited,
the ticket is still created with default values and the AI
classification is skipped.

### Reply drafting

The backend supplies the ticket query, relevant sections of the
hardcoded BookLeaf knowledge base, and the five most recent messages
fetched from the database. The goal is to keep prompts focused on
applicable policies and maintain conversation continuity without sending
the entire knowledge base on every request.

The generated reply is a draft, not an automatically sent message. An
administrator reviews and can edit it before sending.

### Error handling and cost awareness

-   The application can continue ticket creation when AI classification
    is unavailable.
-   Only relevant knowledge-base policies are included in the
    reply-generation prompt.
-   Recent conversation history is limited to five messages.
-   Gemini API credentials are kept in backend environment variables,
    not exposed in frontend code.

## Security Notes

-   Passwords are hashed using bcrypt.
-   Protected API operations require authentication.
-   Admin routes enforce role-based authorization.
-   Authors are restricted to their own books and tickets.
-   Internal notes are not exposed to authors.
-   Environment files, database credentials, JWT secrets, API keys, and
    live tokens must not be committed to Git.

## Testing

Testing has primarily been performed manually through the frontend and
API requests. There is no automated test suite currently documented for
this project.

For evaluation, test both the author and admin portals using the demo
accounts, and exercise ticket creation, classification, reply drafting,
public replies, internal notes, assignment, status updates, and
author-side updates.

## Known Limitations and Future Improvements

-   **UI/UX:** The frontend is functional, but the visual design and
    usability could be refined.
-   **Real-time coverage:** Current real-time behavior focuses on ticket
    status updates and admin replies for authors. More events and
    notifications could be added.
-   **AI reply accuracy:** Reply drafts could be improved by retrieving
    relevant, structured policy and account/book information from the
    database rather than relying on a hardcoded knowledge base alone.
-   **Testing and observability:** Automated tests, structured
    monitoring, and broader failure-path coverage would improve
    confidence and maintainability.

## Approach and Production Evolution

The implementation prioritised a working end-to-end workflow: author
access to book and royalty information, ticket submission and
communication, admin ticket management, and AI assistance. Role-based
access controls and author data isolation were important architectural
boundaries.

Pragmatic trade-offs included using a hardcoded policy knowledge base,
selecting only relevant policy content for prompts, limiting
conversation context to the five most recent messages, and allowing
ticket creation to continue when AI classification fails. These choices
keep the scope and token usage manageable while preserving the core
support workflow.

Given more time, I would refine the UI/UX, expand and verify real-time
events, improve AI grounding by retrieving relevant policy and
book/account data from structured sources, and add automated tests,
monitoring, and more systematic evaluation of AI response quality.
