#!/usr/bin/env node

// リファクタリング後のメインエントリーポイント

import { EnvironmentConfig } from './config/environment.js';
import { ProviderFactory } from './providers/factory.js';
import { FileWriter } from './utils/file-writer.js';
import type { CodeGenerationConfig } from './types/index.js';

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    // 1. 環境変数から設定を読み込み
    const providerConfig = EnvironmentConfig.getProviderConfig();
    const generationConfig = EnvironmentConfig.getGenerationConfig();
    
    // 2. 設定の妥当性をチェック
    EnvironmentConfig.validateConfig(providerConfig);
    
    // 3. 設定情報をログ出力
    EnvironmentConfig.logConfig(providerConfig);
    
    console.log(`📝 プロンプト: ${generationConfig.prompt}`);
    console.log(`📁 出力ファイル: ${generationConfig.outputFile}`);

    // 4. 適切なプロバイダーを作成
    const provider = ProviderFactory.createProvider(providerConfig);
    
    // 5. コード生成設定を準備
    const codeGenConfig: CodeGenerationConfig = {
      prompt: generationConfig.prompt,
      outputFile: generationConfig.outputFile,
      model: providerConfig.bedrockConfig?.model || 'claude-3-haiku-20240307',
      maxTokens: 2000,
      maxTurns: 3,
    };

    // 6. コード生成を実行
    const generatedCode = await provider.generateCode(codeGenConfig);
    
    // 7. ファイルに保存
    FileWriter.saveGeneratedCode(generatedCode, generationConfig.outputFile);

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

export { main };