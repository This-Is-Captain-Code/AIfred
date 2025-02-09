
import { useState } from 'react';
import { ZeeWorkflow, Agent } from "@covalenthq/ai-agent-sdk";

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !output) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: description }]);

    try {
      const agent3 = new Agent({
        name: "langchain-agent",
        model: {
          provider: "OPEN_AI",
          name: "gpt-4o-mini",
        },
        description: "An agent that processes user requests",
      });

      const zee = new ZeeWorkflow({
        description: description,
        output: output,
        agents: { agent3 }
      });

      const result = await ZeeWorkflow.run(zee);
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing request' }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter workflow description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Expected Output</label>
            <input
              type="text"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter expected output"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p className="mt-1 text-gray-700">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
