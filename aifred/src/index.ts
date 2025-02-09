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
const mathTool = new DynamicStructuredTool({
    name: "calculator",
    description: "Performs mathematical calculations",
    schema: {
        type: "object",
        properties: {
            operation: {
                type: "string",
                description:
                    "Mathematical operation (add, subtract, multiply, divide, power)",
            },
            num1: { type: "number", description: "First number" },
            num2: { type: "number", description: "Second number" },
        },
        required: ["operation", "num1", "num2"],
    },
    func: async (input: any) => {
        const { operation, num1, num2 } = input;
        switch (operation.toLowerCase()) {
            case "add":
                return num1 + num2;
            case "subtract":
                return num1 - num2;
            case "multiply":
                return num1 * num2;
            case "divide":
                return num2 !== 0 ? num1 / num2 : "Cannot divide by zero";
            case "power":
                return Math.pow(num1, num2);
            default:
                return "Invalid operation";
        }
    },
});

// Create LangChain agent
const createLangChainAgent = async () => {
    const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
    const tools = [mathTool];

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a math assistant. Use the calculator tool to perform mathematical operations.",
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
    id: "math-calculator",
    description: "Performs mathematical calculations",
    schema: z.object({
        operation: z.string().describe("Mathematical operation"),
        num1: z.number().describe("First number"),
        num2: z.number().describe("Second number"),
    }),
    execute: async (params) => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
            input: `Perform ${params.operation} on ${params.num1} and ${params.num2}`,
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
        langChainAnalysis: langChainTool,
    },
});

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data for the address 0x883b3527067F03fD9A581D81020b17FC0d00784F on base-mainnet and summarizes it in one sentence and then does math on it to multiply the balance by 5",
    output: "Blockchain analysis results",
    agents: { agent1, agent2, agent3 },
});

(async function main() {
    // Run ZEE workflow with all agents including LangChain
    const result = await ZeeWorkflow.run(zee);
    console.log("ZEE Result:", result);
})();
