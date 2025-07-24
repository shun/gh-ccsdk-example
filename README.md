# Claude Code SDK GitHub Actions Example

GitHub ActionsでClaude Code SDKを使用してAIによるコード生成を自動化するサンプルプロジェクトです。

## 🚀 機能

- **自動コード生成**: Claude AIを使用してTypeScriptコードを自動生成
- **AWS Bedrock対応**: Claude Sonnet 4をAWS Bedrock経由で利用可能
- **GitHub Actions統合**: プルリクエストやマニュアルトリガーでコード生成を実行
- **型安全**: TypeScriptによる型安全なコード生成（type使用、関数型重視）
- **カスタマイズ可能**: プロンプトと出力ファイルを自由に設定可能

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

**方法1: Anthropic Direct API（デフォルト）**
- `ANTHROPIC_API_KEY`: AnthropicのAPIキー

**方法2: AWS Bedrock経由（Claude Sonnet 4使用）**
- `CLAUDE_CODE_USE_BEDROCK`: `1`に設定
- `AWS_REGION`: AWS リージョン（例: `ap-northeast-1`）
- `ANTHROPIC_MODEL`: モデルID（例: `apac.anthropic.claude-sonnet-4-20250514-v1:0`）
- `AWS_BEARER_TOKEN_BEDROCK`: AWS Bearer Token（オプション）

### 4. API設定の取得

#### Anthropic Direct API
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keysページで新しいキーを生成
4. 生成されたキーを安全に保存

#### AWS Bedrock
1. AWS アカウントにログイン
2. Bedrockサービスでモデルアクセスを有効化
3. 必要に応じてBearer Tokenを取得

## 🎯 使用方法

### GitHub Actionsでの自動実行

#### 手動実行
1. GitHubリポジトリの**Actions**タブを開く
2. **AI Code Generation with Claude**ワークフローを選択
3. **Run workflow**をクリック
4. プロンプトと出力ファイル名を入力して実行

#### プロンプトファイル更新時の自動実行
`prompts/`ディレクトリ内のファイルを更新してプッシュすると、自動的にコード生成が実行されます。

### ローカルでの実行

```bash
# 開発用（TypeScriptを直接実行）
INPUT_PROMPT="TypeScriptでTodoリストを管理するクラスを作成してください" \
OUTPUT_FILE="generated/todo.ts" \
npm run dev

# ビルド後実行
npm run build
INPUT_PROMPT="Express.jsのREST APIを作成してください" \
OUTPUT_FILE="generated/api.ts" \
npm run generate
```

## 📁 プロジェクト構成

```
├── .github/
│   └── workflows/
│       └── code-generation.yml    # GitHub Actionsワークフロー
├── src/
│   └── generate.ts                # メインのコード生成スクリプト
├── prompts/
│   └── example-prompts.md         # サンプルプロンプト集
├── generated/                     # 生成されたコードの出力先
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ 設定オプション

### 環境変数

| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|-------------|------|
| `CLAUDE_CODE_USE_BEDROCK` | Bedrockを使用するか（1で有効） | - | Bedrock使用時 |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | - | Direct API使用時 |
| `AWS_REGION` | AWS リージョン | - | Bedrock使用時 |
| `ANTHROPIC_MODEL` | モデルID | - | Bedrock使用時 |
| `AWS_BEARER_TOKEN_BEDROCK` | AWS Bearer Token | - | オプション |
| `INPUT_PROMPT` | コード生成用のプロンプト | "TypeScriptでHello Worldを出力する関数を作成してください" | - |
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

### コード生成ロジックの変更

`src/generate.ts`の`ClaudeCodeGenerator`クラスを編集することで、以下をカスタマイズできます：

- システムプロンプト
- 使用するAIモデル
- 最大トークン数
- レスポンスの解析ロジック

### ワークフローの変更

`.github/workflows/code-generation.yml`を編集することで、以下をカスタマイズできます：

- トリガー条件
- 実行環境
- 生成後の処理（コミット、PR作成など）

## 🚨 注意事項

- **APIキーの管理**: APIキーは絶対にコードにハードコードしないでください
- **コスト管理**: Claude APIは従量課金制です。大量のコード生成時はコストにご注意ください
- **生成コードの検証**: AIが生成したコードは必ず動作確認とセキュリティチェックを行ってください

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

---

**注意**: このプロジェクトは教育・デモンストレーション目的で作成されています。本番環境で使用する際は、適切なセキュリティ対策とテストを実施してください。