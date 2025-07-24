// 共通の型定義

export type CodeGenerationConfig = {
  prompt: string;
  outputFile: string;
  model?: string;
  maxTokens?: number;
  maxTurns?: number;
};

export type GeneratedCode = {
  content: string;
  language: string;
  explanation?: string;
  totalCostUsd?: number;
  sessionId?: string;
  modelName?: string;
  provider?: string;
};

export type BedrockConfig = {
  region: string;
  model: string;
  bearerToken?: string;
};

export type ProviderConfig = {
  useOfficialSDK?: boolean;
  useBedrock?: boolean;
  anthropicApiKey?: string;
  bedrockConfig?: BedrockConfig;
};

// プロバイダーの種類
export type ProviderType = 'official' | 'direct' | 'bedrock';

// コード生成プロバイダーのインターフェース
export interface ICodeGenerator {
  readonly providerType: ProviderType;
  generateCode(config: CodeGenerationConfig): Promise<GeneratedCode>;
}