import { LLM } from "../llm/llm";
import { ToolRegistryManager } from "../tools/registry";
import type { ToolDefinition, ToolHandler } from "../tools/types";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import type { MODEL } from "../llm/types";

export abstract class BaseAgent {
    protected llm: LLM;
    protected toolRegistry: ToolRegistryManager;

    constructor() {
        this.toolRegistry = new ToolRegistryManager();
        this.setupTools();
        this.llm = this.setupLLM();
    }

    // Abstract methods that must be implemented by derived classes
    protected abstract getSystemPrompt(): string;
    protected abstract getModel(): MODEL;
    protected abstract setupTools(): void;
    
    // Method to register a tool
    protected registerTool(tool: ToolHandler<any>): void {
        this.toolRegistry.registerTool(tool);
    }

    // Method to setup LLM with configuration
    protected abstract setupLLM(): LLM;

    // Method to get messages from LLM
    public getMessages(): ChatCompletionMessageParam[] {
        return this.llm.getMessages();
    }

    // Method to get registered tools
    public getTools(): ToolDefinition[] {
        return this.toolRegistry.getTools();
    }


	public async *streamChat(message: string): AsyncGenerator<ChatCompletionMessageParam> {
		console.log("streamChat");
		try {
			yield* this.llm.streamChat(message);
		} catch (error) {
			console.error('Error in streamChat:', error);
			throw error;
		}
	}
}
