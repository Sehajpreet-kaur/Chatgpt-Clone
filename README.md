MyGPT: ChatGPT Clone

A ChatGPT-style chat application built with React and Node.js/Express. The backend works as a secure proxy to the Groq API (Llama 3.3 70B), so the API key is never exposed to the browser. Each chat keeps its own conversation memory, so the model remembers earlier messages.

Live demo: https://chatgpt-clone-1-bmaw.onrender.com

Features
ChatGPT-inspired dark interface with a sidebar and message feed
Conversation memory: the full chat history is sent with every request
Multiple chat sessions with a sidebar history
First message of each chat becomes its title
Switch between previous chats or start a new one
API key stored securely on the server using environment variables
Input validation and history trimming on the backend
CORS restricted to the deployed frontend origin
Tech Stack
Layer	Technology
Frontend	React 19, Create React App, plain CSS
Backend	Node.js, Express 5, cors, dotenv, nodemon
AI Model	Groq API, llama-3.3-70b-versatile
Deployment	Render
Architecture
┌──────────┐  POST /completions   ┌──────────────┐   HTTPS   ┌───────────┐
│  React   │ ───────────────────▶ │   Express    │ ────────▶ │  Groq API │
│ (browser)│ ◀─────────────────── │  (server.js) │ ◀──────── │ Llama 3.3 │
└──────────┘       JSON           └──────────────┘           └───────────┘
 sends chat history                holds API_KEY,
 + new message                     validates and trims history
The user types a message and clicks send.
React collects the earlier messages of the open chat, adds the new one, and sends them as a messages array to POST /completions.
Express validates the array, keeps only user and assistant roles, trims it to the last 20 messages, and adds a system prompt.
Express attaches the secret Authorization header and forwards the request to Groq.
Groq's response is returned to React, which saves both messages in state and renders them.
Project Structure
.
├── public/
│   ├── index.html        # HTML template
│   ├── manifest.json     # PWA metadata
│   └── robots.txt
├── src/
│   ├── index.js          # React entry point
│   ├── index.css         # All styling
│   └── App.js            # Main component (UI + chat logic)
├── server.js             # Express backend (Groq proxy)
├── package.json
└── .gitignore
Getting Started
Prerequisites
Node.js 18 or later (the backend uses the built-in fetch)
A free API key from Groq Console
1. Clone and install
bash
git clone https://github.com/Sehajpreet-kaur/Chatgpt-Clone.git
cd Chatgpt-Clone
npm install
npm install dotenv   # used by server.js, make sure it is installed
2. Configure environment variables

Create a .env file in the project root:

env
# Backend
API_KEY=your_groq_api_key_here

# Frontend (Create React App only exposes variables starting with REACT_APP_)
REACT_APP_API_URL=http://localhost:8000

.env is listed in .gitignore. Never commit your API key.

3. Allow your local frontend in CORS

In server.js, the allowed origin is set to the deployed site. For local development, change it to:

js
app.use(cors({
    origin: "http://localhost:3000"
}));
4. Run the app

Open two terminals:

bash
# Terminal 1: backend (http://localhost:8000)
npm run start:backend

# Terminal 2: frontend (http://localhost:3000)
npm run start:frontend
Available Scripts
Script	Description
npm run start:frontend	Starts the React dev server on port 3000
npm run start:backend	Starts Express with nodemon (auto-restart)
npm run build	Creates a production build of the frontend
npm test	Runs the test runner
API Reference
POST /completions

Request body

json
{
  "messages": [
    { "role": "user", "content": "My name is Sehaj." },
    { "role": "assistant", "content": "Nice to meet you, Sehaj!" },
    { "role": "user", "content": "What is my name?" }
  ]
}
Field	Type	Description
messages	array	Chat history, oldest first, ending with the new message
role	string	Must be user or assistant (others are discarded)
content	string	The message text

Success response: the Groq chat completion object. The frontend reads choices[0].message:

json
{
  "choices": [
    {
      "message": { "role": "assistant", "content": "Your name is Sehaj." }
    }
  ]
}

Errors

Status	Meaning
400	messages is missing or empty
500	The server could not reach the Groq API
other	Status forwarded from Groq (for example 401, 429)
How It Works
Frontend state (App.js)
State	Purpose
value	Current text in the input box
message	Latest response from the AI
prevChats	Flat array of all messages across all chats
currentTitle	Title of the active chat

Each message in prevChats has the shape { title, role, content }. The active conversation is found by filtering on title, and the sidebar list is built from the unique titles.

Conversation memory

Language model APIs are stateless, so the model only knows what is sent in each request. This app builds the history from the open chat on every send:

js
const history = currentChat.map(({ role, content }) => ({ role, content }));
const messagesToSend = [...history, { role: "user", content: value }];

Memory is per chat: a new chat starts with no history, and switching chats switches what the model remembers.

Backend safeguards (server.js)
Rejects requests without a valid messages array
Accepts only user and assistant roles, so clients cannot inject system prompts
Keeps only the last 20 messages (MAX_HISTORY) to control token usage
Adds a server-side system prompt: "You are a helpful assistant."
Uses max_tokens: 1024 for the reply length
Deployment (Render)
Deploy the backend as a Web Service:
Build command: npm install
Start command: node server.js
Environment variable: API_KEY
Deploy the frontend as a Static Site:
Build command: npm run build
Publish directory: build
Environment variable: REACT_APP_API_URL set to your backend URL
Update the CORS origin in server.js to your frontend URL.
Limitations
Stream responses token by token
Persist chats (localStorage or a database such as MongoDB)
Add loading and error states in the UI
Render markdown and code blocks
Use unique chat IDs instead of titles
Add rate limiting on the backend
Add dotenv to package.json dependencies

Author

Made by Sehajpreet Kaur

License

This project is for learning and portfolio purposes.