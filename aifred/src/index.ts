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
            "You are a creative poet. Your task is to write beautiful poems using the writePoem tool.",
        ],
        ["human", "Write a poem based on this request: {input}"],
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
        prompt: z.string().describe("The complete poem request"),
    }),
    execute: async () => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: "Write a sonnet about the beauty of changing seasons in nature",
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
    description: "Write a poem. The style should be sonnet and the topic should be about the beauty of changing seasons in nature.",
    output: "A creative poem",
    agents: { agent3 },
    onAgentComplete: async (result) => {
        if (result.agent === "agent3") {
            return { output: result.output };
        }
        return result;
    }
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log("Final Poem:", result.output);
})();
