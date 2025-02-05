
import { Agent, ZeeWorkflow } from "@covalenthq/ai-agent-sdk";
import { TokenBalancesTool, NFTHoldingsTool, TransactionHistoryTool, HistoricalTokenPriceTool } from "@goldrush/sdk";
import "dotenv/config";

// Initialize GoldRush tools
const tokenBalances = new TokenBalancesTool(process.env.GOLDRUSH_API_KEY);
const nftHoldings = new NFTHoldingsTool(process.env.GOLDRUSH_API_KEY);
const transactionHistory = new TransactionHistoryTool(process.env.GOLDRUSH_API_KEY);
const historicalPrices = new HistoricalTokenPriceTool(process.env.GOLDRUSH_API_KEY);

const blockchainResearcher = new Agent({
    name: "BlockchainResearcher",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "A blockchain researcher analyzing wallet activities.",
    tools: {
        tokenBalances,
        nftHoldings,
        transactionHistory,
        historicalPrices
    },
});

const dataAnalyst = new Agent({
    name: "DataAnalyst",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4o-mini",
    },
    description: "An analyst that processes and interprets blockchain data.",
    tools: {
        tokenBalances,
        historicalPrices
    },
});

const zee = new ZeeWorkflow({
    description: "A workflow for analyzing blockchain data and providing insights",
    output: "Detailed blockchain analysis results",
    agents: { blockchainResearcher, dataAnalyst },
});

(async function main() {
    const result = await ZeeWorkflow.run(zee);
    console.log(result);
})();
