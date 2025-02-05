import {
    TokenBalancesTool,
    NFTBalancesTool,
    TransactionsTool,
    HistoricalTokenPriceTool,
    Agent,
    ZeeWorkflow
} from "@covalenthq/ai-agent-sdk";
import "dotenv/config";

const ApiServices = async () => {
    try {
        const apiKey = process.env.GOLDRUSH_API_KEY || "";
        const walletAddress = process.env.WALLET_ADDRESS || "";

        if (!apiKey) {
            throw new Error("GOLDRUSH_API_KEY is required");
        }

        if (!walletAddress) {
            throw new Error("WALLET_ADDRESS is required");
        }

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
                tokenBalances,
                nftBalances: nftHoldings,
                transactions,
            },
        });

        // Execute a sample query
        const response = await agent.execute(`What are the token balances for wallet ${walletAddress}?`);
        console.log("Agent Response:", response);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

ApiServices().catch(error => {
    console.error("Unhandled Error:", error);
    process.exit(1);
});


// Create the first agent
const agent1 = new Agent({
    name: "Agent1",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4",
    },
    description: "A helpful AI assistant that can engage in conversation.",
});

// Create the second agent
const agent2 = new Agent({
    name: "Agent2",
    model: {
        provider: "OPEN_AI",
        name: "gpt-4",
    },
    description: "Another helpful AI assistant for collaboration.",
});

// Create the ZEE workflow
const zee = new ZeeWorkflow({
    description: "A workflow of agents that do stuff together",
    output: "Just bunch of stuff",
    agents: { agent1, agent2 },
});

// Run the workflow
(async function main() {
    try {
        const result = await ZeeWorkflow.run(zee);
        console.log("Workflow Result:", result);
    } catch (error) {
        console.error("Error running workflow:", error);
        process.exit(1);
    }
})();