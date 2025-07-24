# Claude Code SDK GitHub Actions Example

GitHub ActionsでClaude Code SDKを使用してAIによるコード生成を自動化するサンプルプロジェクトです。

## 🚀 機能

- **自動コード生成**: Claude AIを使用してTypeScriptコードを自動生成
- **3つのプロバイダー対応**: 公式SDK、Direct API、AWS Bedrock
- **AWS Bedrock対応**: Claude Sonnet 4をAWS Bedrock経由で利用可能
- **GitHub Actions統合**: プルリクエストやマニュアルトリガーでコード生成を実行
- **型安全**: TypeScriptによる型安全なコード生成（type使用、関数型重視）
- **モジュラー設計**: 拡張性とメンテナンス性を重視したアーキテクチャ
- **カスタマイズ可能**: プロンプトと出力ファイルを自由に設定可能

## 🏗️ アーキテクチャ

```
src/
├── types/           # 型定義（ICodeGenerator、Config型など）
├── config/          # 環境変数管理、設定検証
├── utils/           # 再利用可能ユーティリティ
├── providers/       # 各プロバイダーの実装
│   ├── official-provider.ts    # 公式Claude Code SDK
│   ├── direct-provider.ts      # Direct Anthropic API
│   ├── bedrock-provider.ts     # AWS Bedrock
│   └── factory.ts             # プロバイダーファクトリー
└── generate-refactored.ts     # メインエントリーポイント
```

### 主要な設計原則

- **責任分離**: 各コンポーネントが単一の責任を持つ
- **依存性注入**: ファクトリーパターンによる柔軟なプロバイダー選択
- **型安全性**: TypeScriptの型システムを最大限活用
- **エラーハンドリング**: 集約化された例外処理
- **拡張性**: 新しいプロバイダーの追加が容易

## 📋 セットアップ

### 1. リポジトリのクローン

```bash
git clone <this-repository>
cd gh-claude-code-sdk
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

#### ローカル開発用
```bash
cp .env.example .env
# .envファイルを編集してAPIキーまたはBedrock設定を行う
```

#### GitHub Actions用
リポジトリのSettings > Secrets and variables > Actionsで以下のシークレットを設定：

**方法1: 公式Claude Code SDK**
- `USE_OFFICIAL_CLAUDE_CODE_SDK`: `1`に設定  
- `ANTHROPIC_API_KEY`: AnthropicのAPIキー

**方法2: Anthropic Direct API（デフォルト）**
- `ANTHROPIC_API_KEY`: AnthropicのAPIキー

**方法3: AWS Bedrock経由（Claude Sonnet 4使用）**
- `CLAUDE_CODE_USE_BEDROCK`: `1`に設定
- `AWS_REGION`: AWS リージョン（例: `ap-northeast-1`）
- `ANTHROPIC_MODEL`: モデルID（例: `apac.anthropic.claude-sonnet-4-20250514-v1:0`）
- `AWS_BEARER_TOKEN_BEDROCK`: AWS Bearer Token（オプション）

### 4. API設定の取得

#### Anthropic Direct API & 公式SDK
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keysページで新しいキーを生成
4. 生成されたキーを安全に保存

#### AWS Bedrock
1. AWS アカウントにログイン
2. Bedrockサービスでモデルアクセスを有効化
3. 必要に応じてBearer Tokenを取得

## 🎯 使用方法

### ローカルでの実行

```bash
# デフォルト（リファクタリング版を使用）
npm run dev

# レガシー統合版
npm run dev:legacy

# 個別プロバイダー実行
npm run dev:direct    # Direct API
npm run dev:official  # 公式SDK
```

### 環境変数による切り替え

```bash
# 公式Claude Code SDKを使用
USE_OFFICIAL_CLAUDE_CODE_SDK=1 \
INPUT_PROMPT="TypeScriptでソート関数を作成してください" \
npm run dev

# AWS Bedrockを使用
CLAUDE_CODE_USE_BEDROCK=1 \
INPUT_PROMPT="TypeScriptでソート関数を作成してください" \
npm run dev

# Direct APIを使用（デフォルト）
CLAUDE_CODE_USE_BEDROCK=0 \
INPUT_PROMPT="TypeScriptでソート関数を作成してください" \
npm run dev
```

### GitHub Actionsでの自動実行

#### 手動実行
1. GitHubリポジトリの**Actions**タブを開く
2. **AI Code Generation with Claude**ワークフローを選択
3. **Run workflow**をクリック
4. プロンプトと出力ファイル名を入力して実行

#### プロンプトファイル更新時の自動実行
`prompts/`ディレクトリ内のファイルを更新してプッシュすると、自動的にコード生成が実行されます。

## 🛠️ 設定オプション

### 環境変数

| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|-------------|------|
| `USE_OFFICIAL_CLAUDE_CODE_SDK` | 公式SDKを使用するか（1で有効） | `0` | - |
| `CLAUDE_CODE_USE_BEDROCK` | Bedrockを使用するか（1で有効） | - | Bedrock使用時 |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | - | Direct API・公式SDK使用時 |
| `AWS_REGION` | AWS リージョン | - | Bedrock使用時 |
| `ANTHROPIC_MODEL` | モデルID | - | Bedrock使用時 |
| `AWS_BEARER_TOKEN_BEDROCK` | AWS Bearer Token | - | オプション |
| `INPUT_PROMPT` | コード生成用のプロンプト | "TypeScriptでHello World..." | - |
| `OUTPUT_FILE` | 出力ファイルのパス | "generated/hello.ts" | - |

### GitHub Actions入力パラメータ

| パラメータ | 説明 | 必須 | デフォルト値 |
|------------|------|------|-------------|
| `prompt` | コード生成用のプロンプト | ✅ | "TypeScriptでHello Worldを出力する関数を作成してください" |
| `output_file` | 出力ファイル名 | ❌ | "generated/hello.ts" |

## 📝 プロンプト例

詳細な例は `prompts/example-prompts.md` を参照してください。

### 基本的な例
```
TypeScriptでHello Worldを出力する関数を作成してください
```

### より複雑な例
```
TypeScriptとExpress.jsを使用して、ユーザー管理のためのREST APIを作成してください。
CRUD操作とエラーハンドリングを含めてください。
```

## 🔧 カスタマイズ

### 新しいプロバイダーの追加

1. `src/providers/`に新しいプロバイダーファイルを作成
2. `ICodeGenerator`インターフェースを実装
3. `ProviderFactory`に追加
4. 環境変数設定を`EnvironmentConfig`に追加

```typescript
// src/providers/new-provider.ts
export class NewProvider implements ICodeGenerator {
  readonly providerType = 'new' as const;
  
  async generateCode(config: CodeGenerationConfig): Promise<GeneratedCode> {
    // 実装...
  }
}
```

### ユーティリティ関数の追加

`src/utils/`に新しいユーティリティを追加し、適切にエクスポートしてください。

## 🚨 注意事項

- **APIキーの管理**: APIキーは絶対にコードにハードコードしないでください
- **コスト管理**: Claude APIは従量課金制です。大量のコード生成時はコストにご注意ください
- **生成コードの検証**: AIが生成したコードは必ず動作確認とセキュリティチェックを行ってください

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

### 開発者向け情報

```bash
# ビルド
npm run build

# 開発サーバー起動
npm run dev

# 型チェック
npx tsc --noEmit
```

---

**注意**: このプロジェクトは教育・デモンストレーション目的で作成されています。本番環境で使用する際は、適切なセキュリティ対策とテストを実施してください。