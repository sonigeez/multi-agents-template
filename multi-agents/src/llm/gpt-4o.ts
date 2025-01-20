import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import { LLM } from "./llm";
import type { MODEL } from "./types";

export class Gpt4o extends LLM {
    protected model: MODEL = "gpt-4o";
    protected messages: ChatCompletionMessageParam[] = [];

    getModel(): MODEL {
        return this.model;
    }

    getMessages(): ChatCompletionMessageParam[] {
        return [...this.messages];
    }

    async* streamChat(message: string): AsyncGenerator<ChatCompletionMessageParam> {
        this.messages.push({ role: 'user', content: message });

        while (true) {
            const tools = this.getTools();
            const stream = await this.openai.chat.completions.create({
                model: this.model,
                messages: this.messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: true,
                tools: tools.length > 0 ? tools : undefined
            });

            let currentMessage = '';

            let toolCalls: ChatCompletionMessageToolCall[] = [];
            let currentToolCall: Partial<ChatCompletionMessageToolCall & { index?: number }> | null = null;
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;
                if (delta?.content) {
                    currentMessage += delta.content;
                    yield { role: "assistant", content: delta.content };
                }
                if (delta?.tool_calls?.[0]) {
                    const toolCall = delta.tool_calls[0];
                    if (!currentToolCall || toolCall.index !== currentToolCall.index) {
                        currentToolCall = {
                            id: toolCall.id,
                            function: { name: '', arguments: '' },
                            type: 'function',
                            index: toolCall.index
                        };
                        if (typeof toolCall.index === 'number') {
                            toolCalls[toolCall.index] = currentToolCall as ChatCompletionMessageToolCall;
                        }
                    }
                    if (toolCall.function?.name && currentToolCall.function) {
                        currentToolCall.function.name = toolCall.function.name;
                    }
                    if (toolCall.function?.arguments && currentToolCall.function) {
                        currentToolCall.function.arguments = (currentToolCall.function.arguments || '') + toolCall.function.arguments;
                    }
                }
            }

            if (!toolCalls.length && !currentMessage) {
                break;
            }

            if (toolCalls.length > 0) {
                const toolCall = toolCalls[0];
                if (toolCall?.id && toolCall?.function) {
                    const assistantMessage: ChatCompletionMessageParam = {
                        role: 'assistant',
                        content: currentMessage || null,
                        tool_calls: [{
                            id: toolCall.id,
                            type: 'function',
                            function: {
                                name: toolCall.function.name,
                                arguments: toolCall.function.arguments
                            }
                        }]
                    };
                    this.messages.push(assistantMessage);
                    yield assistantMessage;
                    const result = await this.handleToolCall(toolCall);
                    yield result;
                    this.messages.push(result);
                }
            } else if (currentMessage) {
                this.messages.push({
                    role: 'assistant',
                    content: currentMessage
                });
                break;
            }
        }
    }
}