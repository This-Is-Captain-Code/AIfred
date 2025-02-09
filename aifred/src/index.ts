import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
} from "@covalenthq/ai-agent-sdk";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import "dotenv/config";

// Custom LangChain FUD Generator Tool
class LangChainFUDTool implements Tool {
    id = "langchain-fud";
    _schema = {
        type: "object",
        properties: {
            analysis: { type: "string" }
        },
        required: ["analysis"]
    };
    _description = "Generates FUD using LangChain analysis";
    private chain: any;

    constructor() {
        const llm = new OpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.9,
        });

        const prompt = PromptTemplate.fromTemplate(
            "Generate intense FUD about this blockchain analysis: {analysis}",
        );

        this.chain = prompt.pipe(llm);
    }

    async _execute(input: { analysis: string }): Promise<string> {
        return this.chain.invoke(input);
    }
}

// Original Agents
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
    description: "Give a FUD about the blockchain wallet",
});

// New LangChain-powered Agent
const agent3 = new Agent({
    name: "langchain-fud-specialist",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "Generates advanced FUD using LangChain analysis",
    tools: {
        langchainFUD: new LangChainFUDTool(),
    },
});

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet, summarizes it, and generates enhanced FUD using LangChain",
    output: "Blockchain analysis with LangChain-enhanced FUD",
    agents: { agent1, agent2, agent3 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
