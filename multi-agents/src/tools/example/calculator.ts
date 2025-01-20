import type { ToolHandler, ToolResult } from '../types';

const calculatorTool: ToolHandler<any> = {
    definition: {
        type: 'function',
        function: {
            name: 'calculator',
            description: 'Perform basic arithmetic calculations',
            parameters: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        description: 'The operation to perform',
                        enum: ['add', 'subtract', 'multiply', 'divide']
                    },
                    a: {
                        type: 'number',
                        description: 'First number'
                    },
                    b: {
                        type: 'number',
                        description: 'Second number'
                    }
                },
                required: ['operation', 'a', 'b']
            }
        }
    },

    async execute(params: Record<string, any>): Promise<ToolResult> {
        const { operation, a, b } = params;
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            let result: number;
            switch (operation) {
                case 'add':
                    result = a + b;
                    break;
                case 'subtract':
                    result = a - b;
                    break;
                case 'multiply':
                    result = a * b;
                    break;
                case 'divide':
                    if (b === 0) throw new Error('Division by zero');
                    result = a / b;
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            return {
                success: true,
                data: { result }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
};

export default calculatorTool;
