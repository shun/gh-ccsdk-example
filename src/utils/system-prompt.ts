// システムプロンプトの管理

/**
 * システムプロンプトを管理するユーティリティ
 */
export class SystemPrompt {
  /**
   * デフォルトのシステムプロンプトを取得
   */
  static getDefaultSystemPrompt(): string {
    return `あなたは熟練したソフトウェアエンジニアです。
要求に応じて高品質なコードを生成してください。

以下の要件を満たしてください：
- TypeScriptの場合は型安全性を重視
- 関数型プログラミングを優先し、副作用を最小限に
- コードには適切なコメントを含める
- エラーハンドリングを考慮する
- テスタブルな設計を心がける`;
  }

  /**
   * プロンプトとシステムプロンプトを結合してユーザープロンプトを生成
   */
  static createUserPrompt(prompt: string, customSystemPrompt?: string): string {
    const systemPrompt = customSystemPrompt || this.getDefaultSystemPrompt();
    
    return `${systemPrompt}

以下の要求に基づいてコードを生成してください：

${prompt}

生成するコードは以下の形式で返してください：
\`\`\`typescript
// ここにコードを記述
\`\`\`

また、コードの説明も簡潔に含めてください。`;
  }
}