import { BaseAgent } from "./base";
import type { MODEL } from "../llm/types";
import { LLM } from "../llm/llm";
import { Gpt4o } from "../llm/gpt-4o";
import calculatorTool from "../tools/example/calculator";
import type { ToolDefinition, ToolHandler, ToolResult } from "../tools/types";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export class CalculatorAgent extends BaseAgent {
    protected getSystemPrompt(): string {
        return `You are a specialized calculator assistant that can perform mathematical operations.
You should always use the calculator tool to perform calculations rather than doing them yourself.
When asked to perform calculations:
1. Use the calculator tool for each operation
2. Show the final result clearly
3. Explain the calculation steps if needed`;
    }

    protected getModel(): MODEL {
        return this.llm.getModel();
    }

    protected setupTools(): void {
        this.registerTool(calculatorTool);
    }

    protected setupLLM(): LLM {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        return new Gpt4o({
            apiKey,
            baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
            toolRegistry: this.toolRegistry,
            systemMessage: this.getSystemPrompt()
        });
    }
}


export const calculatorAgentTool: ToolHandler<AsyncGenerator<ChatCompletionMessageParam, any, unknown>> = {
    definition: {
        type: 'function',
        function: {
            name: 'calculator_agent',
            description: 'A calculator agent that can perform mathematical operations',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The query to be executed'
                    }
                },
                required: ['query']
            }
        }
    },
    execute: async function* (params: Record<string, any>): AsyncGenerator<ChatCompletionMessageParam, any, unknown> {
        console.log("execute");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const agent = new CalculatorAgent();
        const stream = agent.streamChat(params.query);

        for await (const message of stream) {
            yield message;
        }
    }
};