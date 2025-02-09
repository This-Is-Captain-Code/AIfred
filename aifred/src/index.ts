import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
} from "@covalenthq/ai-agent-sdk";
import { Tool } from "langchain/tools";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";

// Create a custom LangChain math tool
const poemTool = new DynamicStructuredTool({
    name: "poem_writer",
    description: "Writes poems based on given parameters",
    schema: {
        type: "object",
        properties: {
            topic: {
                type: "string",
                description: "The main topic or theme of the poem",
            },
            style: {
                type: "string",
                description: "Style of poem (haiku, sonnet, free verse, limerick)",
            },
            mood: {
                type: "string",
                description: "The mood or emotion of the poem",
            },
        },
        required: ["topic", "style", "mood"],
    },
    func: async (input: any) => {
        const { topic, style, mood } = input;
        return `Here is a ${style} about ${topic} with a ${mood} mood:\n\n[Generated poem will be created by GPT-4]`;
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0.8 });
    const tools = [poemTool];

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a creative poetry assistant. Use the poem_writer tool to create beautiful poems based on user requests.",
        ],
        ["human", "{input}"],
        ["human", "{agent_scratchpad}"],
    ]);

    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
    });

    return AgentExecutor.fromAgentAndTools({
        agent,
        tools,
        verbose: true,
    });
};

const agent1 = new Agent({
    name: "blockchain-researcher",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description:
        "A blockchain researcher analyzing wallet activities for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet.",
    tools: {
        tokenBalances: new TokenBalancesTool(process.env.GOLDRUSH_API_KEY),
        nftBalances: new NFTBalancesTool(process.env.GOLDRUSH_API_KEY),
        transactions: new TransactionsTool(process.env.GOLDRUSH_API_KEY),
        historicalPrices: new HistoricalTokenPriceTool(
            process.env.GOLDRUSH_API_KEY,
        ),
    },
});

const agent2 = new Agent({
    name: "prateek-panwar",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "give a FUD about the blockchain wallet",
});

const langChainTool = createTool({
    id: "poem-writer",
    description: "Creates poems based on given parameters",
    schema: z.object({
        topic: z.string().describe("Topic or theme of the poem"),
        style: z.string().describe("Style of poem"),
        mood: z.string().describe("Mood or emotion of the poem"),
    }),
    execute: async (params) => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: `Write a ${params.style} poem about ${params.topic} with a ${params.mood} mood`,
        });
        return result.output;
    },
});

const agent3 = new Agent({
    name: "langchain-agent",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "An agent that does mathematics",
    tools: {
        langChainAnalysis: langChainTool,
    },
});

const zee = new ZeeWorkflow({
    description: "A workflow that creates a haiku about nature",
    output: "Poetry creation results",
    agents: { agent3 },
});

(async function main() {
    // Run ZEE workflow with all agents including LangChain
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
