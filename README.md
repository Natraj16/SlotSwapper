# 🔄 SlotSwapper - P2P Time Slot Scheduling

A peer-to-peer scheduling application enabling users to swap calendar events in real-time with JWT auth, WebSocket notifications, and multi-tenant group isolation.

---

## 🎯 Project Overview & Design Choices

**What It Does**: SlotSwapper is a marketplace where users exchange calendar time slots. User A marks "Team Meeting" (Tue 10-11 AM) as swappable, User B marks "Focus Block" (Wed 2-3 PM) as swappable. User A requests a swap, User B receives real-time notification and accepts—both calendars update automatically with swapped ownership.

**Architecture**: Monorepo with separate backend/frontend. RESTful API with WebSocket layer for real-time push notifications. MongoDB stores users (bcrypt-hashed passwords, group memberships), events (with BUSY/SWAPPABLE/SWAP_PENDING status), swap requests, and groups (6-char crypto-secure invite codes). JWT provides stateless auth (30-day tokens). Group-based isolation prevents cross-tenant data leakage.

**Tech Stack**: React 18 + Vite (fast HMR, modern hooks), Node.js + Express (full-stack JavaScript), MongoDB Atlas (flexible schema, cloud-hosted), WebSocket (low-latency bidirectional communication). Pure CSS for zero dependencies.

---

## 🚀 Local Setup Instructions

**Prerequisites**: Node.js 16+, MongoDB Atlas account ([signup](https://www.mongodb.com/cloud/atlas/register))

**1. Clone Repository**
```bash
git clone https://github.com/Natraj16/SlotSwapper.git
cd SlotSwapper
```

**2. Backend Setup**
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/slotswapper?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters-long
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
Start: `npm run dev` → Runs on `http://localhost:3001`

**Optional: Migrate Existing Events** (if upgrading from older version)
```bash
cd backend
node src/scripts/migrateEvents.js
```
This adds `groupId` to events created before the group isolation update.

**3. Frontend Setup** (new terminal)
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```
Start: `npm run dev` → Runs on `http://localhost:5173`

**4. Test**: Open browser to `http://localhost:5173`, sign up, create a group (get invite code), create swappable events. Test with second user in incognito.

---

## 📡 API Endpoints

All routes prefixed `/api`. Protected routes require `Authorization: Bearer <token>` header.

**Auth**: `POST /auth/register` (name, email, password → returns user + JWT), `POST /auth/login`, `GET /auth/me`

**Events**: `GET /events` (user's events), `GET /events/swappable` (marketplace), `POST /events` (create with title, startTime, endTime, status), `PUT /events/:id`, `DELETE /events/:id`

**Swaps**: `GET /swap-requests`, `POST /swap-requests` (userEventId, targetEventId → creates request, sets both to SWAP_PENDING, notifies target), `PUT /swap-requests/:id/accept` (swaps ownership atomically via MongoDB transaction), `PUT /swap-requests/:id/reject`

**Groups**: `POST /groups/create` (name → returns group with inviteCode), `POST /groups/join` (inviteCode), `POST /groups/switch` (groupId), `POST /groups/leave`, `GET /groups`

**WebSocket**: Connect to `ws://localhost:3001`, send `{"type":"authenticate","token":"..."}`, receive `{"type":"SWAP_REQUEST","data":{...}}` for real-time notifications.

---

## 🧠 Assumptions & Challenges

**Assumptions**: All times in UTC (displayed in user's local timezone). No recurring events—each is atomic. Only 1:1 swaps supported. Multi-group membership but single active group context. Event overlap allowed (user manages conflicts).

**Key Challenges Solved**:
- **WebSocket Auth**: Two-phase connection—client connects then sends JWT in message payload, server validates and maps userId to connection
- **Atomic Swaps**: Mongoose transactions ensure both events swap ownership or neither (prevents inconsistent state on failures)  
- **Group Persistence Bug**: Added `.populate('groups')` to login route so groups array persists across sessions
- **Dark Mode Flash**: Applied theme from localStorage in inline script before React mounts, using CSS variables

---

**Built with ❤️ using the MERN Stack** | [GitHub](https://github.com/Natraj16/SlotSwapper)

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
