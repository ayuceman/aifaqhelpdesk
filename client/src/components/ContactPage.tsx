import React from 'react';

interface ContactPageProps {
  onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 mb-8">
            We're here to help! Get in touch with any questions, issues, or feedback.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support</h2>
              <p className="text-gray-700 mb-4">
                For technical support, bug reports, or questions about using the service:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Email:</p>
                <a 
                  href="mailto:support@yourcompany.com" 
                  className="text-2xl font-semibold text-blue-600 hover:text-blue-800"
                >
                  support@yourcompany.com
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                We typically respond within 24-48 hours during business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Questions</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">How do I get started?</h3>
                  <p className="text-gray-600">
                    Click "Get Started" on the home page, upload your content, and follow the 4-step process.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">What file formats are supported?</h3>
                  <p className="text-gray-600">
                    We support PDF, DOCX, TXT, Markdown files (up to 10MB), and website URLs.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Is my data secure?</h3>
                  <p className="text-gray-600">
                    Yes! Data is stored locally by default. We don't share or sell your information.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">How do I delete my data?</h3>
                  <p className="text-gray-600">
                    Email us at support@yourcompany.com with your project details, and we'll handle it promptly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feature Requests</h2>
              <p className="text-gray-700 mb-4">
                Have an idea for a new feature or improvement? We'd love to hear from you!
              </p>
              <p className="text-gray-600">
                Send your suggestions to{' '}
                <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">
                  support@yourcompany.com
                </a>{' '}
                with the subject line "Feature Request".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Business Inquiries</h2>
              <p className="text-gray-700 mb-4">
                Interested in enterprise plans, custom solutions, or partnerships?
              </p>
              <p className="text-gray-600">
                Contact us at{' '}
                <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">
                  support@yourcompany.com
                </a>{' '}
                with "Business Inquiry" in the subject line.
              </p>
            </section>

            <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Quick Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Getting Started Guide</li>
                    <li>• API Documentation</li>
                    <li>• Deployment Guide</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Resources</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a></li>
                    <li>• <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a></li>
                    <li>• Performance Tips</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

