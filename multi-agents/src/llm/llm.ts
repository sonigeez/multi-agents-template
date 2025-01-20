import type { MODEL } from "./types";
import OpenAI from "openai";
import { ToolRegistryManager } from "../tools/registry";
import type { ToolDefinition, ToolCallResult } from "../tools/types";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export abstract class LLM {
    protected openai: OpenAI;
    protected abstract model: MODEL;
    protected maxTokens: number;
    protected temperature: number;
    protected toolRegistry: ToolRegistryManager;
    protected messages: ChatCompletionMessageParam[] = [];
    protected systemMessage: string;

    constructor({
        apiKey,
        baseURL = 'https://api.openai.com/v1',
        prevMessages = [],
        systemMessage = 'You are a helpful assistant.',
        temperature = 1,
        maxTokens = 1000,
        toolRegistry
    }: {
        apiKey: string;
        baseURL?: string;
        prevMessages?: ChatCompletionMessageParam[];
        systemMessage?: string;
        temperature?: number;
        maxTokens?: number;
        toolRegistry: ToolRegistryManager;
    }) {
        this.openai = new OpenAI({ apiKey, baseURL });
        this.toolRegistry = toolRegistry;
        this.systemMessage = systemMessage;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.messages = [
            { role: 'system', content: this.systemMessage },
            ...prevMessages
        ];
    }

    abstract streamChat(message: string): AsyncGenerator<ChatCompletionMessageParam>;

    abstract getModel(): MODEL;

    getMessages(): ChatCompletionMessageParam[] {
        return [...this.messages];
    }

    getTools(): ToolDefinition[] {
        return this.toolRegistry.getTools();
    }

    protected async handleToolCall(toolCall: {
        id: string;
        function: { name: string; arguments: string };
    }): Promise<ToolCallResult> {
        try {
            const result = await this.toolRegistry.executeTool(
                toolCall.function.name,
                JSON.parse(toolCall.function.arguments)
            );
            
            if (Symbol.asyncIterator in result) {
                let fullContent = '';
                let role = 'tool';
                
                for await (const message of result) {
                    console.log("result is stream", message);
                    if (message.role === 'assistant' && message.content) {
                        fullContent += message.content;
                    }

                }

                console.log("fullContent", fullContent);

                return {
                    role: 'tool',
                    content: fullContent,
                    tool_call_id: toolCall.id
                };
            }
            
            return {
                role: 'tool',
                content: JSON.stringify(result),
                tool_call_id: toolCall.id
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                role: 'tool',
                content: JSON.stringify({ error: errorMessage }),
                tool_call_id: toolCall.id
            };
        }
    }
}