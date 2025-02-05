
import { Agent, ZeeWorkflow } from "@covalenthq/ai-agent-sdk";
import "dotenv/config";

const agent1 = new Agent({
    name: "blockchain-researcher",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "A blockchain researcher analyzing wallet activities.",
    tools: {
        tokenBalances: new TokenBalancesTool(process.env.GOLDRUSH_API_KEY),
        nftBalances: new NFTBalancesTool(process.env.GOLDRUSH_API_KEY),
        transactions: new TransactionsTool(process.env.GOLDRUSH_API_KEY),
        historicalPrices: new HistoricalTokenPriceTool(process.env.GOLDRUSH_API_KEY)
    },
});

const zee = new ZeeWorkflow({
    description: "A workflow that analyzes blockchain data",
    output: "Blockchain analysis results",
    agents: { agent1 },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
