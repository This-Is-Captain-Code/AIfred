import {} from //Agent,
//ZeeWorkflow,
//TokenBalancesTool,
//NFTBalancesTool,
//TransactionsTool,
//HistoricalTokenPriceTool
"@covalenthq/ai-agent-sdk";
import { GoldRushClient, Chain } from "@covalenthq/client-sdk";
import "dotenv/config";

//const agent1 = new Agent({
//    name: "blockchain-researcher",
//    model: {
//        provider: "OPEN_AI",
//        name: "gpt-4o-mini",
//    },
//    description: "A blockchain researcher analyzing wallet activities.",
//    tools: {
//        tokenBalances: new TokenBalancesTool(process.env.GOLDRUSH_API_KEY),
//        nftBalances: new NFTBalancesTool(process.env.GOLDRUSH_API_KEY),
//        transactions: new TransactionsTool(process.env.GOLDRUSH_API_KEY),
//        historicalPrices: new HistoricalTokenPriceTool(process.env.GOLDRUSH_API_KEY)
//    },
//});

//const zee = new ZeeWorkflow({
//    description: "A workflow that analyzes blockchain data",
//    output: "Blockchain analysis results",
//    agents: { agent1 },
//    parameters: {
//        wallet_address: process.env.WALLET_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",  // example wallet
//        chain: "eth-mainnet"
//    }
//});

const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY || "");

async function analyzeWallet(
    walletAddress: string,
    chain: string = "eth-mainnet",
) {
    try {
        const balances =
            await client.BalanceService.getTokenBalancesForWalletAddress(
                chain,
                walletAddress,
            );
        if (!balances.error) {
            console.log("Token Balances:", balances.data);
        } else {
            console.log("Error fetching balances:", balances.error_message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const walletAddress =
    process.env.WALLET_ADDRESS || "0x410f66099309c2379921f12E0B387f6F7e519136";
analyzeWallet(walletAddress);

//(async function main() {
//    const result = await ZeeWorkflow.run(zee);
//    console.log(result);
//})();
