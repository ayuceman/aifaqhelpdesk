import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={onBack}
          className="mb-8 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Collection</h2>
              <p>
                We collect only the information necessary to provide our FAQ generation service. This includes:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Documents and content you upload for FAQ generation</li>
                <li>Generated FAQ questions and answers</li>
                <li>Chat interactions with the FAQ widget</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">How We Use Your Data</h2>
              <p>
                Your data is used exclusively to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Generate FAQ content from your uploaded materials</li>
                <li>Provide answers through the chat widget</li>
                <li>Improve our service quality and accuracy</li>
              </ul>
              <p className="mt-3">
                <strong>We do not sell, rent, or share your data with third parties for marketing purposes.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Storage</h2>
              <p>
                By default, all data is stored locally on your server. If you choose to deploy with cloud storage:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Data is encrypted in transit and at rest</li>
                <li>Access is restricted to authorized personnel only</li>
                <li>We retain data only as long as necessary to provide the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
              <p>
                We may use third-party AI services (OpenAI, Ollama) to process your content. These services:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Process content only to generate responses</li>
                <li>Do not store your data permanently (per their policies)</li>
                <li>Are bound by their own privacy policies and terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access your data at any time</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of data collection (service functionality will be limited)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Rate limiting to prevent abuse</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                For data deletion requests or privacy questions, email us at:{' '}
                <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">
                  support@yourcompany.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of significant changes 
                by updating the "Last updated" date at the top of this page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

