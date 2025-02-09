
import { NextApiRequest, NextApiResponse } from 'next';
import { ZeeWorkflow, Agent } from "@covalenthq/ai-agent-sdk";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { description, output } = req.body;

    const poemTool = new DynamicStructuredTool({
      name: "writePoem",
      description: "Writes a poem based on given parameters",
      schema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The main topic or theme of the poem" },
          style: { type: "string", description: "Style of poem" }
        },
        required: ["topic", "style"]
      },
      func: async (input: any) => {
        return `Generated a ${input.style} about ${input.topic}`;
      },
    });

    const createLangChainAgent = async () => {
      const llm = new ChatOpenAI({ modelName: "gpt-4", temperature: 0.7 });
      const tools = [poemTool];
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a creative poet. Your task is to write beautiful poems using the writePoem tool."],
        ["human", "Write a poem based on this request: {input}"],
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

    const langChainTool = createTool({
      id: "poem-writer",
      description: "Creates poems in various styles",
      schema: z.object({
        prompt: z.string().describe("The complete poem request"),
      }),
      execute: async () => {
        const langChainAgent = await createLangChainAgent();
        const result = await langChainAgent.invoke({
          input: description,
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
      description: "An agent that writes creative poems",
      tools: {
        langChainAnalysis: langChainTool,
      },
    });

    const zee = new ZeeWorkflow({
      description,
      output,
      agents: { agent3 }
    });

    const result = await ZeeWorkflow.run(zee);
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
