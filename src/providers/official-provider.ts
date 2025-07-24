// 公式Claude Code SDKプロバイダー

import { query, type SDKMessage } from "@anthropic-ai/claude-code";
import type { ICodeGenerator, CodeGenerationConfig, GeneratedCode } from '../types/index.js';
import { CodeParser } from '../utils/code-parser.js';
import { SystemPrompt } from '../utils/system-prompt.js';

/**
 * 公式Claude Code SDKを使用したコード生成プロバイダー
 */
export class OfficialClaudeProvider implements ICodeGenerator {
  readonly providerType = 'official' as const;

  async generateCode(config: CodeGenerationConfig): Promise<GeneratedCode> {
    console.log('🚀 公式Claude Code SDKを使用してコード生成を開始...');
    
    const fullPrompt = SystemPrompt.createUserPrompt(config.prompt);

    try {
      const messages: SDKMessage[] = [];
      
      for await (const message of query({
        prompt: fullPrompt,
        abortController: new AbortController(),
        options: {
          maxTurns: config.maxTurns || 3,
        },
      })) {
        messages.push(message);
        
        // プログレス表示
        if (message.type === 'assistant') {
          console.log('💭 Claude が応答中...');
        } else if (message.type === 'result') {
          console.log(`📊 コスト: $${message.total_cost_usd}, ターン数: ${message.num_turns}`);
        }
      }

      // 最後のメッセージから結果を取得
      const resultMessage = messages.find(m => m.type === 'result');
      const finalResult = resultMessage && 'result' in resultMessage ? resultMessage.result : '';
      
      if (!finalResult) {
        throw new Error('Claude Code SDKからの応答が取得できませんでした');
      }

      const parsed = CodeParser.parseResponse(finalResult);
      
      return {
        ...parsed,
        totalCostUsd: resultMessage && 'total_cost_usd' in resultMessage ? resultMessage.total_cost_usd : undefined,
        sessionId: resultMessage?.session_id,
        provider: 'Claude Code SDK (Official)',
        modelName: 'claude-via-official-sdk',
      };
    } catch (error) {
      console.error('公式Claude Code SDKでのコード生成エラー:', error);
      throw error;
    }
  }
}