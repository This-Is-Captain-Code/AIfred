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
import { Tool } from "@langchain/core/tools";
import "dotenv/config";

// Custom LangChain FUD Generator Tool
class LangChainFUDTool extends Tool {
    private chain: any;

    constructor() {
        super({
            name: "langchain-fud",
            description: "Generates FUD using LangChain analysis",
            _execute: async (input: string) => this._call(input),
        });

        const llm = new OpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.9,
        });

        const prompt = PromptTemplate.fromTemplate(
            "Generate intense FUD about this blockchain analysis: {input}",
        );

        this.chain = prompt.pipe(llm);
    }

    /** @ignore */
    protected async _call(input: string): Promise<string> {
        return this.chain.invoke({ input });
    }
}

// Create a custom tool instance that implements the required interface
const langchainFUDTool = new Tool({
    name: "langchain-fud",
    description: "Generates FUD using LangChain analysis",
    func: async (input: string) => {
        const llm = new OpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.9,
        });

        const prompt = PromptTemplate.fromTemplate(
            "Generate intense FUD about this blockchain analysis: {input}",
        );

        const chain = prompt.pipe(llm);
        return chain.invoke({ input });
    },
});

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
        langchainFUD: langchainFUDTool,
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
