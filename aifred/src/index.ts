import { GoldRushClient } from "@covalenthq/client-sdk";
import "dotenv/config";

const ApiServices = async () => {
    const client = new GoldRushClient(process.env.GOLDRUSH_API_KEY || ""); 
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
        "eth-mainnet",
        process.env.WALLET_ADDRESS || "0x410f66099309c2379921f12E0B387f6F7e519136"
    ); 

    if (!resp.error) {
        console.log("Token Balances:", resp.data);
    } else {
        console.log("Error:", resp.error_message);
    }
}

ApiServices();