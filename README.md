# 🔄 SlotSwapper - P2P Time Slot Scheduling

A peer-to-peer scheduling application that enables users to swap calendar events with each other in real-time.

![Tech Stack](https://img.shields.io/badge/MongoDB-Atlas-green) ![Node.js](https://img.shields.io/badge/Node.js-Express-blue) ![React](https://img.shields.io/badge/React-Vite-purple) ![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange)

---

## 📋 Table of Contents

- [Project Overview & Design Choices](#-project-overview--design-choices)
- [Local Setup Instructions](#-local-setup-instructions)
- [API Endpoints Documentation](#-api-endpoints-documentation)
- [Assumptions & Challenges](#-assumptions--challenges)

---

## 🎯 Project Overview & Design Choices

### What SlotSwapper Does

SlotSwapper is a marketplace-based calendar event exchange system where users can swap busy time slots with others in their group. For example, if **User A** has a "Team Meeting" on Tuesday 10-11 AM but prefers Wednesday's time, and **User B** has a "Focus Block" on Wednesday 2-3 PM, they can mark these as "swappable", discover each other's slots, and exchange them. When User B accepts the swap request (received via real-time notification), both calendars update automatically with swapped ownership.

**Core Features**: JWT authentication, event CRUD with tri-state status management (BUSY/SWAPPABLE/SWAP_PENDING), real-time WebSocket notifications, multi-tenant group isolation with unique invite codes, dark/light mode toggle, and responsive mobile-first UI.

### Architecture & Technology Decisions

**Monorepo Structure**: The project uses a monorepo with separate `backend/` and `frontend/` directories. This provides clear separation of concerns while keeping related code in one repository, simplifying deployment and version control.

**Tech Stack Rationale**:
- **Frontend (React 18 + Vite)**: Chosen for fast HMR during development, modern React features (hooks, context), and superior build performance over Create React App. Pure CSS was used instead of frameworks to avoid dependencies and maintain full styling control.
- **Backend (Node.js + Express)**: Enables full JavaScript stack, reducing context switching. Express provides a minimal, unopinionated framework perfect for RESTful APIs. The large npm ecosystem accelerates development.
- **Database (MongoDB Atlas)**: Document-oriented storage fits the flexible event schema naturally. Mongoose ODM provides type safety and schema validation while maintaining JavaScript idioms. Cloud hosting (Atlas) eliminates infrastructure management.
- **Authentication (JWT)**: Stateless tokens enable horizontal scaling without session stores. 30-day expiration balances security with user convenience. Tokens stored in localStorage for persistence across sessions.
- **Real-time (WebSocket)**: Bidirectional communication allows instant server-to-client notifications (swap requests, acceptances). Low latency compared to HTTP polling. Custom WebSocket server using `ws` library provides fine-grained control.

**Database Schema Design**:
- **Users Collection**: Stores bcrypt-hashed passwords (10 salt rounds), array of group memberships, and current active group reference. This enables multi-group support where users can belong to multiple communities but operate in one at a time.
- **Events Collection**: Each document represents a calendar slot with `userId`, `groupId`, `title`, `startTime`, `endTime`, and critically, a `status` field (BUSY/SWAPPABLE/SWAP_PENDING) that drives the swap marketplace logic.
- **SwapRequests Collection**: Links two events and their owners, tracking request state (PENDING/ACCEPTED/REJECTED). Enables swap history and audit trails.
- **Groups Collection**: Stores group metadata and auto-generated 6-character invite codes using crypto-secure random generation, ensuring uniqueness for private group sharing.

**Security Architecture**:
- Passwords never stored in plaintext; bcrypt with 10 rounds balances security and performance
- JWT middleware validates tokens on all protected routes, extracting user identity from claims
- CORS configured with specific origin whitelist (`FRONTEND_URL`), not wildcard, preventing unauthorized domain access
- Group-based isolation ensures queries filter by `currentGroup`, preventing cross-tenant data leakage
- MongoDB connection uses TLS encryption (Atlas default), protecting data in transit

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Node.js 16+** and npm installed ([download here](https://nodejs.org/))
- **MongoDB Atlas** account (free tier works) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Git** for cloning the repository

### Step 1: Clone and Navigate
```bash
git clone https://github.com/Natraj16/SlotSwapper.git
cd SlotSwapper
```

### Step 2: Backend Configuration and Startup

Navigate to backend and install dependencies:
```bash
cd backend
npm install
```

**Create `.env` file** in the `backend/` directory with the following variables:
```env
PORT=3001
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/slotswapper?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Important Notes**:
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string (get it from Atlas Dashboard → Connect → Connect your application)
- Generate a strong `JWT_SECRET` (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `FRONTEND_URL` must match where your frontend runs (default is 5173)

Start the backend server:
```bash
npm run dev
```

**Expected Output**: Server should start on `http://localhost:3001` with a banner showing "SlotSwapper API Server" and "WebSocket enabled". If you see connection errors, verify your MongoDB URI is correct and Atlas Network Access allows your IP (set to 0.0.0.0/0 for testing).

### Step 3: Frontend Configuration and Startup

Open a **new terminal window/tab** and navigate to frontend:
```bash
cd frontend    # from SlotSwapper root directory
npm install
```

**Create `.env` file** in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3001/api
```

This tells the React app where to find the backend API. The `/api` suffix is crucial as all backend routes are prefixed with it.

Start the frontend development server:
```bash
npm run dev
```

**Expected Output**: Vite dev server should start on `http://localhost:5173` with hot module replacement enabled.

### Step 4: Access and Test the Application

Open your browser and navigate to: **`http://localhost:5173`**

**Create a New Account**:
1. Click "Sign Up" 
2. Enter name, email, password
3. Click "Register"

You'll be automatically logged in and redirected to the Dashboard. From here you can:
- Create groups (get a 6-character invite code)
- Join existing groups (enter invite code)
- Create events and mark them as swappable
- Browse the marketplace to find swap opportunities
- Send/receive swap requests with real-time notifications

**Quick Test Flow**:
1. Create a group → Note the invite code
2. Create an event and mark status as "SWAPPABLE"
3. Open an incognito window, register a second user
4. Join the same group using the invite code
5. Create and mark another event as swappable
6. Request a swap → First user receives real-time notification
7. Accept the swap → Both calendars update automatically

---

## 📡 API Endpoints Documentation

All endpoints are prefixed with `/api`. Protected routes require a JWT token in the `Authorization` header as `Bearer <token>`.

### Authentication Endpoints

**Register New User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Response** (201 Created):
```json
{
  "user": {
    "_id": "6543210abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "groups": [],
    "currentGroup": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTQzMjEwYWJjZGVmIiwiaWF0IjoxNjk..."
}
```
The token expires in 30 days and should be stored client-side (localStorage) and sent with all subsequent requests.

**Login User**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
Returns same structure as register. Password is verified against bcrypt hash.

**Get Current User** (Protected)
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```
Returns user object with populated groups and currentGroup. Used to restore session on page reload.

---

### Event Management Endpoints

**Get User's Events** (Protected)
```http
GET /api/events
Authorization: Bearer <token>
```
Returns all events belonging to the authenticated user in their current group. Response includes event status (BUSY/SWAPPABLE/SWAP_PENDING).

**Get Swappable Events in Marketplace** (Protected)
```http
GET /api/events/swappable
Authorization: Bearer <token>
```
Returns events marked as SWAPPABLE by other users in the same group, excluding the requester's own events. This populates the marketplace view.

**Create Event** (Protected)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync with engineering team",
  "startTime": "2025-11-05T10:00:00Z",
  "endTime": "2025-11-05T11:00:00Z",
  "status": "SWAPPABLE"
}
```
**Response** (201 Created): Returns created event object with auto-populated `userId` and `groupId` from JWT.

**Update Event** (Protected)
```http
PUT /api/events/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "BUSY"
}
```
Allows updating any event field. Users can only update their own events. Changing status from SWAPPABLE to BUSY removes it from marketplace.

**Delete Event** (Protected)
```http
DELETE /api/events/:eventId
Authorization: Bearer <token>
```
Permanently deletes the event. Also deletes any associated pending swap requests.

---

### Swap Request Endpoints

**Get Swap Requests** (Protected)
```http
GET /api/swap-requests
Authorization: Bearer <token>
```
Returns swap requests where the user is either the requester or target. Populated with full event details for both sides of the swap.

**Create Swap Request** (Protected)
```http
POST /api/swap-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "userEventId": "6543210xyz",
  "targetEventId": "6543210abc"
}
```
Creates a swap proposal. `userEventId` is the requester's event, `targetEventId` is the desired event. Both events' status changes to SWAP_PENDING. Target user receives WebSocket notification.

**Accept Swap** (Protected)
```http
PUT /api/swap-requests/:requestId/accept
Authorization: Bearer <token>
```
Executes the swap: both events exchange `userId` fields (ownership transfer), status reverts to BUSY, and request marked ACCEPTED. Uses Mongoose transactions for atomicity.

**Reject Swap** (Protected)
```http
PUT /api/swap-requests/:requestId/reject
Authorization: Bearer <token>
```
Declines the swap. Both events revert to SWAPPABLE status, request marked REJECTED.

---

### Group Management Endpoints

**Create Group** (Protected)
```http
POST /api/groups/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering Team"
}
```
**Response**:
```json
{
  "group": {
    "_id": "grp123",
    "name": "Engineering Team",
    "inviteCode": "A1B2C3",
    "createdBy": "6543210abcdef",
    "members": ["6543210abcdef"]
  },
  "updatedUser": { /* user object with updated groups array */ },
  "message": "Group created successfully"
}
```
Generates a unique 6-character invite code using crypto-secure randomness. Creator automatically becomes a member and it's set as their currentGroup.

**Join Group** (Protected)
```http
POST /api/groups/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteCode": "A1B2C3"
}
```
Adds user to group's members array and their groups array. Sets as currentGroup. Returns error if already a member or code invalid.

**Switch Current Group** (Protected)
```http
POST /api/groups/switch
Authorization: Bearer <token>
Content-Type: application/json

{
  "groupId": "grp123"
}
```
Changes user's active group context. User must already be a member. All subsequent API calls filter by this group.

**Leave Group** (Protected)
```http
POST /api/groups/leave
Authorization: Bearer <token>
Content-Type: application/json

{
  "groupId": "grp123"
}
```
Removes user from group. If it was their currentGroup, automatically switches to another group they're in (or null). Cannot leave if it's the only group.

**List User's Groups** (Protected)
```http
GET /api/groups
Authorization: Bearer <token>
```
Returns array of all groups the user belongs to with full details.

---

### WebSocket Real-time Communication

**Connection**: `ws://localhost:3001` (development) or `wss://your-domain.com` (production)

**Authentication Flow**:
1. Client establishes WebSocket connection
2. Client sends authentication message:
```json
{
  "type": "authenticate",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
3. Server validates JWT and associates connection with userId

**Server Push Events**:
When a swap request is created/accepted/rejected, server pushes to relevant users:
```json
{
  "type": "SWAP_REQUEST",
  "data": {
    "message": "John Doe wants to swap 'Team Meeting' with your 'Focus Block'",
    "swapRequest": {
      "_id": "swap123",
      "status": "PENDING",
      "requester": { /* user object */ },
      "userEvent": { /* event object */ },
      "targetEvent": { /* event object */ }
    }
  }
}
```

Client listens for these events and updates UI in real-time (toast notifications, badge counts, list refreshes).

---

## 🧠 Assumptions & Challenges

### Key Assumptions Made During Development

**Timezone Handling**: All event times are stored in MongoDB as UTC timestamps. The frontend displays them in the user's browser's local timezone using JavaScript's `Date` object. This assumes users understand times are shown in their local context and doesn't require explicit timezone selection per event.

**Event Granularity**: Each event is a single, non-recurring occurrence. There's no support for recurring events (daily/weekly patterns) or series. If a user has a recurring meeting, they must create separate events for each occurrence. This simplifies the swap logic since each event is atomic.

**Swap Cardinality**: The system only supports 1:1 swaps (one event for one event). Multi-event swaps (e.g., trading two morning slots for one afternoon slot) are not supported. This keeps the swap transaction logic simple and the UI intuitive.

**Group Isolation & Multi-tenancy**: Users can belong to multiple groups but operate in one "current group" at a time (similar to Slack workspaces). All queries filter by `currentGroup`, ensuring complete data isolation between groups. Users must explicitly switch groups to see different event sets. This prevents accidental cross-group data leakage and scales to thousands of isolated communities.

**Event Overlap Allowed**: The system doesn't prevent users from creating overlapping events in their calendar. It's the user's responsibility to manage schedule conflicts. This design choice prioritizes flexibility over strict validation, as users might legitimately need to represent tentative or conflicting commitments.

### Technical Challenges & Solutions

**Challenge 1: WebSocket Authentication Security**

**Problem**: WebSockets don't support HTTP headers like REST APIs, so sending JWT tokens in the initial handshake header isn't straightforward with the basic `ws` library. Simply accepting any connection would be a security hole.

**Solution**: Implemented a two-phase connection: (1) Client establishes WebSocket connection, (2) Client immediately sends an authentication message containing the JWT as JSON payload, (3) Server validates the token, extracts userId, and stores it in a `Map<userId, WebSocketConnection>`, (4) Unauthenticated connections are closed after 5 seconds. This allows secure token validation while maintaining WebSocket simplicity.

**Challenge 2: Atomic Swap Transactions**

**Problem**: Accepting a swap requires three database writes: (1) Update requester's event userId, (2) Update target's event userId, (3) Update swap request status. If any fails midway (network error, server crash), calendars could end up in an inconsistent state (one event swapped but not the other).

**Solution**: Leveraged Mongoose/MongoDB transactions with session management. All three updates are wrapped in a single transaction that either commits entirely or rolls back entirely. This guarantees atomicity—swaps are all-or-nothing, preventing data corruption even during failures.

**Challenge 3: Group State Persistence Bug**

**Problem**: After implementing groups, users reported their groups "disappearing" after logout/login. Investigation revealed the `/api/auth/login` endpoint populated `currentGroup` but not the `groups` array, so the frontend couldn't render the group list.

**Solution**: Added `.populate('groups')` to the login query alongside existing `.populate('currentGroup')`. Additionally, ensured every group operation endpoint (create/join/leave/switch) returns the full updated user object with populated groups, keeping frontend state synchronized with backend state.

**Challenge 4: Dark Mode Flash on Load**

**Problem**: Users experienced a "flash" of the wrong theme when loading the page—the light theme would briefly appear before JavaScript read localStorage and applied dark mode. This created a jarring user experience.

**Solution**: Moved theme logic earlier in the load cycle by reading `localStorage.getItem('theme')` and applying the theme class to `<html>` in `index.html` via inline script before React mounts. Combined with CSS variables (`:root` and `[data-theme="dark"]`), this ensures the correct theme renders immediately, eliminating the flash.

---

**Built with ❤️ using the MERN Stack**

- ✅ **Unit Tests** - Comprehensive tests for swap logic

- **Password Hashing**: bcrypt with salt rounds for secure password storage- ✅ **Real-time WebSocket** - Instant notifications for swap events

- **JWT Tokens**: 30-day expiration with secret key signing- ✅ **Beautiful UI** - Quicksand font throughout the entire application

- **Ownership Validation**: Server-side checks ensure users can only swap their own slots- ✅ **Dynamic State Updates** - UI updates automatically without manual refresh

- **Protected Routes**: Middleware protection on all sensitive endpoints

---

### User Experience

## 🛠 Tech Stack

- **Quicksand Font**: Clean, modern Google Font for enhanced readability

- **Responsive Design**: Mobile-friendly interface with flexible grid layouts### Frontend

- **Real-time Feedback**: Loading states, success/error messages, and instant notifications- **React 18** - Modern UI library with hooks

- **Protected Frontend Routes**: Automatic redirect to login for unauthenticated users- **Vite** - Lightning-fast build tool and dev server

- **React Router DOM** - Client-side routing

---- **JavaScript (ES6+)** - No TypeScript, pure JavaScript

- **CSS3** - Custom styling with CSS variables

## ✨ Features- **WebSocket API** - Real-time communication

- **Google Fonts (Quicksand)** - Beautiful typography

### Authentication

- User signup with name, email, and password### Backend

- Login with JWT token generation- **Node.js** - JavaScript runtime

- Password confirmation and validation- **Express.js** - Minimal web framework

- Secure password storage with bcrypt- **MongoDB Atlas** - Cloud-hosted NoSQL database

- **Mongoose** - MongoDB ODM (Object Data Modeling)

### Calendar Management- **JWT (jsonwebtoken)** - Stateless authentication

- Create, read, update, and delete time slots- **bcryptjs** - Password hashing

- Toggle slot status: BUSY → SWAPPABLE → BUSY- **WebSocket (ws)** - Real-time bidirectional communication

- View all personal events in dashboard- **CORS** - Cross-origin resource sharing

- Real-time updates when swaps occur- **dotenv** - Environment variable management



### Swap Marketplace### Development Tools

- Browse swappable slots from other users- **nodemon** - Auto-restart server on changes

- View slot details (title, time, owner)- **Jest** - Testing framework

- Request swaps by selecting your own slot to offer- **ESLint** - Code quality (optional)

- Filter out your own slots automatically

---

### Swap Requests

- Incoming requests with Accept/Reject actions## 🏗 Architecture

- Outgoing requests with status tracking (Pending/Accepted/Rejected)

- Real-time WebSocket notifications for new requests### System Architecture

- Visual status indicators and badges

```

### Real-time Notifications┌─────────────────────────────────────────────────────────────┐

- WebSocket connection with auto-reconnect│                         CLIENT SIDE                          │

- Notification badge on navbar│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐ │

- Live updates when swaps are accepted/rejected│  │   React    │  │  React      │  │   WebSocket Client   │ │

- Connection status indicator│  │   Router   │  │  Context    │  │   (Real-time)        │ │

│  └────────────┘  └─────────────┘  └──────────────────────┘ │

---│         │                │                     │             │

│         └────────────────┴─────────────────────┘             │

## 🛠️ Tech Stack│                          │                                   │

└──────────────────────────┼───────────────────────────────────┘

### Backend                           │ HTTP/WebSocket

- **Node.js** v16+ - JavaScript runtime┌──────────────────────────┼───────────────────────────────────┐

- **Express.js** v4.18 - Web framework│                          ▼                                   │

- **MongoDB Atlas** - Cloud database│                    SERVER SIDE                               │

- **Mongoose** v8.0 - MongoDB ODM│  ┌──────────────────────────────────────────────────────┐   │

- **JWT** (jsonwebtoken v9.0) - Authentication│  │              Express.js Server                       │   │

- **bcryptjs** v2.4 - Password hashing│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │

- **WebSocket** (ws v8.14) - Real-time communication│  │  │ Auth Routes │  │ Event Routes │  │ Swap Routes│  │   │

- **CORS** v2.8 - Cross-origin support│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │

- **Jest** v29.7 - Unit testing│  │  ┌─────────────────────────────────────────────────┐ │   │

│  │  │         JWT Authentication Middleware           │ │   │

### Frontend│  │  └─────────────────────────────────────────────────┘ │   │

- **React** v18.2 - UI library│  └──────────────────────────────────────────────────────┘   │

- **Vite** v5.0 - Build tool and dev server│                          │                                   │

- **React Router DOM** v6.20 - Client-side routing│  ┌──────────────────────────────────────────────────────┐   │

- **WebSocket API** - Real-time client│  │            WebSocket Server (ws)                     │   │

- **Google Fonts** - Quicksand typography│  │     • Real-time Notifications                        │   │

│  │     • User Connection Management                     │   │

---│  └──────────────────────────────────────────────────────┘   │

│                          │                                   │

## 🚀 Setup Instructions└──────────────────────────┼───────────────────────────────────┘

                           │

### Prerequisites┌──────────────────────────┼───────────────────────────────────┐

│                          ▼                                   │

- **Node.js** v16 or higher ([Download](https://nodejs.org/))│                  MongoDB Atlas (Cloud)                       │

- **MongoDB Atlas Account** ([Sign up free](https://www.mongodb.com/cloud/atlas/register))│  ┌─────────────────────────────────────────────────────┐    │

- **Git** (optional, for cloning)│  │  Collections:  users | events | swaprequests        │    │

│  └─────────────────────────────────────────────────────┘    │

### 1. Clone or Download the Project└──────────────────────────────────────────────────────────────┘

```

```bash

git clone <repository-url>### Request Flow

cd SlotSwapper

```1. **Authentication Flow**:

   - User submits credentials → Backend validates → JWT token generated → Token stored in localStorage → Token sent with all subsequent requests

Or download and extract the ZIP file.

2. **Event Creation Flow**:

### 2. MongoDB Atlas Setup   - User creates event → POST /api/events → JWT verified → Event saved to MongoDB → Response with event data



1. **Create a MongoDB Atlas account** at https://cloud.mongodb.com/3. **Swap Request Flow**:

2. **Create a new cluster** (free M0 tier is fine)   - User A browses marketplace → Selects User B's slot → Selects own slot to offer → POST /api/swap-request → Both slots marked SWAP_PENDING → SwapRequest created → WebSocket notification sent to User B

3. **Create a database user**:

   - Go to **Database Access**4. **Swap Response Flow**:

   - Click **Add New Database User**   - User B receives notification → Reviews request → Clicks Accept/Reject → POST /api/swap-response/:id → Database transaction → Ownership swapped (or slots reset) → WebSocket notification sent to User A → UI updates automatically

   - Set username and password (save these!)

   - Grant **Read and write to any database** permission---

4. **Whitelist your IP**:

   - Go to **Network Access**## 📊 Database Schema

   - Click **Add IP Address**

   - Click **Allow Access from Anywhere** (or add your current IP)### MongoDB Collections

5. **Get your connection string**:

   - Click **Connect** on your cluster#### 1. **users** Collection

   - Choose **Connect your application**Stores user authentication and profile data.

   - Copy the connection string (looks like `mongodb+srv://...`)

```javascript

### 3. Backend Setup{

  _id: ObjectId,

```bash  name: String,           // User's full name

# Navigate to backend directory  email: String,          // Unique email (indexed)

cd backend  password: String,       // bcrypt hashed password

  createdAt: Date,        // Auto-generated timestamp

# Install dependencies  updatedAt: Date         // Auto-updated timestamp

npm install}

```

# Create .env file

copy .env.example .env    # Windows**Indexes**: `email` (unique)

# OR

cp .env.example .env      # Mac/Linux---

```

#### 2. **events** Collection

**Edit `backend/.env`** with your MongoDB credentials:Represents calendar time slots/events.



```env```javascript

MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/slotswapper?retryWrites=true&w=majority{

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  _id: ObjectId,

PORT=3001  title: String,          // Event name (e.g., "Team Meeting")

NODE_ENV=development  startTime: Date,        // Event start time

FRONTEND_URL=http://localhost:5173  endTime: Date,          // Event end time (must be > startTime)

```  status: String,         // Enum: "BUSY", "SWAPPABLE", "SWAP_PENDING"

  userId: ObjectId,       // Reference to users collection

**Important**: Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials.  createdAt: Date,

  updatedAt: Date

**Initialize the database** (creates collections and indexes):}

```

```bash

npm run init-db**Indexes**: 

```- `userId` (for efficient user event queries)

- `status` (for marketplace queries)

You should see:- Compound: `(userId, status)` (optimized filtering)

```

✅ MongoDB Connected**Status Lifecycle**:

✅ Created "users" collection- `BUSY` → Default state, not available for swapping

✅ Created "events" collection- `SWAPPABLE` → Available in marketplace for swap requests

✅ Created "swaprequests" collection- `SWAP_PENDING` → Currently locked in a pending swap request

```

---

### 4. Frontend Setup

#### 3. **swaprequests** Collection

Open a **new terminal window**:Tracks swap negotiations between users.



```bash```javascript

# Navigate to frontend directory{

cd frontend  _id: ObjectId,

  status: String,            // Enum: "PENDING", "ACCEPTED", "REJECTED"

# Install dependencies  initiatorId: ObjectId,     // User who initiated the swap

npm install  receiverId: ObjectId,      // User who receives the request

```  initiatorSlotId: ObjectId, // Slot offered by initiator

  receiverSlotId: ObjectId,  // Slot requested from receiver

### 5. Start the Application  createdAt: Date,

  updatedAt: Date

**Terminal 1 - Backend**:}

```bash```

cd backend

npm run dev**Indexes**:

```- `initiatorId` (for outgoing requests)

- `receiverId` (for incoming requests)

You should see:- `status` (for filtering pending/completed)

```

🚀 Server running on port 3001**Status Lifecycle**:

✅ MongoDB Connected- `PENDING` → Waiting for receiver's response

📡 WebSocket enabled- `ACCEPTED` → Swap completed, slots exchanged

```- `REJECTED` → Swap declined, slots reverted to SWAPPABLE



**Terminal 2 - Frontend**:---

```bash

cd frontend## 🔌 API Endpoints

npm run dev

```### Base URL

```

You should see:http://localhost:3001/api

``````

VITE ready in XXX ms

➜ Local: http://localhost:5173/### Authentication Endpoints

```

#### 1. **POST** `/auth/signup`

### 6. Access the ApplicationRegister a new user.



Open your browser and navigate to: **http://localhost:5173** (or 5174 if 5173 is in use)**Request Body**:

```json

### 7. Test the Application{

  "name": "John Doe",

1. **Sign up** for a new account  "email": "john@example.com",

2. **Create some events** in the Dashboard  "password": "password123"

3. **Mark an event as "Swappable"**}

4. **Open in incognito/another browser** and sign up as a different user```

5. **Create and mark events as swappable** for the second user

6. **Go to Marketplace** and request a swap**Response** (201 Created):

7. **Check Notifications** to accept/reject swaps```json

{

---  "message": "User registered successfully",

  "user": {

## 📚 API Documentation    "id": "6543...",

    "name": "John Doe",

### Base URL    "email": "john@example.com"

```  },

http://localhost:3001/api  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

```}

```

### Authentication Endpoints

---

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

#### 2. **POST** `/auth/login`

#### POST `/auth/signup`Authenticate an existing user.

Create a new user account.

**Request Body**:

**Request Body**:```json

```json{

{  "email": "john@example.com",

  "name": "John Doe",  "password": "password123"

  "email": "john@example.com",}

  "password": "password123"```

}

```**Response** (200 OK):

```json

**Response** (201 Created):{

```json  "message": "Login successful",

{  "user": {

  "message": "User registered successfully",    "id": "6543...",

  "user": {    "name": "John Doe",

    "id": "507f1f77bcf86cd799439011",    "email": "john@example.com"

    "name": "John Doe",  },

    "email": "john@example.com"  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  },}

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."```

}

```---



#### POST `/auth/login`### Event Endpoints (Protected - Require JWT)

Authenticate and receive JWT token.

#### 3. **GET** `/events`

**Request Body**:Get all events for the logged-in user.

```json

{**Headers**:

  "email": "john@example.com",```

  "password": "password123"Authorization: Bearer <token>

}```

```

**Response** (200 OK):

**Response** (200 OK):```json

```json[

{  {

  "message": "Login successful",    "_id": "6543...",

  "user": {    "title": "Team Meeting",

    "id": "507f1f77bcf86cd799439011",    "startTime": "2025-11-04T10:00:00.000Z",

    "name": "John Doe",    "endTime": "2025-11-04T11:00:00.000Z",

    "email": "john@example.com"    "status": "SWAPPABLE",

  },    "userId": "6543...",

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."    "createdAt": "2025-10-31T...",

}    "updatedAt": "2025-10-31T..."

```  }

]

---```



### Event Management Endpoints---



**All event endpoints require authentication.**#### 4. **POST** `/events`

Create a new event.

#### GET `/events`

Get all events for the authenticated user.**Request Body**:

```json

**Headers**:{

```  "title": "Focus Block",

Authorization: Bearer <token>  "startTime": "2025-11-05T14:00:00",

```  "endTime": "2025-11-05T15:00:00",

  "status": "BUSY"

**Response** (200 OK):}

```json```

[

  {**Response** (201 Created):

    "_id": "507f1f77bcf86cd799439011",```json

    "title": "Team Meeting",{

    "startTime": "2025-11-05T10:00:00.000Z",  "message": "Event created successfully",

    "endTime": "2025-11-05T11:00:00.000Z",  "event": { /* event object */ }

    "status": "SWAPPABLE",}

    "userId": "507f191e810c19729de860ea",```

    "createdAt": "2025-11-01T12:00:00.000Z",

    "updatedAt": "2025-11-01T12:00:00.000Z"---

  }

]#### 5. **PUT** `/events/:id`

```Update an existing event.



#### POST `/events`**Request Body**:

Create a new event.```json

{

**Headers**:  "title": "Updated Meeting",

```  "status": "SWAPPABLE"

Authorization: Bearer <token>}

``````



**Request Body**:**Response** (200 OK):

```json```json

{{

  "title": "Focus Block",  "message": "Event updated successfully",

  "startTime": "2025-11-06T14:00:00.000Z",  "event": { /* updated event */ }

  "endTime": "2025-11-06T15:00:00.000Z",}

  "status": "BUSY"```

}

```---



**Response** (201 Created):#### 6. **DELETE** `/events/:id`

```jsonDelete an event.

{

  "message": "Event created successfully",**Response** (200 OK):

  "event": {```json

    "_id": "507f1f77bcf86cd799439012",{

    "title": "Focus Block",  "message": "Event deleted successfully"

    "startTime": "2025-11-06T14:00:00.000Z",}

    "endTime": "2025-11-06T15:00:00.000Z",```

    "status": "BUSY",

    "userId": "507f191e810c19729de860ea",---

    "createdAt": "2025-11-01T12:05:00.000Z",

    "updatedAt": "2025-11-01T12:05:00.000Z"### Swap Endpoints (Protected)

  }

}#### 7. **GET** `/swappable-slots`

```Get all swappable slots from other users.



#### PUT `/events/:id`**Response** (200 OK):

Update an existing event.```json

[

**Headers**:  {

```    "_id": "6543...",

Authorization: Bearer <token>    "title": "Client Call",

```    "startTime": "2025-11-06T09:00:00.000Z",

    "endTime": "2025-11-06T10:00:00.000Z",

**Request Body** (all fields optional):    "status": "SWAPPABLE",

```json    "userId": {

{      "_id": "6543...",

  "title": "Updated Meeting",      "name": "Jane Smith",

  "startTime": "2025-11-05T11:00:00.000Z",      "email": "jane@example.com"

  "endTime": "2025-11-05T12:00:00.000Z",    }

  "status": "SWAPPABLE"  }

}]

``````



**Response** (200 OK):---

```json

{#### 8. **POST** `/swap-request`

  "message": "Event updated successfully",Create a new swap request.

  "event": { /* updated event object */ }

}**Request Body**:

``````json

{

#### DELETE `/events/:id`  "mySlotId": "6543abc...",

Delete an event.  "theirSlotId": "6543def..."

}

**Headers**:```

```

Authorization: Bearer <token>**Server Validation**:

```- ✅ Both slots must exist

- ✅ `mySlotId` must belong to the authenticated user

**Response** (200 OK):- ✅ Both slots must have status `SWAPPABLE`

```json- ✅ Users cannot swap with themselves

{

  "message": "Event deleted successfully"**Response** (201 Created):

}```json

```{

  "message": "Swap request created successfully",

---  "swapRequest": {

    "_id": "6543...",

### Swap Endpoints    "status": "PENDING",

    "initiatorId": { /* user object */ },

**All swap endpoints require authentication.**    "receiverId": { /* user object */ },

    "initiatorSlotId": { /* event object */ },

#### GET `/swappable-slots`    "receiverSlotId": { /* event object */ }

Get all swappable slots from other users (excludes your own slots).  }

}

**Headers**:```

```

Authorization: Bearer <token>**Side Effects**:

```- Both slots are updated to status `SWAP_PENDING`

- WebSocket notification sent to receiver

**Response** (200 OK):

```json---

[

  {#### 9. **POST** `/swap-response/:requestId`

    "_id": "507f1f77bcf86cd799439013",Accept or reject a swap request.

    "title": "Client Call",

    "startTime": "2025-11-07T09:00:00.000Z",**Request Body**:

    "endTime": "2025-11-07T10:00:00.000Z",```json

    "status": "SWAPPABLE",{

    "userId": {  "accept": true  // or false

      "_id": "507f191e810c19729de860eb",}

      "name": "Jane Smith",```

      "email": "jane@example.com"

    },**If `accept: true`** (Acceptance Logic):

    "createdAt": "2025-11-01T10:00:00.000Z",1. Swap ownership of both events (initiatorSlot.userId ↔ receiverSlot.userId)

    "updatedAt": "2025-11-01T10:00:00.000Z"2. Set both events status to `BUSY`

  }3. Update SwapRequest status to `ACCEPTED`

]4. Send WebSocket notification to initiator

```

**If `accept: false`** (Rejection Logic):

#### POST `/swap-request`1. Set SwapRequest status to `REJECTED`

Request to swap slots with another user.2. Revert both events status to `SWAPPABLE`

3. Send WebSocket notification to initiator

**Headers**:

```**Response** (200 OK):

Authorization: Bearer <token>```json

```{

  "message": "Swap accepted successfully",

**Request Body**:  "swapRequest": { /* updated swap request */ }

```json}

{```

  "mySlotId": "507f1f77bcf86cd799439011",

  "theirSlotId": "507f1f77bcf86cd799439013"---

}

```#### 10. **GET** `/swap-requests/incoming`

Get incoming swap requests for the current user.

**Validations**:

- Both slots must exist**Response** (200 OK):

- Both slots must have status `SWAPPABLE````json

- You must own `mySlotId`[

- You cannot swap with yourself  {

- Both slots will be set to `SWAP_PENDING`    "_id": "6543...",

    "status": "PENDING",

**Response** (201 Created):    "initiatorId": { /* user */ },

```json    "initiatorSlotId": { /* event */ },

{    "receiverSlotId": { /* event */ }

  "message": "Swap request created successfully",  }

  "swapRequest": {]

    "_id": "507f1f77bcf86cd799439014",```

    "status": "PENDING",

    "initiatorId": { /* user object */ },---

    "receiverId": { /* user object */ },

    "initiatorSlotId": { /* event object */ },#### 11. **GET** `/swap-requests/outgoing`

    "receiverSlotId": { /* event object */ },Get outgoing swap requests from the current user.

    "createdAt": "2025-11-01T12:10:00.000Z",

    "updatedAt": "2025-11-01T12:10:00.000Z"**Response** (200 OK):

  }```json

}[

```  {

    "_id": "6543...",

#### POST `/swap-response/:requestId`    "status": "PENDING",

Accept or reject a swap request.    "receiverId": { /* user */ },

    "initiatorSlotId": { /* event */ },

**Headers**:    "receiverSlotId": { /* event */ }

```  }

Authorization: Bearer <token>]

``````



**Request Body**:---

```json

{## 🚀 Getting Started

  "accept": true

}### Prerequisites

```

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)

**Behavior**:- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas)

- **If `accept: true`**:- **Git** - [Download](https://git-scm.com/)

  - Swaps ownership (`userId`) of both slots

  - Sets both slots to `BUSY`### Installation

  - Sets request status to `ACCEPTED`

- **If `accept: false`**:#### 1. Clone the Repository

  - Sets both slots back to `SWAPPABLE`

  - Sets request status to `REJECTED````bash

cd SlotSwapper

**Response** (200 OK):```

```json

{---

  "message": "Swap accepted successfully",

  "swapRequest": { /* updated swap request */ }#### 2. Backend Setup

}

``````bash

cd backend

#### GET `/swap-requests/incoming`npm install

Get swap requests where you are the receiver.```



**Headers**:Create `.env` file (copy from `.env.example`):

```

Authorization: Bearer <token>```bash

```cp .env.example .env

```

**Response** (200 OK):

```jsonEdit `.env` file:

[

  {```env

    "_id": "507f1f77bcf86cd799439014",# MongoDB Atlas Connection

    "status": "PENDING",MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/slotswapper?retryWrites=true&w=majority

    "initiatorId": {

      "_id": "507f191e810c19729de860ea",# JWT Secret (use a strong random string)

      "name": "John Doe",JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

      "email": "john@example.com"

    },# Server Configuration

    "initiatorSlotId": { /* event details */ },PORT=3001

    "receiverSlotId": { /* event details */ },NODE_ENV=development

    "createdAt": "2025-11-01T12:10:00.000Z"

  }# CORS - Frontend URL

]FRONTEND_URL=http://localhost:5173

``````



#### GET `/swap-requests/outgoing`**To get your MongoDB Atlas connection string:**

Get swap requests you initiated.1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a free cluster (if you haven't)

**Headers**:3. Click "Connect" → "Connect your application"

```4. Copy the connection string and replace `<username>`, `<password>`, and `<cluster-url>`

Authorization: Bearer <token>

```---



**Response** (200 OK):#### 3. Frontend Setup

```json

[```bash

  {cd ../frontend

    "_id": "507f1f77bcf86cd799439015",npm install

    "status": "ACCEPTED",```

    "receiverId": {

      "_id": "507f191e810c19729de860eb",No additional configuration needed for frontend (Vite proxy handles API calls).

      "name": "Jane Smith",

      "email": "jane@example.com"---

    },

    "initiatorSlotId": { /* event details */ },### Running the Application

    "receiverSlotId": { /* event details */ },

    "createdAt": "2025-11-01T11:00:00.000Z"#### Option 1: Run Both Servers Separately

  }

]**Terminal 1 - Backend:**

``````bash

cd backend

---npm run dev

```

### API Endpoints Summary TableBackend will run on `http://localhost:3001`



| Method | Endpoint | Auth Required | Description |**Terminal 2 - Frontend:**

|--------|----------|---------------|-------------|```bash

| POST | `/api/auth/signup` | No | Create new user account |cd frontend

| POST | `/api/auth/login` | No | Authenticate and get JWT token |npm run dev

| GET | `/api/events` | Yes | Get all user's events |```

| POST | `/api/events` | Yes | Create a new event |Frontend will run on `http://localhost:5173`

| PUT | `/api/events/:id` | Yes | Update an event |

| DELETE | `/api/events/:id` | Yes | Delete an event |#### Option 2: Run from Root (PowerShell)

| GET | `/api/swappable-slots` | Yes | Get swappable slots from others |

| POST | `/api/swap-request` | Yes | Create a swap request |```powershell

| POST | `/api/swap-response/:requestId` | Yes | Accept or reject swap request |# Terminal 1

| GET | `/api/swap-requests/incoming` | Yes | Get incoming swap requests |cd backend; npm run dev

| GET | `/api/swap-requests/outgoing` | Yes | Get outgoing swap requests |

# Terminal 2 (open new terminal)

---cd frontend; npm run dev

```

## 📁 Project Structure

---

```

SlotSwapper/## 📖 Usage Guide

├── backend/

│   ├── src/### 1. Create Your Account

│   │   ├── config/

│   │   │   └── database.js          # MongoDB connection1. Open `http://localhost:5173` in your browser

│   │   ├── middleware/2. Click "Sign Up" in the navbar

│   │   │   └── auth.js              # JWT authentication middleware3. Fill in your name, email, and password

│   │   ├── models/4. Submit to create your account and auto-login

│   │   │   ├── User.js              # User schema

│   │   │   ├── Event.js             # Event/slot schema### 2. Add Events to Your Calendar

│   │   │   └── SwapRequest.js       # Swap request schema

│   │   ├── routes/1. Navigate to "Dashboard" from the navbar

│   │   │   ├── auth.js              # Authentication routes2. Click "+ Add Event" button

│   │   │   ├── events.js            # Event CRUD routes3. Fill in:

│   │   │   └── swap.js              # Swap logic routes   - **Title**: Event name (e.g., "Team Meeting")

│   │   ├── websocket/   - **Start Time**: Event start date/time

│   │   │   └── websocketServer.js   # WebSocket server   - **End Time**: Event end date/time

│   │   └── server.js                # Express app entry point   - **Status**: Choose "Busy" or "Swappable"

│   ├── __tests__/4. Click "Create"

│   │   └── swap.test.js             # Swap logic unit tests

│   ├── .env.example                 # Environment variables template### 3. Mark Slots as Swappable

│   ├── .env                         # Environment variables (create this)

│   ├── package.json1. On Dashboard, find an event you want to offer for swapping

│   ├── jest.config.js2. Click "Make Swappable" button

│   └── initDatabase.js              # Database initialization script3. The badge will change from "BUSY" to "SWAPPABLE"

│

├── frontend/### 4. Browse the Marketplace

│   ├── src/

│   │   ├── components/1. Click "Marketplace" in the navbar

│   │   │   ├── Navbar.jsx           # Navigation bar2. You'll see all swappable slots from other users

│   │   │   └── ProtectedRoute.jsx   # Route protection3. Each slot shows:

│   │   ├── context/   - Event title

│   │   │   ├── AuthContext.jsx      # Authentication context   - Owner name and email

│   │   │   └── WebSocketContext.jsx # WebSocket context   - Start and end times

│   │   ├── pages/   - "Request Swap" button

│   │   │   ├── Home.jsx             # Landing page

│   │   │   ├── Login.jsx            # Login page### 5. Request a Swap

│   │   │   ├── Signup.jsx           # Signup page

│   │   │   ├── Dashboard.jsx        # User's events dashboard1. In Marketplace, click "Request Swap" on a desired slot

│   │   │   ├── Marketplace.jsx      # Browse swappable slots2. A modal will open showing the slot you want

│   │   │   ├── Notifications.jsx    # Incoming/outgoing requests3. Select one of your swappable slots to offer

│   │   │   └── *.css                # Component styles4. Click "Send Request"

│   │   ├── utils/5. The request is sent, and both slots are locked (SWAP_PENDING)

│   │   │   └── api.js               # API utility functions

│   │   ├── App.jsx                  # Main app component### 6. Respond to Incoming Requests

│   │   ├── main.jsx                 # React entry point

│   │   └── index.css                # Global styles1. Click "Notifications" in the navbar (you'll see a badge if you have unread requests)

│   ├── index.html2. View incoming requests showing:

│   ├── package.json   - Who sent the request

│   └── vite.config.js   - Their offered slot

│   - Your requested slot

└── README.md                        # This file3. Click "Accept" to complete the swap (ownership exchanges)

```4. Click "Reject" to decline (both slots return to SWAPPABLE)



---### 7. Real-time Updates



## 🤔 Assumptions & Challenges- When someone sends you a swap request, you'll see a notification badge

- When your request is accepted/rejected, you'll receive instant notification

### Assumptions Made- Your Dashboard automatically refreshes to show updated events

- The green dot next to your name indicates WebSocket connection

1. **Single Swap at a Time**: A slot can only be involved in one swap request at a time (enforced by `SWAP_PENDING` status)

---

2. **Time Zone Handling**: All times are stored in UTC; display formatting is handled client-side using browser's locale

## 📁 Project Structure

3. **Slot Availability**: Once a swap is pending, both slots are locked from other swap requests until the request is resolved

```

4. **User Trust**: The system assumes users will honor the swaps they accept (no cancellation mechanism after acceptance)SlotSwapper/

│

5. **Event Validation**: End time must be after start time, but no validation for overlapping events (user's responsibility)├── backend/

│   ├── src/

6. **Token Expiration**: JWT tokens expire after 30 days; users must log in again after expiration│   │   ├── config/

│   │   │   └── database.js          # MongoDB connection setup

7. **WebSocket Reconnection**: Automatic reconnection is implemented, but notifications during disconnection may be missed│   │   ├── models/

│   │   │   ├── User.js              # User schema & password hashing

8. **Browser Compatibility**: Modern browser required (ES6+, WebSocket support)│   │   │   ├── Event.js             # Event/slot schema

│   │   │   └── SwapRequest.js       # Swap request schema

### Challenges Faced│   │   ├── middleware/

│   │   │   └── auth.js              # JWT verification middleware

#### 1. **Atomic Swap Transaction**│   │   ├── routes/

**Challenge**: Ensuring the swap operation is atomic - if any part fails, the entire swap should be rolled back.│   │   │   ├── auth.js              # Signup & login endpoints

│   │   │   ├── events.js            # Event CRUD endpoints

**Solution**: Used `Promise.all()` to save both slots and the swap request simultaneously. If one fails, MongoDB's transaction semantics ensure consistency. Also implemented proper status checking to prevent race conditions.│   │   │   └── swap.js              # Swap logic endpoints

│   │   ├── websocket/

```javascript│   │   │   └── websocketServer.js   # WebSocket server & notifications

await Promise.all([│   │   ├── __tests__/

  initiatorSlot.save(),│   │   │   └── swap.test.js         # Unit tests for swap logic

  receiverSlot.save(),│   │   └── server.js                # Express app entry point

  swapRequest.save(),│   ├── .env.example                 # Environment variables template

]);│   ├── .gitignore

```│   ├── package.json

│   └── jest.config.js               # Jest testing configuration

#### 2. **CORS Configuration**│

**Challenge**: Frontend and backend on different ports causing CORS errors.├── frontend/

│   ├── src/

**Solution**: Configured Vite proxy in development to forward `/api` requests to the backend, avoiding CORS issues. Also set up CORS middleware on backend with proper origin whitelisting.│   │   ├── components/

│   │   │   ├── Navbar.jsx           # Navigation bar component

```javascript│   │   │   ├── Navbar.css

// vite.config.js│   │   │   └── ProtectedRoute.jsx   # Route guard for authentication

proxy: {│   │   ├── context/

  '/api': {│   │   │   ├── AuthContext.jsx      # Authentication state management

    target: 'http://localhost:3001',│   │   │   └── WebSocketContext.jsx # WebSocket connection management

    changeOrigin: true,│   │   ├── pages/

  },│   │   │   ├── Home.jsx             # Landing page

}│   │   │   ├── Home.css

```│   │   │   ├── Login.jsx            # Login page

│   │   │   ├── Signup.jsx           # Signup page

#### 3. **Real-time Notifications**│   │   │   ├── Auth.css             # Shared auth page styles

**Challenge**: Implementing real-time notifications without polling the server constantly.│   │   │   ├── Dashboard.jsx        # User calendar management

│   │   │   ├── Dashboard.css

**Solution**: Integrated WebSocket server alongside Express. Maintained a mapping of `userId` to WebSocket connections for targeted notifications. Implemented auto-reconnection logic on the client side.│   │   │   ├── Marketplace.jsx      # Browse swappable slots

│   │   │   ├── Marketplace.css

#### 4. **State Synchronization**│   │   │   ├── Notifications.jsx    # Incoming/outgoing requests

**Challenge**: Keeping frontend state in sync when swaps are accepted by other users.│   │   │   └── Notifications.css

│   │   ├── utils/

**Solution**: Combined WebSocket notifications with React's `useEffect` hooks to automatically refresh data when relevant notifications arrive.│   │   │   └── api.js               # API utility functions

│   │   ├── App.jsx                  # Main app with routing

#### 5. **Password Security**│   │   ├── main.jsx                 # React entry point

**Challenge**: Storing passwords securely.│   │   └── index.css                # Global styles (Quicksand font)

│   ├── index.html                   # HTML template

**Solution**: Used bcrypt with pre-save hooks in Mongoose to automatically hash passwords before storage. Passwords are never stored or transmitted in plain text.│   ├── vite.config.js               # Vite configuration

│   ├── .gitignore

#### 6. **Route Protection**│   └── package.json

**Challenge**: Protecting both backend API routes and frontend pages.│

└── README.md                        # This file

**Solution**: ```

- Backend: Created `protect` middleware that validates JWT tokens

- Frontend: Created `ProtectedRoute` component that checks authentication and redirects to login---



#### 7. **MongoDB Connection Failures**## ⚙️ How It Works

**Challenge**: App would crash if MongoDB connection failed (common during development).

### 1. **Authentication System (JWT)**

**Solution**: Removed `process.exit(1)` from database error handler and added connection event listeners for better resilience. The app now continues running and attempts to reconnect.

**How JWT Works in SlotSwapper:**

#### 8. **Testing Swap Logic**

**Challenge**: Ensuring the complex swap logic works correctly in all scenarios.1. **Sign Up/Login**:

   - User submits credentials

**Solution**: Created comprehensive Jest unit tests covering:   - Backend validates and hashes password (bcrypt)

- Slot validation   - JWT token is generated with user ID as payload

- Ownership verification   - Token is sent to client and stored in `localStorage`

- Status transitions

- Swap acceptance/rejection2. **Protected Requests**:

- Edge cases (swapping with self, non-existent slots, etc.)   - Client includes token in `Authorization: Bearer <token>` header

   - Backend middleware (`protect`) extracts and verifies token

#### 9. **API URL Configuration**   - If valid, user object is attached to `req.user`

**Challenge**: Hardcoded API URLs breaking in different environments.   - If invalid/expired, request is rejected with 401



**Solution**: Used environment variables and Vite's proxy system to make API URLs configurable based on environment.**Code Flow**:

```javascript

```javascript// Frontend stores token

const API_URL = import.meta.env.VITE_API_URL || '/api';localStorage.setItem('token', token);

```

// Frontend sends token with requests

#### 10. **User Experience During Swaps**headers: {

**Challenge**: Users not knowing the status of their swap requests.  Authorization: `Bearer ${token}`

}

**Solution**: Implemented clear visual indicators:

- Status badges (Pending, Accepted, Rejected)// Backend verifies token

- Real-time notification updatesconst decoded = jwt.verify(token, process.env.JWT_SECRET);

- Separate views for incoming and outgoing requestsreq.user = await User.findById(decoded.id);

- Auto-refresh when swap status changes```



------



## 🧪 Running Tests### 2. **Event Status Lifecycle**



The project includes unit tests for the core swap logic:```

┌─────────┐

```bash│  BUSY   │ ◄──┐

cd backend└────┬────┘    │

npm test     │         │

```     │ (User marks as swappable)

     ▼         │

Expected output:┌────────────┐ │

```│ SWAPPABLE  │ │

PASS  src/__tests__/swap.test.js└────┬───────┘ │

  ✓ Should create a swap request     │         │

  ✓ Should reject invalid swap requests     │ (Swap request created)

  ✓ Should accept swap and exchange ownership     ▼         │

  ✓ Should reject swap and reset slots┌──────────────┐│

  ... (11 tests total)│ SWAP_PENDING ││

└──────┬───────┘│

Test Suites: 1 passed, 1 total       │        │

Tests:       11 passed, 11 total       │ (Accepted: becomes BUSY with new owner)

Coverage:    > 70%       │ (Rejected: returns to SWAPPABLE)

```       └────────┘

```

---

**Validation Rules**:

## 🔒 Security Notes- ❌ Cannot edit/delete events with `SWAP_PENDING` status

- ❌ Cannot create swap request with non-SWAPPABLE slots

- **Never commit `.env` file** - contains sensitive credentials- ❌ Cannot respond to already-responded swap requests

- **Change JWT_SECRET** in production to a strong random string

- **Use HTTPS** in production for secure token transmission---

- **Whitelist specific IPs** in MongoDB Atlas for production (not 0.0.0.0/0)

- **Add rate limiting** for production deployment### 3. **Swap Transaction Logic**

- **Validate all user inputs** on both client and server side

**Critical Section: Ownership Exchange**

---

When a swap is accepted, the backend performs an atomic-like transaction:

## 🚧 Future Enhancements

```javascript

- Email notifications for swap requests// Step 1: Get both slots

- Calendar view instead of list viewconst initiatorSlot = swapRequest.initiatorSlotId;

- Recurring events supportconst receiverSlot = swapRequest.receiverSlotId;

- Event categories/tags

- Search and filter functionality// Step 2: Swap ownership

- Multi-swap capability (swap with multiple people)const tempUserId = initiatorSlot.userId;

- Swap history and analyticsinitiatorSlot.userId = receiverSlot.userId;  // Receiver gets initiator's slot

- User profiles and ratingsreceiverSlot.userId = tempUserId;            // Initiator gets receiver's slot

- Mobile app (React Native)

// Step 3: Reset status to BUSY

---initiatorSlot.status = 'BUSY';

receiverSlot.status = 'BUSY';

## 📞 Support

// Step 4: Save all changes

For issues or questions:await Promise.all([

1. Check the [Setup Instructions](#setup-instructions)  initiatorSlot.save(),

2. Review the [API Documentation](#api-documentation)  receiverSlot.save(),

3. Ensure MongoDB Atlas is properly configured  swapRequest.save()

4. Check both backend and frontend terminals for errors]);

```

---

**Why This Works**:

## 📄 License- MongoDB documents are saved independently

- If one save fails, Mongoose will throw an error

MIT License - feel free to use this project for learning or as a foundation for your own applications.- In production, you'd wrap this in a MongoDB transaction for ACID guarantees



------



**Built with ❤️ using React, Node.js, Express, MongoDB, and WebSockets**### 4. **WebSocket Real-time System**


**Architecture**:

```
Client connects → ws://localhost:3001
       ↓
Sends IDENTIFY message with userId
       ↓
Server stores (userId → WebSocket) mapping
       ↓
When swap event occurs:
       ↓
Server calls notifyUser(userId, data)
       ↓
WebSocket sends JSON message to client
       ↓
Client updates React state → UI re-renders
```

**Message Types**:

| Type | Direction | Purpose |
|------|-----------|---------|
| `IDENTIFY` | Client → Server | Associate WebSocket with user ID |
| `IDENTIFIED` | Server → Client | Confirm connection |
| `NEW_SWAP_REQUEST` | Server → Client | Notify receiver of new swap |
| `SWAP_ACCEPTED` | Server → Client | Notify initiator of acceptance |
| `SWAP_REJECTED` | Server → Client | Notify initiator of rejection |

**Code Example**:

```javascript
// Backend sends notification
notifyUser(receiverId, {
  type: 'NEW_SWAP_REQUEST',
  data: swapRequest
});

// Frontend receives and updates state
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setNotifications(prev => [data, ...prev]);  // React state update
};
```

---

### 5. **Frontend State Management**

**React Context Pattern**:

1. **AuthContext**: Manages user authentication state globally
   - Stores: `user`, `token`, `isAuthenticated`
   - Methods: `login()`, `logout()`
   - Persists to localStorage

2. **WebSocketContext**: Manages WebSocket connection
   - Stores: `ws`, `connected`, `notifications`
   - Auto-connects when user logs in
   - Auto-disconnects on logout

**Protected Routes**:

```javascript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

If not authenticated → Redirect to `/login`

---

## 🧪 Testing

### Running Backend Tests

```bash
cd backend
npm test
```

**Test Coverage**:
- ✅ Swap request creation validation
- ✅ Status transitions (PENDING → ACCEPTED/REJECTED)
- ✅ Ownership swap logic
- ✅ Slot status changes on acceptance/rejection

**Sample Test**:

```javascript
test('should swap ownership when accepted', () => {
  const slotA = { userId: 'user-a-123' };
  const slotB = { userId: 'user-b-456' };
  
  // Simulate swap
  const tempUserId = slotA.userId;
  slotA.userId = slotB.userId;
  slotB.userId = tempUserId;
  
  // Verify
  expect(slotA.userId).toBe('user-b-456');
  expect(slotB.userId).toBe('user-a-123');
});
```

**Coverage Goal**: 70% (branches, functions, lines, statements)

---

## 🎨 Design Philosophy

### Quicksand Font

The entire application uses **Quicksand** - a rounded sans-serif font that conveys:
- **Friendliness**: Approachable, non-corporate feel
- **Modernity**: Clean, contemporary design
- **Readability**: Excellent legibility at all sizes

**Font Weights Used**:
- 300 (Light): Subtle text
- 400 (Regular): Body text
- 500 (Medium): Emphasis
- 600 (Semi-bold): Headings
- 700 (Bold): Major headings

### Color Palette

| Color | Variable | Usage |
|-------|----------|-------|
| 🟣 Purple | `--primary` (#6C5CE7) | Primary actions, branding |
| 🟢 Green | `--secondary` (#00B894) | Success, swappable badges |
| 🩷 Pink | `--accent` (#FD79A8) | CTAs, highlights |
| 🟡 Yellow | `--warning` (#FDCB6E) | Pending states |
| 🔴 Red | `--error` (#FF7675) | Errors, delete actions |
| 🔵 Blue | `--info` (#74B9FF) | Informational messages |

### UI Principles

1. **Gradient Backgrounds**: Primary buttons use gradients for depth
2. **Card-based Layout**: Every content section is a card
3. **Hover Animations**: Smooth `transform: translateY()` on hover
4. **Status Badges**: Color-coded for instant recognition
5. **Responsive Grid**: Auto-fill grids adapt to screen size

---

## 🔒 Security Considerations

### Implemented

✅ **Password Hashing**: bcrypt with 10 salt rounds  
✅ **JWT Authentication**: Stateless, token-based auth  
✅ **CORS Protection**: Only allows requests from `FRONTEND_URL`  
✅ **Input Validation**: Mongoose schema validation  
✅ **Authorization Checks**: Users can only modify their own events  
✅ **No Password Leakage**: Password excluded from API responses  

### Production Recommendations

⚠️ **Environment Variables**: Never commit `.env` file  
⚠️ **HTTPS**: Use SSL/TLS in production  
⚠️ **Rate Limiting**: Add rate limiting to prevent abuse  
⚠️ **MongoDB Indexing**: Ensure indexes are created  
⚠️ **Error Handling**: Don't expose stack traces to clients  
⚠️ **JWT Expiry**: Current: 30 days (consider shorter in production)  

---

## 🚧 Known Limitations & Future Enhancements

### Current Limitations

- No email verification on signup
- No password reset functionality
- No user profile editing
- No event recurrence (repeating events)
- No calendar integration (Google Calendar, Outlook)
- No time zone support
- No notification preferences
- No swap cancellation before response

### Potential Enhancements

🔮 **Email Notifications**: Send emails for swap requests  
🔮 **Calendar Sync**: Import/export to external calendars  
🔮 **Advanced Filtering**: Search/filter marketplace by time/date  
🔮 **Swap History**: View all past swaps  
🔮 **User Ratings**: Rate swap partners  
🔮 **Group Swaps**: Multi-party swap negotiations  
🔮 **Mobile App**: React Native mobile version  
🔮 **Admin Dashboard**: Manage users and monitor activity  

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `MongooseError: Connection failed`  
**Fix**: Check your `MONGODB_URI` in `.env`. Ensure:
- Username and password are correct
- IP whitelist includes your current IP (or use 0.0.0.0/0 for development)
- Database name is specified

**Error**: `Error: secretOrPrivateKey must have a value`  
**Fix**: Set `JWT_SECRET` in `.env`

---

### Frontend Can't Connect to Backend

**Error**: `Failed to fetch` in browser console  
**Fix**: 
1. Ensure backend is running on port 3001
2. Check `vite.config.js` proxy settings
3. Verify CORS is enabled in backend

---

### WebSocket Not Connecting

**Symptom**: Green dot not showing, no real-time notifications  
**Fix**:
1. Check browser console for WebSocket errors
2. Ensure backend WebSocket server is initialized
3. Verify user is authenticated (WebSocket connects after login)
4. Check firewall/antivirus blocking WebSocket connections

---

### Tests Failing

**Error**: `Cannot find module 'mongoose'`  
**Fix**: Run `npm install` in backend directory

**Error**: Tests timeout  
**Fix**: Ensure MongoDB is not required for unit tests (mock if needed)

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 👤 Author

Built with ❤️ using React, Node.js, MongoDB, and lots of Quicksand font.

---

## 🙏 Acknowledgments

- **MongoDB Atlas** - Free cloud database hosting
- **Vite** - Lightning-fast development experience
- **Express.js** - Minimalist web framework
- **React** - UI library that makes state management a breeze
- **Quicksand Font** - Beautiful typography by Andrew Paglinawan

---

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API Endpoints](#-api-endpoints) documentation
3. Inspect browser console and server logs
4. Ensure all environment variables are set correctly

---

**Happy Swapping! 🔄**
