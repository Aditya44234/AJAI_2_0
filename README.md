# AJAI 2.0

AJAI 2.0 is a full-stack AI chat assistant built with Next.js, React, Tailwind CSS, MongoDB, and multiple LLM providers. It offers a focused chat interface with user authentication, guest mode, chat history, personality-based responses, and provider fallback across Gemini and Groq.

Live Project: [https://ajai20.vercel.app/](https://ajai20.vercel.app/)

Repository: [https://github.com/Aditya44234/AJAI_2_0](https://github.com/Aditya44234/AJAI_2_0)

## Overview

AJAI 2.0 is designed as a personalized AI assistant with a clean chat-first UI. Users can start conversations instantly as guests or create an account to save their chat history. The application stores chats and messages in MongoDB and routes prompts through integrated language model providers.

The project combines:

- a responsive chat UI
- cookie-based authentication
- temporary guest sessions
- personality-driven prompt shaping
- chat persistence and history retrieval
- LLM provider fallback

## Features

- Responsive chat interface with sidebar, message history, and fixed input bar
- Authentication with login, registration, and logout
- Guest usage through temporary cookie-based identity
- Persistent chat history for logged-in users
- Multiple AI personality modes
- AI response generation through Gemini and Groq integrations
- Provider fallback logic in case one model fails
- Daily usage limiting for guests and logged-in users
- Markdown rendering for assistant responses
- Profile modal showing user information, selected personality, and current time

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- MongoDB with Mongoose
- JWT authentication via cookies
- Gemini API
- Groq API
- Vercel Analytics

## Personality Modes

The assistant supports multiple personalities to change tone and style of responses. Personalities are defined in `src/constants/personalities.ts`.

Current modes include:

- `default`
- `happy`
- `hopeful`
- `rude`
- `aggressive`
- `mentor`

## Project Structure

```text
AJAI_2_0/
├── app/
│   ├── api/                 # Next.js API routes
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── globals.css          # Global app styling
│   ├── layout.tsx           # Root layout and providers
│   └── page.tsx             # Main chat page
├── components/              # Chat UI, profile modal, shared components
├── context/                 # Auth, chat, and UI state providers
├── hooks/                   # Custom hooks
├── lib/                     # Utility helpers
├── public/                  # Static assets
├── services/                # Client-side API wrappers
├── src/
│   ├── config/              # DB and env-related setup
│   ├── constants/           # Personalities and constants
│   ├── llms/                # LLM provider implementations
│   ├── middleware/          # Auth and CORS helpers
│   ├── models/              # Mongoose models
│   ├── services/            # Server-side business logic
│   ├── types/               # Shared server types
│   └── utils/               # JWT, hashing, temp user, title helpers
├── styles/                  # Additional styles
├── types/                   # Shared client types
└── README.md
```

## Core Flow

### 1. Authentication

- Users can register and log in through API routes under `app/api/auth`
- Successful login stores a JWT in an HTTP-only cookie
- Current user information is loaded on app startup through the auth context

### 2. Guest Mode

- If a user is not logged in, the app creates a temporary guest identity
- Guest chats are tracked through a cookie-based temporary ID
- Guest users can use the product immediately without creating an account

### 3. Chat Handling

- Users submit a message from the chat input
- The message is sent to `app/api/chat/send/route.ts`
- The server checks authentication or guest identity
- Daily usage is validated
- A new chat is created if needed
- The user message is saved to MongoDB
- Message history is prepared and combined with the selected personality prompt
- The server tries the configured model providers
- The final AI reply is saved and returned to the client

### 4. Chat History

- Chat titles are generated from the first user message
- Chats are listed in the sidebar
- Each chat can be reopened from saved history

## LLM Integration

The app currently uses:

- Gemini
- Groq

Provider routing is handled through the server layer, where the system tries available providers in sequence and returns the first successful reply.

Relevant files:

- `src/llms/gemini.ts`
- `src/llms/groq.ts`
- `src/llms/index.ts`
- `src/services/modelRouter.service.ts`

## API Routes

### Auth

- `POST /api/auth/register` - create a new user account
- `POST /api/auth/login` - authenticate a user
- `POST /api/auth/logout` - clear auth cookie
- `GET /api/auth/me` - return the current authenticated user

### Chat

- `POST /api/chat/send` - send a message and receive an AI reply
- `GET /api/chat/list` - fetch recent chats
- `GET /api/chat/[chatId]` - fetch messages for a specific chat

## Environment Variables

Create a `.env.local` file in the project root with the required keys:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key_optional
BASE_URL=http://localhost:3000
```

Notes:

- `OPENAI_API_KEY` is optional in the current code path
- `BASE_URL` can be adjusted depending on your local environment

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Aditya44234/AJAI_2_0.git
cd AJAI_2_0
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create `.env.local` and add the required keys listed above.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint

## UI Notes

The UI is built around a dark brown theme and a chat-focused layout:

- left sidebar for recent chats and personality selection
- center chat window for messages
- fixed input area for message entry
- profile badge and modal in the header

Assistant responses support Markdown rendering, which makes formatted answers easier to read.

## Database Models

The main MongoDB collections are:

- `User`
- `Chat`
- `Message`
- `Usage`

These models support authentication, chat persistence, message history, and daily rate limiting.

## Current Strengths

- clean separation between client and server logic
- reusable context-based state management
- practical guest-to-authenticated workflow
- straightforward API route design
- good base for future streaming and model improvements

## Possible Future Improvements

- token streaming for real-time responses
- explicit model selection in the UI
- better analytics around usage and provider performance
- improved test coverage
- stronger lint and CI setup
- richer chat management actions such as rename and delete

## Author

Built by Aditya Joshi.

If you use or extend this project, consider starring the repository:

[https://github.com/Aditya44234/AJAI_2_0](https://github.com/Aditya44234/AJAI_2_0)
