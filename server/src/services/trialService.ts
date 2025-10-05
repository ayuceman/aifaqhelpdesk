import fs from 'fs';
import path from 'path';

interface TrialData {
  projectId: string;
  startDate: string;
  endDate: string;
  faqCount: number;
  chatCount: number;
  dailyChatCount: number;
  lastChatDate: string;
  isActive: boolean;
  plan: 'trial' | 'paid';
}

interface TrialLimits {
  maxFAQs: number;
  maxChatQuestionsPerDay: number;
  maxChatQuestionsTotal: number;
  trialDays: number;
}

const TRIAL_LIMITS: TrialLimits = {
  maxFAQs: 50,
  maxChatQuestionsPerDay: 100,
  maxChatQuestionsTotal: 1000,
  trialDays: 14
};

const FREE_PLAN_LIMITS: TrialLimits = {
  maxFAQs: 100,
  maxChatQuestionsPerDay: 50,
  maxChatQuestionsTotal: 500,
  trialDays: 0 // No expiration for free plan
};

export class TrialService {
  private getTrialDataPath(projectId: string): string {
    return path.join(process.cwd(), 'data', 'projects', projectId, 'trial.json');
  }

  private getTrialData(projectId: string): TrialData | null {
    try {
      const filePath = this.getTrialDataPath(projectId);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading trial data:', error);
      return null;
    }
  }

  private saveTrialData(projectId: string, data: TrialData): void {
    try {
      const filePath = this.getTrialDataPath(projectId);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving trial data:', error);
    }
  }

  async initializeTrial(projectId: string): Promise<TrialData> {
    const existingTrial = this.getTrialData(projectId);
    
    if (existingTrial && existingTrial.isActive) {
      return existingTrial;
    }

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + TRIAL_LIMITS.trialDays * 24 * 60 * 60 * 1000).toISOString();

    const trialData: TrialData = {
      projectId,
      startDate,
      endDate,
      faqCount: 0,
      chatCount: 0,
      dailyChatCount: 0,
      lastChatDate: startDate,
      isActive: true,
      plan: 'trial'
    };

    this.saveTrialData(projectId, trialData);
    return trialData;
  }

  async getTrialStatus(projectId: string): Promise<{
    isActive: boolean;
    daysRemaining: number;
    faqCount: number;
    chatCount: number;
    dailyChatCount: number;
    limits: TrialLimits;
    isExpired: boolean;
    isOverLimit: boolean;
    plan: string;
  }> {
    const trialData = this.getTrialData(projectId);
    
    if (!trialData) {
      return {
        isActive: false,
        daysRemaining: 0,
        faqCount: 0,
        chatCount: 0,
        dailyChatCount: 0,
        limits: TRIAL_LIMITS,
        isExpired: true,
        isOverLimit: false,
        plan: 'none'
      };
    }

    const now = new Date();
    const endDate = new Date(trialData.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = now > endDate;
    
    // Use different limits based on plan type
    const limits = trialData.plan === 'free' ? FREE_PLAN_LIMITS : TRIAL_LIMITS;
    const isOverLimit = trialData.faqCount >= limits.maxFAQs || 
                       trialData.chatCount >= limits.maxChatQuestionsTotal ||
                       trialData.dailyChatCount >= limits.maxChatQuestionsPerDay;

    return {
      isActive: trialData.isActive && !isExpired && !isOverLimit,
      daysRemaining: trialData.plan === 'free' ? 999 : daysRemaining, // Free plan shows as never expiring
      faqCount: trialData.faqCount,
      chatCount: trialData.chatCount,
      dailyChatCount: trialData.dailyChatCount,
      limits,
      isExpired: trialData.plan === 'free' ? false : isExpired,
      isOverLimit,
      plan: trialData.plan
    };
  }

  async incrementFAQCount(projectId: string): Promise<boolean> {
    const trialData = this.getTrialData(projectId);
    if (!trialData) {
      return false;
    }

    if (trialData.faqCount >= TRIAL_LIMITS.maxFAQs) {
      return false;
    }

    trialData.faqCount++;
    this.saveTrialData(projectId, trialData);
    return true;
  }

  async incrementChatCount(projectId: string): Promise<boolean> {
    const trialData = this.getTrialData(projectId);
    if (!trialData) {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastChatDate = trialData.lastChatDate.split('T')[0];

    // Reset daily count if it's a new day
    if (today !== lastChatDate) {
      trialData.dailyChatCount = 0;
      trialData.lastChatDate = today;
    }

    // Check limits
    if (trialData.chatCount >= TRIAL_LIMITS.maxChatQuestionsTotal ||
        trialData.dailyChatCount >= TRIAL_LIMITS.maxChatQuestionsPerDay) {
      return false;
    }

    trialData.chatCount++;
    trialData.dailyChatCount++;
    this.saveTrialData(projectId, trialData);
    return true;
  }

  async upgradeToPaid(projectId: string): Promise<void> {
    const trialData = this.getTrialData(projectId);
    if (trialData) {
      trialData.plan = 'paid';
      trialData.isActive = true;
      this.saveTrialData(projectId, trialData);
    }
  }

  async resetDailyChatCount(projectId: string): Promise<void> {
    const trialData = this.getTrialData(projectId);
    if (trialData) {
      trialData.dailyChatCount = 0;
      trialData.lastChatDate = new Date().toISOString();
      this.saveTrialData(projectId, trialData);
    }
  }

  async initializeFreePlan(projectId: string): Promise<TrialData> {
    const existingTrial = this.getTrialData(projectId);
    
    if (existingTrial && existingTrial.plan === 'free') {
      return existingTrial;
    }

    const startDate = new Date().toISOString();
    // Free plan never expires
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now

    const trialData: TrialData = {
      projectId,
      startDate,
      endDate,
      faqCount: 0,
      chatCount: 0,
      dailyChatCount: 0,
      lastChatDate: startDate,
      isActive: true,
      plan: 'free'
    };

    this.saveTrialData(projectId, trialData);
    return trialData;
  }

  async getFreePlanLimits(): Promise<TrialLimits> {
    return FREE_PLAN_LIMITS;
  }
}

export const trialService = new TrialService();
