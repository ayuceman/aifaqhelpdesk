import React from 'react';
import { Link } from 'react-router-dom';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</Link>
              <Link to="/demo" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Demo</Link>
              <Link to="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</Link>
              <Link to="/privacy" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Privacy</Link>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
            <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-8">
                By accessing and using AI FAQ Generator ("Service"), you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-600 mb-6">
                AI FAQ Generator is an enterprise-grade platform that uses artificial intelligence to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Generate intelligent FAQ content from your documents</li>
                <li>Create embeddable chat widgets for your websites</li>
                <li>Provide AI-powered customer support solutions</li>
                <li>Analyze and optimize your content for better user experience</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-slate-600 mb-6">
                To access certain features of the Service, you may be required to register for an account. 
                You agree to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Acceptable Use Policy</h2>
              <p className="text-slate-600 mb-6">
                You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. 
                You may not use the Service in any manner that:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes on the rights of others</li>
                <li>Contains harmful, threatening, or offensive content</li>
                <li>Attempts to gain unauthorized access to our systems</li>
                <li>Interferes with the proper functioning of the Service</li>
                <li>Uses automated systems to access the Service without permission</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Content and Intellectual Property</h2>
              <p className="text-slate-600 mb-6">
                You retain ownership of all content you upload to the Service. By using the Service, you grant us:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>A license to process your content for FAQ generation</li>
                <li>Permission to use anonymized data to improve our AI models</li>
                <li>The right to store and backup your content securely</li>
                <li>Authorization to display your content in generated FAQs</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. AI-Generated Content</h2>
              <p className="text-slate-600 mb-8">
                Our AI generates content based on your input. While we strive for accuracy, AI-generated content 
                may not always be perfect. You are responsible for reviewing and editing generated content before 
                publishing. We do not guarantee the accuracy, completeness, or suitability of AI-generated content.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Payment and Billing</h2>
              <p className="text-slate-600 mb-6">
                If you subscribe to a paid plan:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Fees are billed in advance on a recurring basis</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>We may change our pricing with 30 days' notice</li>
                <li>You may cancel your subscription at any time</li>
                <li>Access to paid features continues until the end of your billing period</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Service Availability</h2>
              <p className="text-slate-600 mb-8">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                We may temporarily suspend the Service for maintenance, updates, or other operational reasons. 
                We will provide reasonable notice when possible.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Data Security and Privacy</h2>
              <p className="text-slate-600 mb-8">
                We implement industry-standard security measures to protect your data. However, no system is 
                completely secure. You acknowledge that you use the Service at your own risk and that we 
                cannot guarantee absolute security of your data.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-600 mb-8">
                To the maximum extent permitted by law, AI FAQ Generator shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to loss of 
                profits, data, or business opportunities, arising from your use of the Service.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-600 mb-8">
                You agree to indemnify and hold harmless AI FAQ Generator from any claims, damages, or expenses 
                arising from your use of the Service, violation of these Terms, or infringement of any rights 
                of another party.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Termination</h2>
              <p className="text-slate-600 mb-6">
                We may terminate or suspend your account and access to the Service immediately, without prior 
                notice, for any reason, including:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>At our sole discretion</li>
              </ul>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to Terms</h2>
              <p className="text-slate-600 mb-8">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes via email or through the Service. Your continued use of the Service after changes 
                constitutes acceptance of the new Terms.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Governing Law</h2>
              <p className="text-slate-600 mb-8">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                where AI FAQ Generator is incorporated, without regard to conflict of law principles.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Contact Information</h2>
              <p className="text-slate-600 mb-8">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-slate-700">
                  <strong>Email:</strong> legal@aifaqgenerator.com<br />
                  <strong>Address:</strong> AI FAQ Generator, Legal Team<br />
                  <strong>Response Time:</strong> We will respond to your inquiry within 5 business days
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

export default TermsOfService;