import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface AIProviderConfigAttributes {
  id?: number;
  userId: string;
  providerType: 'openai' | 'gemini' | 'huggingface' | 'ollama';
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AIProviderConfig extends Model<AIProviderConfigAttributes> implements AIProviderConfigAttributes {
  public id!: number;
  public userId!: string;
  public providerType!: 'openai' | 'gemini' | 'huggingface' | 'ollama';
  public apiKey?: string;
  public model?: string;
  public embeddingModel?: string;
  public baseUrl?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIProviderConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerType: {
      type: DataTypes.ENUM('openai', 'gemini', 'huggingface', 'ollama'),
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    embeddingModel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_provider_configs',
    timestamps: true,
  }
);

export default AIProviderConfig;
