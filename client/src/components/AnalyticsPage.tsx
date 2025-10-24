import React from 'react';
import DashboardLayout from './DashboardLayout';

interface AnalyticsPageProps {
  user: any;
  onLogout: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user, onLogout }) => {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600 mb-8">Track your FAQ performance and user engagement</p>
          
          {/* Coming Soon Message */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-200">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics Dashboard Coming Soon</h2>
              <p className="text-lg text-slate-600 mb-8">
                We're building comprehensive analytics to help you track:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-slate-900">Chat Volume</span>
                  </div>
                  <p className="text-sm text-slate-600">Track daily/monthly question volumes</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-slate-900">Top FAQs</span>
                  </div>
                  <p className="text-sm text-slate-600">Most frequently asked questions</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-slate-900">Response Quality</span>
                  </div>
                  <p className="text-sm text-slate-600">Accuracy and satisfaction metrics</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-slate-900">User Insights</span>
                  </div>
                  <p className="text-sm text-slate-600">Peak usage times and patterns</p>
                </div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 inline-block">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> In the meantime, check your Projects to see basic FAQ usage stats
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

