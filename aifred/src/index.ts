
import { GoldRushClient } from "@covalenthq/client-sdk";
import { 
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool 
} from "@covalenthq/ai-agent-sdk";
import "dotenv/config";

const ApiServices = async () => {
    const apiKey = process.env.GOLDRUSH_API_KEY || "";
    const walletAddress = process.env.WALLET_ADDRESS || "0x410f66099309c2379921f12E0B387f6F7e519136";
    
    // Initialize all tools
    const tokenBalances = new TokenBalancesTool(apiKey);
    const nftHoldings = new NFTBalancesTool(apiKey);
    const transactions = new TransactionsTool(apiKey);
    const historicalPrices = new HistoricalTokenPriceTool(apiKey);
    
    try {
        // Get token balances
        const balances = await tokenBalances.getTokenBalances("eth-mainnet", walletAddress);
        console.log("Token Balances:", balances);

        // Get NFT holdings
        const nfts = await nftHoldings.getNFTHoldings("eth-mainnet", walletAddress);
        console.log("NFT Holdings:", nfts);

        // Get transaction history
        const txHistory = await transactions.getTransactionHistory("eth-mainnet", walletAddress);
        console.log("Transaction History:", txHistory);

        // Get historical prices for ETH
        const priceHistory = await historicalPrices.getHistoricalPrices("eth-mainnet", "ETH", "24h");
        console.log("ETH Price History (24h):", priceHistory);

    } catch (error) {
        console.error("Error:", error);
    }
}

ApiServices();
