import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-slate-900">FAQ Generator</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
              <a href="/demo" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Demo</a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
              <button
                onClick={onBack}
                className="btn-ghost"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 lg:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
            <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              <p className="text-slate-600 mb-6">
                We collect information you provide directly to us, such as when you create an account, 
                upload content, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Account information (name, email address, company)</li>
                <li>Content you upload for FAQ generation</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-600 mb-6">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your content to generate FAQs using AI</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Data Processing and AI</h2>
              <p className="text-slate-600 mb-6">
                When you upload content for FAQ generation, we process this data using AI models to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Analyze and understand your content</li>
                <li>Generate relevant questions and answers</li>
                <li>Create embeddings for search functionality</li>
                <li>Improve our AI models (anonymized data only)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
              <p className="text-slate-600 mb-6">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>End-to-end encryption for data in transit and at rest</li>
                <li>SOC 2 Type II compliance</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication</li>
                <li>Data backup and disaster recovery procedures</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Sharing</h2>
              <p className="text-slate-600 mb-6">
                We do not sell, trade, or rent your personal information to third parties. We may share 
                information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>With trusted service providers (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights</h2>
              <p className="text-slate-600 mb-6">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of certain data processing activities</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data Retention</h2>
              <p className="text-slate-600 mb-8">
                We retain your information for as long as necessary to provide our services and comply 
                with legal obligations. When you delete your account, we will delete your personal 
                information within 30 days, unless we are required to retain it for legal reasons.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. International Transfers</h2>
              <p className="text-slate-600 mb-8">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for such transfers in accordance with 
                applicable data protection laws.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Children's Privacy</h2>
              <p className="text-slate-600 mb-8">
                Our services are not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected 
                personal information from a child under 13, we will take steps to delete such information.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-600 mb-8">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Contact Us</h2>
              <p className="text-slate-600 mb-8">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-slate-700">
                  <strong>Email:</strong> privacy@aifaqgenerator.com<br />
                  <strong>Address:</strong> AI FAQ Generator, Privacy Team<br />
                  <strong>Response Time:</strong> We will respond to your inquiry within 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} AI FAQ Generator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;