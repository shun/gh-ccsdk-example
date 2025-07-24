// プロバイダーファクトリー

import type { ICodeGenerator, ProviderConfig } from '../types/index.js';
import { OfficialClaudeProvider } from './official-provider.js';
import { DirectAnthropicProvider } from './direct-provider.js';
import { BedrockProvider } from './bedrock-provider.js';

/**
 * 設定に基づいて適切なプロバイダーを作成するファクトリー
 */
export class ProviderFactory {
  /**
   * 設定に基づいてプロバイダーを作成
   */
  static createProvider(config: ProviderConfig): ICodeGenerator {
    if (config.useOfficialSDK) {
      return new OfficialClaudeProvider();
    }
    
    if (config.useBedrock) {
      if (!config.bedrockConfig) {
        throw new Error('Bedrock設定が必要です');
      }
      return new BedrockProvider(config.bedrockConfig);
    }
    
    // デフォルトはDirect API
    if (!config.anthropicApiKey) {
      throw new Error('Anthropic APIキーが必要です');
    }
    
    return new DirectAnthropicProvider(config.anthropicApiKey);
  }
}