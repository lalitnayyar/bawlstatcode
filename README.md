# Getting Started
Install the dependencies and run the project
```
npm install
npm start
```

Head over to https://vitejs.dev/ to learn more about configuring vite

# Project Overview

This project is a chatbot application that uses OpenAI's language model to answer user questions. The application is built using Vite, Express, and Langchain.

## Files

### `vite.config.js`

This file configures Vite to use environment variables from a `.env` file.

```javascript
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    // ...existing code...
  ],
  server: {
    port: process.env.VITE_PORT || 3000,
    // ...existing code...
  },
  // ...existing code...
  define: {
    'process.env': { ...process.env }
  }
});
```

### `server.js`

This file sets up an Express server to handle saving responses to a file.

```javascript
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/save-response', (req, res) => {
    const { output } = req.body;
    if (!output) {
        console.error('No output provided');
        return res.status(400).send('No output provided');
    }
    const filePath = path.join(__dirname, 'output.md');
    fs.appendFileSync(filePath, output);
    res.status(200).send('Response saved');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

### `index.js`

This file contains the main logic for the chatbot application. It uses Langchain to create a sequence of operations that convert a user's question into a standalone question, retrieve context, and generate an answer.

```javascript
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { retriever } from '/utils/retriever'
import { combineDocuments } from '/utils/combineDocuments'
import { RunnablePassthrough, RunnableSequence } from "langchain/schema/runnable"
import { formatConvHistory } from '/utils/formatConvHistory'

document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
})

/**
 * Super Challenge:
 * 
 * 1. Pass convHistory into the chain as conv_history at 
 *    the point where we invoke it. Remember to make use 
 *    of our formatConvHistory function!
 * 2. Update the standaloneQuestionTemplate to make use 
 *    of convHistory. 
 * 3. Make sure the answerChain has access to convHistory 
 *    and edit answerTemplate to make use of it.
 * 4. Test by giving the chatbot some information and 
 *    checking in the next question to see if it remembers it.
 * 
 * */ 

const openAIApiKey = process.env.OPENAI_API_KEY
const llm = new ChatOpenAI({ openAIApiKey })

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer: `
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const retrieverChain = RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
])
const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
    {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
    },
    answerChain
])

const convHistory = []

async function progressConversation() {
    const userInput = document.getElementById('user-input')
    const chatbotConversation = document.getElementById('chatbot-conversation-container')
    const question = userInput.value
    userInput.value = ''

    // add human message
    const newHumanSpeechBubble = document.createElement('div')
    newHumanSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newHumanSpeechBubble)
    newHumanSpeechBubble.textContent = question
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    const response = await chain.invoke({
        question: question,
        conv_history: formatConvHistory(convHistory)
    })
    convHistory.push(question)
    convHistory.push(response)

    // add AI message
    const newAiSpeechBubble = document.createElement('div')
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = response
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
}
```

## Functionality

1. **Vite Configuration**: The `vite.config.js` file configures the Vite development server to use environment variables from a `.env` file. This allows you to set the server port and other configuration options using environment variables.

2. **Express Server**: The `server.js` file sets up an Express server to handle saving responses to a file. When a POST request is made to the `/save-response` endpoint, the server saves the response to `output.md`.

3. **Chatbot Logic**: The `index.js` file contains the main logic for the chatbot application. It uses Langchain to create a sequence of operations that convert a user's question into a standalone question, retrieve context, and generate an answer. The response is then displayed in the chatbot conversation and sent to the server to be saved in `output.md`.

4. **Conversation History**: The chatbot maintains a conversation history to provide context for future questions. The conversation history is passed into the Langchain sequence to help generate more accurate responses based on previous interactions.

## About Scrimba

At Scrimba our goal is to create the best possible coding school at the cost of a gym membership! 💜
If we succeed with this, it will give anyone who wants to become a software developer a realistic shot at succeeding, regardless of where they live and the size of their wallets 🎉
The Frontend Developer Career Path aims to teach you everything you need to become a Junior Developer, or you could take a deep-dive with one of our advanced courses 🚀

- [Our courses](https://scrimba.com/allcourses)
- [The Frontend Career Path](https://scrimba.com/learn/frontend)
- [Become a Scrimba Pro member](https://scrimba.com/pricing)

Happy Coding!

Question to ask : How long does it take to get a code review for a solo project?