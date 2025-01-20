import type { ToolDefinition, ToolHandler, ToolRegistry } from './types';

export class ToolRegistryManager {
    private registry: ToolRegistry = new Map();

    constructor() {}

    registerTool(handler: ToolHandler<any>): void {
        this.registry.set(handler.definition.function.name, handler);
    }

    getTool(name: string): ToolHandler<any> | undefined {
        return this.registry.get(name);
    }

    getTools(): ToolDefinition[] {
        return Array.from(this.registry.values()).map(handler => handler.definition);
    }

    async executeTool(name: string, params: Record<string, any>) {
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        return tool.execute(params);
    }
}
