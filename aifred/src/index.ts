import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
} from "@covalenthq/ai-agent-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";

// Create a versatile creative writing tool
const creativeTool = new DynamicStructuredTool({
    name: "createContent",
    description: "Creates various types of creative content",
    schema: {
        type: "object",
        properties: {
            contentType: {
                type: "string",
                description: "Type of content (poem, story, essay, description)",
            },
            style: {
                type: "string",
                description: "Style of writing (formal, casual, specific forms like haiku/sonnet)",
            },
            topic: {
                type: "string",
                description: "Main topic or theme",
            },
            length: {
                type: "string",
                description: "Desired length (short, medium, long)",
            },
            tone: {
                type: "string",
                description: "Emotional tone (happy, serious, melancholic, etc.)",
            }
        },
        required: ["contentType", "topic"],
    },
    func: async ({ contentType, style, topic, length, tone }) => {
        const model = new ChatOpenAI({ modelName: "gpt-4", temperature: 0.7 });
        const prompt = `Create a ${contentType} about ${topic}${style ? ` in ${style} style` : ''}${length ? ` that is ${length}` : ''}${tone ? ` with a ${tone} tone` : ''}.`;
        const response = await model.invoke(prompt);
        return response.content;
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0.7 });
    const tools = [creativeTool];

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a creative writer. Your task is to create various types of content using the createContent tool.",
        ],
        ["human", "Create content based on this request: {input}"],
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
    id: "content-creator",
    description: "Creates various types of creative content",
    schema: z.object({
        prompt: z.string().describe("The complete content creation request"),
    }),
    execute: async () => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: {
                contentType: "poem",
                style: "sonnet",
                topic: "the beauty of changing seasons in nature",
                length: "medium",
                tone: "contemplative"
            }
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
    description: "An agent that writes creative poems",
    tools: {
        langChainAnalysis: langChainTool,
    },
});

const zee = new ZeeWorkflow({
    description:
        "Write a poem. The style should be sonnet and the topic should be about the beauty of changing seasons in nature.",
    output: "A creative poem",
    agents: { agent3 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
