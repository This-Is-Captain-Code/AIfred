
import {
    Agent,
    ZeeWorkflow,
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
} from "@covalenthq/ai-agent-sdk";
import { Tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import "dotenv/config";

class CompanyReportTool extends Tool {
    name = "get-company-report";
    description = "This tool is used to get the current state of the company";

    async _call() {
        return "The current state of the company is good";
    }
}

const companyReportTool = new CompanyReportTool();

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
    name: "reporting-agent",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "This agent is responsible for generating reports",
    instructions: ["Generate a report on the current state of the company"],
});

const zee = new ZeeWorkflow({
    description:
        "A workflow that analyzes blockchain data and company reports",
    output: "Combined analysis results",
    agents: { agent1, agent2 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
