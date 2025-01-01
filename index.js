import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { retriever } from '/utils/retriever'

document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
}) 

const openAIApiKey = process.env.OPENAI_API_KEY
const llm = new ChatOpenAI({ openAIApiKey })

const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
question: {question}
answer: 
`

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

function combineDocuments(docs){
    return docs.map((doc)=>doc.pageContent).join('\n\n')
}

const chain = standaloneQuestionPrompt.pipe(llm).pipe(new StringOutputParser()).pipe(retriever).pipe(combineDocuments)

const response = await chain.invoke({
    question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
})

console.log(response)

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

    // add AI message
    const newAiSpeechBubble = document.createElement('div')
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = result
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
}