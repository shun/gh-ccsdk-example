#!/usr/bin/env node

// 公式Claude Code SDKとDirect Anthropic SDKの統合版

import { ClaudeCodeGenerator } from './generate.js';
import { ClaudeCodeOfficialGenerator } from './generate-official.js';

type UnifiedConfig = {
  prompt: string;
  outputFile: string;
  useOfficialSDK?: boolean;
  maxTurns?: number;
  model?: string;
  maxTokens?: number;
};

async function main(): Promise<void> {
  const useOfficialSDK = process.env.USE_OFFICIAL_CLAUDE_CODE_SDK === '1';
  const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
  
  const prompt = process.env.INPUT_PROMPT || 'TypeScriptでHello Worldを出力する関数を作成してください';
  const outputFile = process.env.OUTPUT_FILE || 'generated/hello.ts';

  console.log('🚀 Claude Code統合SDKを使用してコード生成を開始...');
  console.log(`📝 プロンプト: ${prompt}`);
  console.log(`📁 出力ファイル: ${outputFile}`);

  try {
    if (useOfficialSDK) {
      // 公式Claude Code SDKを使用
      console.log('🎯 公式Claude Code SDKを使用します');
      
      const generator = new ClaudeCodeOfficialGenerator();
      const generatedCode = await generator.generateCode({
        prompt,
        outputFile,
        maxTurns: 3,
      });
      generator.saveGeneratedCode(generatedCode, outputFile);
      
    } else {
      // Direct Anthropic SDK (Bedrock対応版) を使用
      console.log(`🎯 Direct Anthropic SDK${useBedrock ? ' (via AWS Bedrock)' : ''}を使用します`);
      
      if (useBedrock) {
        const region = process.env.AWS_REGION;
        const model = process.env.ANTHROPIC_MODEL;
        const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;

        if (!region || !model) {
          console.error('❌ AWS_REGIONとANTHROPIC_MODEL環境変数が設定されていません');
          process.exit(1);
        }

        const generator = new ClaudeCodeGenerator(undefined, {
          region,
          model,
          bearerToken,
        });
        
        const config = {
          prompt,
          outputFile,
          model,
          maxTokens: 2000,
        };

        const generatedCode = await generator.generateCode(config);
        generator.saveGeneratedCode(generatedCode, outputFile);
        
      } else {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error('❌ ANTHROPIC_API_KEY環境変数が設定されていません');
          process.exit(1);
        }

        const generator = new ClaudeCodeGenerator(apiKey);
        
        const config = {
          prompt,
          outputFile,
          model: 'claude-3-haiku-20240307',
          maxTokens: 2000,
        };

        const generatedCode = await generator.generateCode(config);
        generator.saveGeneratedCode(generatedCode, outputFile);
      }
    }

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

export { type UnifiedConfig };