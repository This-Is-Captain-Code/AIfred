import {
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
    Agent,
} from "@covalenthq/ai-agent-sdk";
import "dotenv/config";

const ApiServices = async () => {
    const apiKey = process.env.GOLDRUSH_API_KEY || "";
    const walletAddress = process.env.WALLET_ADDRESS || "";

    // Initialize tools
    const tokenBalances = new TokenBalancesTool(apiKey);
    const nftHoldings = new NFTBalancesTool(apiKey);
    const transactions = new TransactionsTool(apiKey);
    const historicalPrices = new HistoricalTokenPriceTool(apiKey);

    // Create AI agent
    const agent = new Agent({
        name: "blockchain researcher",
        model: {
            provider: "OPEN_AI",
            name: "gpt-4",
        },
        description:
            "You are a blockchain researcher analyzing wallet activities.",
        tools: {
            tokenBalances: new TokenBalancesTool(apiKey),
            nftBalances: new NFTBalancesTool(apiKey),
            transactions: new TransactionsTool(apiKey),
        },
    });
};

ApiServices();
