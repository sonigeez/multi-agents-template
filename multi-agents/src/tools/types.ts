
export interface ToolFunctionDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description?: string;
            enum?: string[];
        }>;
        required?: string[];
    };
}

export interface ToolDefinition {
    type: 'function';
    function: ToolFunctionDefinition;
}

export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}


export interface ToolHandler<TResult> {
    definition: ToolDefinition;
    execute: (params: Record<string, any>) => TResult;
}


export type ToolRegistry = Map<string, ToolHandler<any>>;

export type ToolCallResult = {
    role: 'tool';
    content: string;
    tool_call_id: string;
}
