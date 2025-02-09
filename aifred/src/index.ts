import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
} from "@covalenthq/ai-agent-sdk";
import "dotenv/config";

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

import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChainTool } from "langchain/tools";

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4",
    temperature: 0
});

const toolKit = new ChainTool({
    name: "blockchain-analyzer",
    description: "Analyzes blockchain data and provides insights",
    chain: async (input: string) => {
        return `Analysis result for: ${input}`;
    }
});

const executor = await initializeAgentExecutorWithOptions(
    [toolKit],
    model,
    {
        agentType: "chat-conversational-react-description",
        verbose: true
    }
);

const agent3 = {
    name: "executor-agent",
    description: "An agent that executes blockchain analysis",
    config: {},
    llm: model,
    _tools: [toolKit],
    run: executor.call.bind(executor)
} as Agent;

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet and summarizes it in one sentence with the total balance it holds and FUDs it",
    output: "Blockchain analysis results",
    agents: { agent1, agent2, agent3 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
