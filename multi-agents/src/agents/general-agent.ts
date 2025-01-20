import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Gpt4o } from "../llm/gpt-4o";
import { LLM } from "../llm/llm";
import { ToolRegistryManager } from "../tools/registry";
import { calculatorAgentTool } from "./calculator";
export class GeneralAgent {
	llm: LLM;
	toolRegistry: ToolRegistryManager;
	constructor(prevMessages?: ChatCompletionMessageParam[]) {
		this.toolRegistry = new ToolRegistryManager();
		this.toolRegistry.registerTool(calculatorAgentTool);
		this.llm = new Gpt4o({
			apiKey: process.env.OPENAI_API_KEY!,
			toolRegistry: this.toolRegistry,
			prevMessages: prevMessages,
		});
	}

	async execute(query: string) {
		return this.llm.streamChat(query);
	}

	getMessages() {
		return this.llm.getMessages();
	}
}

