#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

type CodeGenerationConfig = {
  prompt: string;
  outputFile: string;
  model?: string;
  maxTokens?: number;
};

type GeneratedCode = {
  content: string;
  language: string;
  explanation?: string;
};

type BedrockConfig = {
  region: string;
  model: string;
  bearerToken?: string;
};

class ClaudeCodeGenerator {
  private client?: Anthropic;
  private bedrockClient?: BedrockRuntimeClient;
  private useBedrock: boolean;
  private bedrockConfig?: BedrockConfig;

  constructor(apiKey?: string, bedrockConfig?: BedrockConfig) {
    this.useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
    
    if (this.useBedrock) {
      if (!bedrockConfig) {
        throw new Error('Bedrock設定が必要です');
      }
      this.bedrockConfig = bedrockConfig;
      this.bedrockClient = new BedrockRuntimeClient({
        region: bedrockConfig.region,
        credentials: bedrockConfig.bearerToken ? {
          accessKeyId: 'dummy',
          secretAccessKey: 'dummy',
          sessionToken: bedrockConfig.bearerToken,
        } : undefined,
      });
    } else {
      if (!apiKey) {
        throw new Error('Anthropic APIキーが必要です');
      }
      this.client = new Anthropic({
        apiKey,
      });
    }
  }

  async generateCode(config: CodeGenerationConfig): Promise<GeneratedCode> {
    const systemPrompt = `あなたは熟練したソフトウェアエンジニアです。
要求に応じて高品質なコードを生成してください。

以下の要件を満たしてください：
- TypeScriptの場合は型安全性を重視
- 関数型プログラミングを優先し、副作用を最小限に
- コードには適切なコメントを含める
- エラーハンドリングを考慮する
- テスタブルな設計を心がける`;

    const userPrompt = `以下の要求に基づいてコードを生成してください：

${config.prompt}

生成するコードは以下の形式で返してください：
\`\`\`typescript
// ここにコードを記述
\`\`\`

また、コードの説明も簡潔に含めてください。`;

    try {
      if (this.useBedrock) {
        return await this.generateCodeWithBedrock(systemPrompt, userPrompt, config);
      } else {
        return await this.generateCodeWithAnthropic(systemPrompt, userPrompt, config);
      }
    } catch (error) {
      console.error('コード生成エラー:', error);
      throw error;
    }
  }

  private async generateCodeWithAnthropic(
    systemPrompt: string,
    userPrompt: string,
    config: CodeGenerationConfig
  ): Promise<GeneratedCode> {
    if (!this.client) {
      throw new Error('Anthropic クライアントが初期化されていません');
    }

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

    return this.parseResponse(content.text);
  }

  private async generateCodeWithBedrock(
    systemPrompt: string,
    userPrompt: string,
    config: CodeGenerationConfig
  ): Promise<GeneratedCode> {
    if (!this.bedrockClient || !this.bedrockConfig) {
      throw new Error('Bedrock クライアントが初期化されていません');
    }

    const modelId = config.model || this.bedrockConfig.model;
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

    const response = await this.bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('Bedrockからのレスポンスが空です');
    }

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (!responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
      throw new Error('予期しないBedrock レスポンス形式です');
    }

    return this.parseResponse(responseBody.content[0].text);
  }

  private parseResponse(response: string): GeneratedCode {
    // コードブロックを抽出
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);

    if (!match) {
      throw new Error('コードブロックが見つかりませんでした');
    }

    const language = match[1] || 'typescript';
    const content = match[2].trim();
    
    // コードブロック以外の部分を説明として抽出
    const explanation = response
      .replace(codeBlockRegex, '')
      .trim()
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');

    return {
      content,
      language,
      explanation: explanation || undefined,
    };
  }

  saveGeneratedCode(code: GeneratedCode, outputPath: string): void {
    try {
      // ディレクトリが存在しない場合は作成
      const dir = dirname(outputPath);
      mkdirSync(dir, { recursive: true });

      const modelName = this.useBedrock 
        ? (this.bedrockConfig?.model || 'bedrock-claude') 
        : 'claude-3-haiku-20240307';

      // ファイルの先頭にメタデータコメントを追加
      const header = `// Generated by Claude Code SDK ${this.useBedrock ? '(via AWS Bedrock)' : '(Direct API)'}
// Date: ${new Date().toISOString()}
// Model: ${modelName}
${code.explanation ? `// Description: ${code.explanation}` : ''}

`;

      const fullContent = header + code.content;
      writeFileSync(outputPath, fullContent, 'utf-8');
      
      console.log(`✅ コード生成完了: ${outputPath}`);
      console.log(`🔧 使用したプロバイダー: ${this.useBedrock ? 'AWS Bedrock' : 'Anthropic Direct API'}`);
      if (code.explanation) {
        console.log(`📝 説明: ${code.explanation}`);
      }
    } catch (error) {
      console.error(`❌ ファイル保存エラー: ${error}`);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
  
  let generator: ClaudeCodeGenerator;

  if (useBedrock) {
    const region = process.env.AWS_REGION;
    const model = process.env.ANTHROPIC_MODEL;
    const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;

    if (!region) {
      console.error('❌ AWS_REGION環境変数が設定されていません');
      process.exit(1);
    }
    if (!model) {
      console.error('❌ ANTHROPIC_MODEL環境変数が設定されていません');
      process.exit(1);
    }

    console.log('🚀 AWS Bedrockを使用してClaude APIにアクセスします');
    console.log(`🌏 リージョン: ${region}`);
    console.log(`🤖 モデル: ${model}`);

    generator = new ClaudeCodeGenerator(undefined, {
      region,
      model,
      bearerToken,
    });
  } else {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY環境変数が設定されていません');
      process.exit(1);
    }

    console.log('🚀 Anthropic Direct APIを使用します');
    generator = new ClaudeCodeGenerator(apiKey);
  }

  const prompt = process.env.INPUT_PROMPT || 'TypeScriptでHello Worldを出力する関数を作成してください';
  const outputFile = process.env.OUTPUT_FILE || 'generated/hello.ts';

  console.log('🤖 Claude Code SDKを使用してコード生成を開始...');
  console.log(`📝 プロンプト: ${prompt}`);
  console.log(`📁 出力ファイル: ${outputFile}`);

  try {
    const config: CodeGenerationConfig = {
      prompt,
      outputFile,
      model: useBedrock ? process.env.ANTHROPIC_MODEL : 'claude-3-haiku-20240307',
      maxTokens: 2000,
    };

    const generatedCode = await generator.generateCode(config);
    generator.saveGeneratedCode(generatedCode, outputFile);

    console.log('🎉 コード生成が正常に完了しました！');
  } catch (error) {
    console.error('❌ コード生成に失敗しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmainを呼び出し
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClaudeCodeGenerator, type CodeGenerationConfig, type GeneratedCode, type BedrockConfig };