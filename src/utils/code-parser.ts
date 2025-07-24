// コードレスポンスのパース処理

import type { GeneratedCode } from '../types/index.js';

/**
 * Claude APIのレスポンスからコードブロックを抽出してパースする
 */
export class CodeParser {
  /**
   * レスポンステキストからコードと説明を抽出
   */
  static parseResponse(response: string): Pick<GeneratedCode, 'content' | 'language' | 'explanation'> {
    // コードブロックを抽出
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);

    if (!match) {
      // コードブロックが見つからない場合は、全文をそのまま使用
      console.warn('⚠️ コードブロックが見つかりませんでした。全文を出力します。');
      return {
        content: response,
        language: 'typescript',
        explanation: undefined,
      };
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
}