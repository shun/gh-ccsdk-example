// AWS Bedrockプロバイダー

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ICodeGenerator, CodeGenerationConfig, GeneratedCode, BedrockConfig } from '../types/index.js';
import { CodeParser } from '../utils/code-parser.js';
import { SystemPrompt } from '../utils/system-prompt.js';

/**
 * AWS Bedrockを使用したコード生成プロバイダー
 */
export class BedrockProvider implements ICodeGenerator {
  readonly providerType = 'bedrock' as const;
  private client: BedrockRuntimeClient;
  private config: BedrockConfig;

  constructor(config: BedrockConfig) {
    this.config = config;
    this.client = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.bearerToken ? {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
        sessionToken: config.bearerToken,
      } : undefined,
    });
  }

  async generateCode(config: CodeGenerationConfig): Promise<GeneratedCode> {
    console.log('🚀 AWS Bedrockを使用してCoude生成を開始...');
    
    const systemPrompt = SystemPrompt.getDefaultSystemPrompt();
    const userPrompt = `以下の要求に基づいてコードを生成してください：

${config.prompt}

生成するコードは以下の形式で返してください：
\`\`\`typescript
// ここにコードを記述
\`\`\`

また、コードの説明も簡潔に含めてください。`;

    try {
      const modelId = config.model || this.config.model;
      const maxTokens = config.maxTokens || 2000;

      const body = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body,
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('Bedrockからのレスポンスが空です');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      if (!responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
        throw new Error('予期しないBedrock レスポンス形式です');
      }

      const parsed = CodeParser.parseResponse(responseBody.content[0].text);

      return {
        ...parsed,
        provider: 'AWS Bedrock',
        modelName: modelId,
      };
    } catch (error) {
      console.error('AWS Bedrockでのコード生成エラー:', error);
      throw error;
    }
  }
}