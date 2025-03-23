import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { HumanChatMessage } from "langchain/schema";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

// 1) Initialize your ChatOpenAI model
const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-4-turbo",
});

// 2) Build a string-based prompt
// We rely on placeholders like {features}
const prompt = new PromptTemplate({
    template: `You are a sign language assistant giving hand pose advice to ASL learners.
Given the user's hand pose feature report, compare it to the expected pose and give helpful, concise corrections. Dont list numbers, use quantifiers like big or small.
Focus on semantic aspects: finger curls, finger spreads, and palm openness. Format in bullet points. No intro, no conclusion.

User pose features:
{features}
`,
    inputVariables: ["features"],
});

// 3) Create an LLMChain (the container for model + prompt)
const chain = new LLMChain({
    llm: model,
    prompt,
});

// 4) Express route
app.post("/feedback", async (req, res) => {
    try {
        const { features } = req.body; // string, e.g. "- Index Finger Curl: 0.8..."
        // feed to the chain
        const response = await chain.call({ features });
        // In older versions, final text is in 'response.text' or 'response.output'
        return res.json({ advice: response.text });
    } catch (err) {
        console.error("LLM Error:", err);
        return res.status(500).send("Error generating feedback");
    }
});

app.listen(PORT, () => {
    console.log(`LLM feedback server running on http://localhost:${PORT}`);
});
