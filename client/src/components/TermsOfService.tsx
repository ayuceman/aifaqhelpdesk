import React from 'react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p>
                By accessing or using AI FAQ Generator, you agree to be bound by these Terms of Service. 
                If you do not agree with any part of these terms, you may not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Service Description</h2>
              <p>
                AI FAQ Generator provides tools to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Generate FAQ content from uploaded documents or website URLs</li>
                <li>Edit and manage FAQ entries</li>
                <li>Deploy an embeddable chat widget for FAQ assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">As-Is Service</h2>
              <p>
                The service is provided <strong>"as is"</strong> without warranties of any kind, either express or implied. 
                We do not guarantee:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Uninterrupted or error-free operation</li>
                <li>100% accuracy of AI-generated content</li>
                <li>Compatibility with all browsers or devices</li>
                <li>Specific uptime or availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Review and verify all AI-generated content before publishing</li>
                <li>Not upload illegal, harmful, or copyrighted content without permission</li>
                <li>Not abuse the service through excessive requests or malicious activity</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Acceptable Use</h2>
              <p>You may not use this service to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Generate content that is illegal, defamatory, or harmful</li>
                <li>Violate intellectual property rights</li>
                <li>Distribute malware or engage in phishing</li>
                <li>Circumvent rate limits or security measures</li>
                <li>Reverse engineer or attempt to extract proprietary algorithms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Content Ownership</h2>
              <p>
                You retain ownership of all content you upload. By using the service, you grant us a license to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Process your content to generate FAQs</li>
                <li>Store and display your FAQs as part of the service</li>
                <li>Use anonymized data to improve the service</li>
              </ul>
              <p className="mt-3">
                AI-generated content is provided to you without additional restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, we shall not be liable for:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages arising from service interruptions or errors</li>
                <li>Inaccuracies in AI-generated content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Rate Limits</h2>
              <p>
                To ensure fair usage, we implement rate limiting:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Chat endpoint: 60 requests per 5 minutes per IP address</li>
                <li>File upload: 10MB maximum file size</li>
                <li>Website crawl: 250,000 character limit</li>
              </ul>
              <p className="mt-3">
                Excessive usage may result in temporary or permanent suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Termination</h2>
              <p>
                We reserve the right to suspend or terminate access to the service at any time for:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Violation of these terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Abuse of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Significant changes will be communicated by updating 
                the "Last updated" date. Continued use of the service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact</h2>
              <p>
                For questions about these terms, contact:{' '}
                <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">
                  support@yourcompany.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Governing Law</h2>
              <p>
                These terms are governed by applicable local laws. Any disputes shall be resolved through 
                good faith negotiation or, if necessary, binding arbitration.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

