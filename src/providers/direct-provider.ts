// Direct Anthropic APIプロバイダー

import Anthropic from '@anthropic-ai/sdk';
import type { ICodeGenerator, CodeGenerationConfig, GeneratedCode } from '../types/index.js';
import { CodeParser } from '../utils/code-parser.js';
import { SystemPrompt } from '../utils/system-prompt.js';

/**
 * Direct Anthropic APIを使用したコード生成プロバイダー
 */
export class DirectAnthropicProvider implements ICodeGenerator {
  readonly providerType = 'direct' as const;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async generateCode(config: CodeGenerationConfig): Promise<GeneratedCode> {
    console.log('🚀 Direct Anthropic APIを使用してコード生成を開始...');
    
    const systemPrompt = SystemPrompt.getDefaultSystemPrompt();
    const userPrompt = `以下の要求に基づいてコードを生成してください：

${config.prompt}

生成するコードは以下の形式で返してください：
\`\`\`typescript
// ここにコードを記述
\`\`\`

また、コードの説明も簡潔に含めてください。`;

    try {
      const response = await this.client.messages.create({
        model: config.model || 'claude-3-haiku-20240307',
        max_tokens: config.maxTokens || 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('予期しないレスポンス形式です');
      }

      const parsed = CodeParser.parseResponse(content.text);

      return {
        ...parsed,
        provider: 'Anthropic Direct API',
        modelName: config.model || 'claude-3-haiku-20240307',
      };
    } catch (error) {
      console.error('Direct Anthropic APIでのコード生成エラー:', error);
      throw error;
    }
  }
}