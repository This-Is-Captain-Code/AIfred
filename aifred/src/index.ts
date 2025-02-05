
import {
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
    Agent
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
            name: "gpt-4-mini",
        },
        description: "You are a blockchain researcher analyzing wallet activities.",
        tools: {
            tokenBalances: new TokenBalancesTool(apiKey),
            nftBalances: new NFTBalancesTool(apiKey),
            transactions: new TransactionsTool(apiKey),
        },
    });
    
    try {
        // Fetch token balances
        const balances = await tokenBalances.get("eth-mainnet", walletAddress);
        console.log("Token Balances:", balances);

        // Fetch NFT holdings
        const nfts = await nftHoldings.get("eth-mainnet", walletAddress);
        console.log("NFT Holdings:", nfts);

        // Fetch transaction history
        const txHistory = await transactions.get("eth-mainnet", walletAddress);
        console.log("Transaction History:", txHistory);

        // Fetch ETH price history (24h)
        const priceHistory = await historicalPrices.get("eth-mainnet", "ETH", "24h");
        console.log("ETH Price History (24h):", priceHistory);

    } catch (error) {
        console.error("Error:", error);
    }
}

ApiServices();
