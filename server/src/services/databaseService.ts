import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize SQLite database
    const dbPath = path.join(dataDir, 'app.db');
    this.db = new Database(dbPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Initialize tables
    this.initializeTables();
  }

  private initializeTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'trial', 'starter', 'professional', 'enterprise')),
        trial_start_date TEXT,
        trial_end_date TEXT,
        trial_plan_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    this.addMissingColumns();

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, slug)
      )
    `);

    // Project usage table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS project_usage (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        faq_count INTEGER DEFAULT 0,
        chat_count INTEGER DEFAULT 0,
        daily_chat_count INTEGER DEFAULT 0,
        last_chat_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Payment intents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_intents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        interval TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        transaction_id TEXT,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // FAQs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS faqs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        view_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Embeddings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        text TEXT NOT NULL,
        embedding TEXT NOT NULL,
        faq_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (faq_id) REFERENCES faqs (id) ON DELETE CASCADE
      )
    `);

    // Content sources table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS content_sources (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('file', 'url')),
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        file_size INTEGER,
        url TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // AI Provider Configs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_provider_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        provider_type TEXT NOT NULL CHECK(provider_type IN ('openai', 'gemini', 'huggingface', 'ollama')),
        api_key TEXT,
        model TEXT,
        embedding_model TEXT,
        base_url TEXT,
        is_active BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, provider_type)
      )
    `);

    // Payment intents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_intents (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        planId TEXT NOT NULL,
        interval TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        transactionId TEXT,
        completedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_faqs_project_id ON faqs(project_id);
      CREATE INDEX IF NOT EXISTS idx_embeddings_project_id ON embeddings(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_usage_project_id ON project_usage(project_id);
    `);
  }

  private addMissingColumns() {
    try {
      // Check if subscription columns exist, if not add them
      const columns = this.db.pragma('table_info(users)') as any[];
      const columnNames = columns.map(col => col.name);
      
      if (!columnNames.includes('subscription_id')) {
        this.db.exec('ALTER TABLE users ADD COLUMN subscription_id TEXT');
      }
      if (!columnNames.includes('subscription_status')) {
        this.db.exec('ALTER TABLE users ADD COLUMN subscription_status TEXT');
      }
      if (!columnNames.includes('subscription_start_date')) {
        this.db.exec('ALTER TABLE users ADD COLUMN subscription_start_date TEXT');
      }
      if (!columnNames.includes('subscription_end_date')) {
        this.db.exec('ALTER TABLE users ADD COLUMN subscription_end_date TEXT');
      }
      if (!columnNames.includes('interval')) {
        this.db.exec('ALTER TABLE users ADD COLUMN interval TEXT DEFAULT "month"');
      }
      if (!columnNames.includes('trialStartDate')) {
        this.db.exec('ALTER TABLE users ADD COLUMN trialStartDate TEXT');
      }
      if (!columnNames.includes('trialEndDate')) {
        this.db.exec('ALTER TABLE users ADD COLUMN trialEndDate TEXT');
      }
      if (!columnNames.includes('trial_plan_id')) {
        this.db.exec('ALTER TABLE users ADD COLUMN trial_plan_id TEXT');
      }

      // Check if category column exists in faqs table, if not add it
      const faqColumns = this.db.pragma('table_info(faqs)') as any[];
      const faqColumnNames = faqColumns.map(col => col.name);
      
      if (!faqColumnNames.includes('category')) {
        this.db.exec('ALTER TABLE faqs ADD COLUMN category TEXT');
      }
    } catch (error) {
      console.log('Migration completed or no migration needed:', error);
    }
  }

  // User methods
  createUser(userData: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    plan?: string;
    trialStartDate?: string;
    trialEndDate?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, plan, trial_start_date, trial_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      userData.id,
      userData.email,
      userData.passwordHash,
      userData.name,
      userData.plan || 'free',
      userData.trialStartDate || null,
      userData.trialEndDate || null
    );
  }

  getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as any;
  }

  getUserById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as any;
  }

  updateUser(id: string, updates: Partial<{
    name: string;
    plan: string;
    trialStartDate: string;
    trialEndDate: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values);
  }

  // Project methods
  createProject(projectData: {
    id: string;
    userId: string;
    name: string;
    slug: string;
    description?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, user_id, name, slug, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      projectData.id,
      projectData.userId,
      projectData.name,
      projectData.slug,
      projectData.description || null
    );

    // Create project usage record
    const usageStmt = this.db.prepare(`
      INSERT INTO project_usage (id, project_id)
      VALUES (?, ?)
    `);
    usageStmt.run(this.generateId(), projectData.id);

    return result;
  }

  getProjectsByUserId(userId: string) {
    const stmt = this.db.prepare(`
      SELECT p.*, pu.faq_count, pu.chat_count, pu.daily_chat_count, pu.last_chat_date
      FROM projects p
      LEFT JOIN project_usage pu ON p.id = pu.project_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `);
    return stmt.all(userId) as any[];
  }

  getProjectById(projectId: string) {
    const stmt = this.db.prepare(`
      SELECT p.*, pu.faq_count, pu.chat_count, pu.daily_chat_count, pu.last_chat_date
      FROM projects p
      LEFT JOIN project_usage pu ON p.id = pu.project_id
      WHERE p.id = ?
    `);
    return stmt.get(projectId) as any;
  }

  getProjectBySlug(userId: string, slug: string) {
    const stmt = this.db.prepare(`
      SELECT p.*, pu.faq_count, pu.chat_count, pu.daily_chat_count, pu.last_chat_date
      FROM projects p
      LEFT JOIN project_usage pu ON p.id = pu.project_id
      WHERE p.user_id = ? AND p.slug = ?
    `);
    return stmt.get(userId, slug) as any;
  }

  getProjectBySlugPublic(slug: string) {
    const stmt = this.db.prepare(`
      SELECT p.*, pu.faq_count, pu.chat_count, pu.daily_chat_count, pu.last_chat_date
      FROM projects p
      LEFT JOIN project_usage pu ON p.id = pu.project_id
      WHERE p.slug = ?
    `);
    return stmt.get(slug) as any;
  }

  updateProject(projectId: string, updates: Partial<{
    name: string;
    slug: string;
    description: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(projectId);

    const stmt = this.db.prepare(`UPDATE projects SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values);
  }

  deleteProject(projectId: string) {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(projectId);
  }

  // FAQ methods
  createFAQ(faqData: {
    id: string;
    projectId: string;
    question: string;
    answer: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO faqs (id, project_id, question, answer)
      VALUES (?, ?, ?, ?)
    `);
    
    return stmt.run(faqData.id, faqData.projectId, faqData.question, faqData.answer);
  }

  getFAQsByProjectId(projectId: string) {
    const stmt = this.db.prepare('SELECT * FROM faqs WHERE project_id = ? ORDER BY created_at DESC');
    return stmt.all(projectId) as any[];
  }

  updateFAQ(faqId: string, updates: Partial<{
    question: string;
    answer: string;
  }>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(faqId);

    const stmt = this.db.prepare(`UPDATE faqs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    return stmt.run(...values);
  }

  deleteFAQ(faqId: string) {
    const stmt = this.db.prepare('DELETE FROM faqs WHERE id = ?');
    return stmt.run(faqId);
  }

  // Embedding methods
  createEmbedding(embeddingData: {
    id: string;
    projectId: string;
    text: string;
    embedding: number[];
    faqId?: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (id, project_id, text, embedding, faq_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      embeddingData.id,
      embeddingData.projectId,
      embeddingData.text,
      JSON.stringify(embeddingData.embedding),
      embeddingData.faqId || null
    );
  }

  getEmbeddingsByProjectId(projectId: string) {
    const stmt = this.db.prepare('SELECT * FROM embeddings WHERE project_id = ?');
    return stmt.all(projectId) as any[];
  }

  deleteEmbeddingsByProjectId(projectId: string) {
    const stmt = this.db.prepare('DELETE FROM embeddings WHERE project_id = ?');
    return stmt.run(projectId);
  }

  // Usage tracking methods
  updateProjectUsage(projectId: string, updates: Partial<{
    faqCount: number;
    chatCount: number;
    dailyChatCount: number;
    lastChatDate: string;
  }>) {
    // Ensure usage record exists
    this.ensureProjectUsage(projectId);

    // Map camelCase to snake_case for database
    const fieldMapping: { [key: string]: string } = {
      faqCount: 'faq_count',
      chatCount: 'chat_count',
      dailyChatCount: 'daily_chat_count',
      lastChatDate: 'last_chat_date'
    };

    const fields = Object.keys(updates).map(key => `${fieldMapping[key]} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(projectId);

    const stmt = this.db.prepare(`UPDATE project_usage SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?`);
    return stmt.run(...values);
  }

  ensureProjectUsage(projectId: string) {
    const existing = this.getProjectUsage(projectId);
    if (!existing) {
      const stmt = this.db.prepare(`
        INSERT INTO project_usage (id, project_id, faq_count, chat_count, daily_chat_count, last_chat_date)
        VALUES (?, ?, 0, 0, 0, ?)
      `);
      stmt.run(this.generateId(), projectId, new Date().toISOString());
    }
  }

  getProjectUsage(projectId: string) {
    const stmt = this.db.prepare('SELECT * FROM project_usage WHERE project_id = ?');
    return stmt.get(projectId) as any;
  }

  // Payment methods
  createPaymentIntent(paymentData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO payment_intents (id, user_id, plan_id, interval, amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      paymentData.id,
      paymentData.userId,
      paymentData.planId,
      paymentData.interval,
      paymentData.amount,
      paymentData.status,
      paymentData.createdAt
    );
  }

  updatePaymentIntent(orderId: string, updateData: any) {
    const stmt = this.db.prepare(`
      UPDATE payment_intents 
      SET status = ?, transaction_id = ?, completed_at = ?
      WHERE id = ?
    `);
    
    return stmt.run(
      updateData.status,
      updateData.transactionId,
      updateData.completedAt,
      orderId
    );
  }

  getPaymentIntent(orderId: string) {
    const stmt = this.db.prepare('SELECT * FROM payment_intents WHERE id = ?');
    return stmt.get(orderId) as any;
  }

  updateUserPlan(userId: string, planData: any) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET plan = ?, trial_start_date = ?, trial_end_date = ?, 
          subscription_id = ?, subscription_status = ?, 
          subscription_start_date = ?, subscription_end_date = ?,
          interval = ?, updated_at = ?
      WHERE id = ?
    `);
    
    return stmt.run(
      planData.plan,
      planData.trialStartDate,
      planData.trialEndDate,
      planData.subscriptionId,
      planData.subscriptionStatus,
      planData.subscriptionStartDate,
      planData.subscriptionEndDate,
      planData.interval,
      new Date().toISOString(),
      userId
    );
  }

  // Utility methods
  generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Content sources methods
  createContentSource(sourceData: {
    id: string;
    projectId: string;
    type: 'file' | 'url';
    name: string;
    content: string;
    fileSize?: number;
    url?: string;
    metadata?: any;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO content_sources (id, project_id, type, name, content, file_size, url, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      sourceData.id,
      sourceData.projectId,
      sourceData.type,
      sourceData.name,
      sourceData.content,
      sourceData.fileSize || null,
      sourceData.url || null,
      sourceData.metadata ? JSON.stringify(sourceData.metadata) : null,
      new Date().toISOString()
    );
  }

  getContentSources(projectId: string) {
    const stmt = this.db.prepare('SELECT * FROM content_sources WHERE project_id = ? ORDER BY created_at DESC');
    const sources = stmt.all(projectId) as any[];
    
    return sources.map(source => ({
      ...source,
      metadata: source.metadata ? JSON.parse(source.metadata) : null
    }));
  }

  getContentSource(sourceId: string) {
    const stmt = this.db.prepare('SELECT * FROM content_sources WHERE id = ?');
    const source = stmt.get(sourceId) as any;
    
    if (source) {
      return {
        ...source,
        metadata: source.metadata ? JSON.parse(source.metadata) : null
      };
    }
    return null;
  }

  deleteContentSource(sourceId: string) {
    const stmt = this.db.prepare('DELETE FROM content_sources WHERE id = ?');
    return stmt.run(sourceId);
  }

  // AI Provider Config methods
  createAIProviderConfig(configData: {
    userId: string;
    providerType: 'openai' | 'gemini' | 'huggingface' | 'ollama';
    apiKey?: string;
    model?: string;
    embeddingModel?: string;
    baseUrl?: string;
    isActive: boolean;
  }) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ai_provider_configs 
      (user_id, provider_type, api_key, model, embedding_model, base_url, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    return stmt.run(
      configData.userId,
      configData.providerType,
      configData.apiKey || null,
      configData.model || null,
      configData.embeddingModel || null,
      configData.baseUrl || null,
      configData.isActive ? 1 : 0
    );
  }

  getAIProviderConfigs(userId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM ai_provider_configs 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `);
    return stmt.all(userId) as any[];
  }

  getAIProviderConfig(userId: string, providerType?: string) {
    if (providerType) {
      const stmt = this.db.prepare(`
        SELECT * FROM ai_provider_configs 
        WHERE user_id = ? AND provider_type = ?
      `);
      return stmt.get(userId, providerType) as any;
    } else {
      const stmt = this.db.prepare(`
        SELECT * FROM ai_provider_configs 
        WHERE user_id = ? AND is_active = 1
        ORDER BY updated_at DESC
        LIMIT 1
      `);
      return stmt.get(userId) as any;
    }
  }

  updateAIProviderConfig(userId: string, providerType: string, updates: Partial<{
    apiKey: string;
    model: string;
    embeddingModel: string;
    baseUrl: string;
    isActive: boolean;
  }>) {
    const fields = Object.keys(updates).map(key => {
      if (key === 'isActive') return 'is_active = ?';
      return `${key} = ?`;
    }).join(', ');
    const values = Object.values(updates);
    values.push(userId, providerType);

    const stmt = this.db.prepare(`
      UPDATE ai_provider_configs 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND provider_type = ?
    `);
    return stmt.run(...values);
  }

  deleteAIProviderConfig(userId: string, providerType: string) {
    const stmt = this.db.prepare(`
      DELETE FROM ai_provider_configs 
      WHERE user_id = ? AND provider_type = ?
    `);
    return stmt.run(userId, providerType);
  }

  close() {
    this.db.close();
  }
}

export const databaseService = new DatabaseService();
