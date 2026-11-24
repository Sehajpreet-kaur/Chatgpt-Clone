const PORT = 8000;
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cors({
    origin: "https://chatgpt-clone-1-bmaw.onrender.com"
}));

const API_KEY = process.env.API_KEY;

// Only the most recent messages are sent to the model, to stay within token limits
const MAX_HISTORY = 20;

app.post('/completions', async (req, res) => {
    const { messages } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "A non-empty 'messages' array is required" });
    }

    const history = messages
        .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map(m => ({ role: m.role, content: m.content }))
        .slice(-MAX_HISTORY);


    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...history
            ],
            max_tokens: 1024,
        })
    };

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', options);
        const data = await response.json();
        res.status(response.status).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => console.log("Your server is running on PORT " + PORT));
