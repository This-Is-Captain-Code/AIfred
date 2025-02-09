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

// Create a custom LangChain poem tool
const poemTool = new DynamicStructuredTool({
    name: "writePoem",
    description: "Writes a poem based on given parameters",
    schema: {
        type: "object",
        properties: {
            topic: {
                type: "string",
                description: "The main topic or theme of the poem"
            },
            style: {
                type: "string",
                description: "Style of poem (haiku, sonnet, free verse, limerick)"
            }
        },
        required: ["topic", "style"]
    },
    func: async (input: any) => {
        return `Generated a ${input.style} about ${input.topic}`;
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0.7 });
    const tools = [poemTool];

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a creative poet. Use the writePoem tool to create beautiful poems based on given topics and styles.",
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
    description: "Creates poems in various styles",
    schema: z.object({
        topic: z.string().describe("Topic or theme for the poem"),
        style: z.string().describe("Style of poem to generate"),
    }),
    execute: async (params) => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: `Write a ${params.style} poem about ${params.topic}`,
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
    description: "A workflow that generates creative poems about nature and seasons",
    output: "Generated poem",
    agents: { agent3 },
});

(async function main() {
    const topic = "Nature - The beauty of the changing seasons";
    const style = "sonnet";
    await agent3.addMessage(`Write a ${style} poem about ${topic}`);
    // Run ZEE workflow with all agents including LangChain
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
