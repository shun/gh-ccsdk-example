// 環境変数の管理

import type { ProviderConfig, BedrockConfig } from '../types/index.js';

/**
 * 環境変数から設定を読み込むユーティリティ
 */
export class EnvironmentConfig {
  /**
   * 環境変数からプロバイダー設定を取得
   */
  static getProviderConfig(): ProviderConfig {
    const useOfficialSDK = process.env.USE_OFFICIAL_CLAUDE_CODE_SDK === '1';
    const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    let bedrockConfig: BedrockConfig | undefined;
    
    if (useBedrock) {
      const region = process.env.AWS_REGION;
      const model = process.env.ANTHROPIC_MODEL;
      const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;

      if (!region || !model) {
        throw new Error('AWS_REGIONとANTHROPIC_MODEL環境変数が設定されていません');
      }

      bedrockConfig = {
        region,
        model,
        bearerToken,
      };
    }

    return {
      useOfficialSDK,
      useBedrock,
      anthropicApiKey,
      bedrockConfig,
    };
  }

  /**
   * コード生成に必要な基本設定を取得
   */
  static getGenerationConfig() {
    return {
      prompt: process.env.INPUT_PROMPT || 'TypeScriptでHello Worldを出力する関数を作成してください',
      outputFile: process.env.OUTPUT_FILE || 'generated/hello.ts',
    };
  }

  /**
   * 設定の妥当性をチェック
   */
  static validateConfig(config: ProviderConfig): void {
    if (config.useOfficialSDK) {
      // 公式SDKの場合、ANTHROPIC_API_KEYが必要
      if (!config.anthropicApiKey) {
        throw new Error('公式Claude Code SDK使用時はANTHROPIC_API_KEY環境変数が必要です');
      }
    } else if (config.useBedrock) {
      // Bedrockの場合、Bedrock設定が必要
      if (!config.bedrockConfig) {
        throw new Error('Bedrock使用時はAWS設定が必要です');
      }
    } else {
      // Direct APIの場合、ANTHROPIC_API_KEYが必要
      if (!config.anthropicApiKey) {
        throw new Error('Direct API使用時はANTHROPIC_API_KEY環境変数が必要です');
      }
    }
  }

  /**
   * 設定情報をログ出力（機密情報は隠す）
   */
  static logConfig(config: ProviderConfig): void {
    console.log('🚀 Claude Code統合SDKを使用してコード生成を開始...');
    
    if (config.useOfficialSDK) {
      console.log('🎯 公式Claude Code SDKを使用します');
    } else if (config.useBedrock) {
      console.log('🎯 Direct Anthropic SDK (via AWS Bedrock)を使用します');
      console.log(`🌏 リージョン: ${config.bedrockConfig?.region}`);
      console.log(`🤖 モデル: ${config.bedrockConfig?.model}`);
    } else {
      console.log('🎯 Direct Anthropic SDKを使用します');
    }
  }
}