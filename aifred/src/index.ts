
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

// Create a custom LangChain tool
const imageGenerationTool = new DynamicStructuredTool({
    name: "generate_image",
    description: "Generates an image based on a description",
    schema: {
        type: "object",
        properties: {
            prompt: { type: "string", description: "Description of the image to generate" },
        },
        required: ["prompt"],
    },
    func: async (input: unknown) => {
        if (typeof input === 'object' && input !== null && 'prompt' in input && typeof (input as { prompt: string }).prompt === 'string') {
            const openai = new ChatOpenAI({ modelName: "gpt-4-vision-preview" });
            const response = await openai.invoke([{
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${await openai.images.generate({
                        model: "dall-e-3",
                        prompt: (input as { prompt: string }).prompt,
                        size: "1024x1024",
                        quality: "standard",
                        n: 1,
                    }).then(res => res.data[0].url)}`
                }
            }]);
            console.log("Generated image:", response);
            return response;
        }
        throw new Error('Invalid input: prompt must be a string');
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    const tools = [imageGenerationTool];
    
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a crypto wallet analyzer. Use the tools to analyze wallets."],
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
    id: "langchain-analysis",
    description: "Analyzes cryptocurrency wallet using LangChain",
    schema: z.object({
        address: z.string().describe("Wallet address to analyze")
    }),
    execute: async (params) => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: `Analyze the wallet ${params.address}`,
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
    description: "An agent that uses LangChain for wallet analysis",
    tools: {
        langChainAnalysis: langChainTool
    },
});

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet and summarizes it in one sentence with the total balance it holds and FUDs it",
    output: "Blockchain analysis results",
    agents: { agent1, agent2, agent3 },
});

(async function main() {
    // Run ZEE workflow with all agents including LangChain
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
