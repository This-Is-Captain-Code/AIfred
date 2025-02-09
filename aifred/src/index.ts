
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

// Create a custom LangChain tool
const cryptoAnalysisTool = new DynamicStructuredTool({
    name: "crypto_analysis",
    description: "Analyzes cryptocurrency wallet activity",
    schema: {
        type: "object",
        properties: {
            address: { type: "string", description: "Wallet address to analyze" },
        },
        required: ["address"],
    },
    func: async (input: { address: string }): Promise<string> => {
        // Add your analysis logic here
        return `Analysis completed for address ${input.address}`;
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    const tools = [cryptoAnalysisTool];
    
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a crypto wallet analyzer. Use the tools to analyze wallets."],
        ["human", "{input}"],
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

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet and summarizes it in one sentence with the total balance it holds and FUDs it",
    output: "Blockchain analysis results",
    agents: { agent1, agent2 },
});

(async function main() {
    // Create and run LangChain agent
    const langChainAgent = await createLangChainAgent();
    const langChainResult = await langChainAgent.invoke({
        input: "Analyze the wallet 0x883b3527067F03fD9A581D81020b17FC0d00784F",
    });
    console.log("LangChain Analysis:", langChainResult);

    // Run ZEE workflow
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
