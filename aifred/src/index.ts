import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
    createTool,
} from "@covalenthq/ai-agent-sdk";
import { OpenAI } from "@langchain/openai";
import { ToolParams, Tool } from "@langchain/core/tools";
import "dotenv/config";

// Create a LangChain tool
import { z } from "zod";

const companyReportTool = createTool({
    id: "get-company-report",
    description: "This tool is used to get the current state of the company",
    schema: z.object({}),
    execute: async (params) => {
        return "The current state of the company is good";
    },
});

// Initialize LangChain model and tools
const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4",
    temperature: 0,
});

// Create additional LangChain tools array
const tools = [companyReportTool];

// Create LangChain agent using tools
const langchainAgent = await initializeAgent(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
});

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
        companyReport: companyReportTool,
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

const zee = new ZeeWorkflow({
    description: "A workflow that analyzes blockchain data and company reports",
    output: "Combined analysis results",
    agents: { agent1, agent2 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
