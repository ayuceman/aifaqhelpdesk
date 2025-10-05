import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  faqCount: number;
  chatCount: number;
  dailyChatCount: number;
  limits: {
    maxFAQs: number;
    maxChatQuestionsPerDay: number;
    maxChatQuestionsTotal: number;
    trialDays: number;
  };
  isExpired: boolean;
  isOverLimit: boolean;
}

interface TrialStatusProps {
  project?: string;
  onUpgrade?: () => void;
}

const TrialStatus: React.FC<TrialStatusProps> = ({ project = 'default', onUpgrade }) => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
  }, [project]);

  const fetchTrialStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/faq/trial-status?project=${project}`);
      setTrialStatus(response.data.trialStatus);
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!trialStatus) {
    return null;
  }

  const faqPercentage = (trialStatus.faqCount / trialStatus.limits.maxFAQs) * 100;
  const chatPercentage = (trialStatus.chatCount / trialStatus.limits.maxChatQuestionsTotal) * 100;
  const dailyChatPercentage = (trialStatus.dailyChatCount / trialStatus.limits.maxChatQuestionsPerDay) * 100;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {trialStatus.isActive ? 'Trial Status' : 'Trial Expired'}
        </h3>
        {trialStatus.isActive && (
          <span className="text-sm text-slate-600">
            {trialStatus.daysRemaining} days remaining
          </span>
        )}
      </div>

      {trialStatus.isActive ? (
        <div className="space-y-4">
          {/* FAQ Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">FAQs</span>
              <span className="text-slate-900 font-medium">
                {trialStatus.faqCount} / {trialStatus.limits.maxFAQs}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(faqPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Chat Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Total Chat Questions</span>
              <span className="text-slate-900 font-medium">
                {trialStatus.chatCount} / {trialStatus.limits.maxChatQuestionsTotal}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(chatPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Daily Chat Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Today's Chat Questions</span>
              <span className="text-slate-900 font-medium">
                {trialStatus.dailyChatCount} / {trialStatus.limits.maxChatQuestionsPerDay}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dailyChatPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={onUpgrade}
              className="btn-primary w-full"
            >
              Upgrade to Paid Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="font-semibold">Trial Expired</p>
            <p className="text-sm text-slate-600 mt-1">
              Your 14-day trial has ended. Upgrade to continue using the service.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="btn-primary w-full mt-4"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default TrialStatus;
