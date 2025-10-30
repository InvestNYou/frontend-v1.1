import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <div className="privacy-header">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <section>
          <h2>1. Introduction</h2>
          <p>
            InvestNYou ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial literacy education platform ("Service"). Please read this Privacy Policy carefully.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide Directly</h3>
          <div className="info-section">
            <h4>Account Information:</h4>
            <ul>
              <li>Email address</li>
              <li>Username</li>
              <li>Password (encrypted and stored securely)</li>
              <li>Profile information (optional)</li>
            </ul>
            
            <h4>Educational Progress Data:</h4>
            <ul>
              <li>Course completion status</li>
              <li>Lesson progress</li>
              <li>Quiz scores and results</li>
              <li>XP points and achievement badges</li>
              <li>Learning streaks and statistics</li>
            </ul>
            
            <h4>Portfolio Simulation Data:</h4>
            <ul>
              <li>Virtual trading transactions</li>
              <li>Portfolio holdings and performance</li>
              <li>Watchlist preferences</li>
              <li>Investment preferences and goals</li>
            </ul>
            
            <h4>Communication Data:</h4>
            <ul>
              <li>Messages sent through our AI chat feature</li>
              <li>Support requests and communications</li>
              <li>Feedback and survey responses</li>
            </ul>
          </div>

          <h3>2.2 Information Collected Automatically</h3>
          <div className="info-section">
            <h4>Usage Data:</h4>
            <ul>
              <li>Pages visited and time spent on each page</li>
              <li>Features used and frequency of use</li>
              <li>Click patterns and navigation paths</li>
              <li>Session duration and frequency</li>
            </ul>
            
            <h4>Device Information:</h4>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device type (mobile, tablet, desktop)</li>
              <li>Screen resolution and settings</li>
            </ul>
            
            <h4>Technical Data:</h4>
            <ul>
              <li>Log files and error reports</li>
              <li>Performance metrics</li>
              <li>Security and authentication logs</li>
            </ul>
          </div>

          <h3>2.3 Information from Third Parties</h3>
          <div className="info-section">
            <h4>Stock Market Data:</h4>
            <ul>
              <li>Real-time stock prices and market data</li>
              <li>Historical price information</li>
              <li>Company information and financial metrics</li>
            </ul>
            
            <h4>AI Service Providers:</h4>
            <ul>
              <li>Chat interactions processed by third-party AI services</li>
              <li>Response generation and improvement data</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          
          <h3>3.1 Service Provision</h3>
          <ul>
            <li>Provide and maintain the educational platform</li>
            <li>Process your account registration and authentication</li>
            <li>Track your learning progress and achievements</li>
            <li>Deliver personalized educational content</li>
            <li>Operate the virtual portfolio simulation</li>
          </ul>
          
          <h3>3.2 Communication</h3>
          <ul>
            <li>Send important service updates and notifications</li>
            <li>Respond to your support requests</li>
            <li>Provide educational reminders and tips</li>
            <li>Send newsletters and educational content (with your consent)</li>
          </ul>
          
          <h3>3.3 Improvement and Analytics</h3>
          <ul>
            <li>Analyze usage patterns to improve our Service</li>
            <li>Develop new features and educational content</li>
            <li>Conduct research on financial literacy education</li>
            <li>Monitor and prevent fraud and abuse</li>
          </ul>
          
          <h3>3.4 Legal Compliance</h3>
          <ul>
            <li>Comply with applicable laws and regulations</li>
            <li>Respond to legal requests and court orders</li>
            <li>Protect our rights and the rights of our users</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          
          <h3>4.1 We Do Not Sell Personal Information</h3>
          <p>We do not sell, rent, or trade your personal information to third parties for monetary compensation.</p>
          
          <h3>4.2 Service Providers</h3>
          <p>We may share information with trusted third-party service providers who assist us in operating our Service:</p>
          <div className="info-section">
            <h4>Data Processing Partners:</h4>
            <ul>
              <li>Cloud hosting providers (for data storage and processing)</li>
              <li>Analytics services (for usage analysis and improvement)</li>
              <li>Email service providers (for communications)</li>
              <li>AI service providers (for chat functionality)</li>
            </ul>
            
            <h4>Stock Data Providers:</h4>
            <ul>
              <li>Financial data vendors (for real-time market information)</li>
              <li>Market data aggregators (for educational content)</li>
            </ul>
          </div>
          
          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required by law or if we believe such action is necessary to:</p>
          <ul>
            <li>Comply with legal obligations</li>
            <li>Protect and defend our rights or property</li>
            <li>Prevent fraud or abuse</li>
            <li>Protect the safety of our users</li>
          </ul>
          
          <h3>4.4 Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction, subject to the same privacy protections.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          
          <h3>5.1 Security Measures</h3>
          <p>We implement appropriate technical and organizational measures to protect your information:</p>
          <div className="info-section">
            <h4>Technical Safeguards:</h4>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Monitoring for unauthorized access</li>
            </ul>
            
            <h4>Administrative Safeguards:</h4>
            <ul>
              <li>Employee training on data protection</li>
              <li>Access controls and authorization procedures</li>
              <li>Incident response procedures</li>
              <li>Regular security assessments</li>
            </ul>
          </div>
          
          <h3>5.2 Data Breach Response</h3>
          <p>In the event of a data breach, we will:</p>
          <ul>
            <li>Notify affected users within 72 hours (where required by law)</li>
            <li>Report to relevant authorities as required</li>
            <li>Take immediate steps to contain and remediate the breach</li>
            <li>Provide guidance on protective measures</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          
          <h3>6.1 Retention Periods</h3>
          <p>We retain your information for different periods depending on the type of data:</p>
          <ul>
            <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period after closure</li>
            <li><strong>Educational Progress:</strong> Retained to maintain your learning history and achievements</li>
            <li><strong>Communication Data:</strong> Retained for customer support and service improvement purposes</li>
            <li><strong>Usage Analytics:</strong> Retained in aggregated, anonymized form for research and improvement</li>
          </ul>
          
          <h3>6.2 Deletion Rights</h3>
          <p>You may request deletion of your personal information, subject to:</p>
          <ul>
            <li>Legal obligations requiring retention</li>
            <li>Legitimate business interests</li>
            <li>Technical limitations of deletion</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights and Choices</h2>
          
          <h3>7.1 Access and Control</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to certain processing activities</li>
            <li>Request data portability</li>
          </ul>
          
          <h3>7.2 Account Management</h3>
          <ul>
            <li>Update your profile information through your account settings</li>
            <li>Change your password and security settings</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
          </ul>
          
          <h3>7.3 Cookie Preferences</h3>
          <ul>
            <li>Manage cookie settings through your browser</li>
            <li>Opt out of non-essential cookies</li>
            <li>Clear stored cookies and data</li>
          </ul>
        </section>

        <section>
          <h2>8. Children's Privacy (COPPA Compliance)</h2>
          
          <h3>8.1 Age Restrictions</h3>
          <ul>
            <li>We do not knowingly collect personal information from children under 13</li>
            <li>Users under 13 may not create accounts without verifiable parental consent</li>
            <li>Users between 13-18 should have parental guidance</li>
          </ul>
          
          <h3>8.2 Parental Rights</h3>
          <p>Parents have the right to:</p>
          <ul>
            <li>Review their child's personal information</li>
            <li>Request deletion of their child's information</li>
            <li>Refuse further collection of their child's information</li>
            <li>Revoke consent at any time</li>
          </ul>
          
          <h3>8.3 Contact for Parental Requests</h3>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@investnyou.app</p>
            <p><strong>Subject:</strong> "Parental Request - Child's Account"</p>
          </div>
        </section>

        <section>
          <h2>9. International Data Transfers</h2>
          
          <h3>9.1 Cross-Border Transfers</h3>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
          
          <h3>9.2 Adequacy Decisions</h3>
          <p>We rely on:</p>
          <ul>
            <li>Adequacy decisions by relevant data protection authorities</li>
            <li>Standard contractual clauses approved by regulatory bodies</li>
            <li>Other appropriate safeguards as required by law</li>
          </ul>
        </section>

        <section>
          <h2>10. Regional Privacy Rights</h2>
          
          <h3>10.1 European Union (GDPR)</h3>
          <p>If you are in the EU, you have additional rights under the General Data Protection Regulation:</p>
          <ul>
            <li>Right to be informed about data processing</li>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Rights related to automated decision-making</li>
          </ul>
          
          <h3>10.2 California (CCPA)</h3>
          <p>If you are a California resident, you have rights under the California Consumer Privacy Act:</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>
          
          <h3>10.3 Other Jurisdictions</h3>
          <p>We comply with applicable privacy laws in all jurisdictions where we operate.</p>
        </section>

        <section>
          <h2>11. Cookies and Tracking Technologies</h2>
          
          <h3>11.1 Types of Cookies</h3>
          <p>We use different types of cookies:</p>
          <div className="info-section">
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic Service functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
            </ul>
          </div>
          
          <h3>11.2 Cookie Management</h3>
          <ul>
            <li>You can control cookies through your browser settings</li>
            <li>Disabling certain cookies may affect Service functionality</li>
            <li>We provide cookie preference controls where required by law</li>
          </ul>
        </section>

        <section>
          <h2>12. Third-Party Services</h2>
          
          <h3>12.1 External Links</h3>
          <p>Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.</p>
          
          <h3>12.2 Integrated Services</h3>
          <p>We integrate with third-party services for:</p>
          <ul>
            <li>Stock market data provision</li>
            <li>AI chat functionality</li>
            <li>Analytics and performance monitoring</li>
            <li>Email communications</li>
          </ul>
        </section>

        <section>
          <h2>13. Changes to This Privacy Policy</h2>
          
          <h3>13.1 Updates</h3>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by:</p>
          <ul>
            <li>Posting the updated policy on our website</li>
            <li>Sending email notifications to registered users</li>
            <li>Providing in-app notifications for material changes</li>
          </ul>
          
          <h3>13.2 Effective Date</h3>
          <p>Changes will be effective immediately upon posting, unless otherwise specified. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2>14. Contact Information</h2>
          
          <h3>14.1 Privacy Inquiries</h3>
          <p>For questions about this Privacy Policy or our privacy practices, contact us at:</p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@investnyou.app</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
            <p><strong>Phone:</strong> [Your Phone Number]</p>
          </div>
          
          <h3>14.2 Data Protection Officer</h3>
          <p>If you are in the EU and need to contact our Data Protection Officer:</p>
          <div className="contact-info">
            <p><strong>Email:</strong> dpo@investnyou.app</p>
          </div>
          
          <h3>14.3 Response Time</h3>
          <p>We will respond to privacy inquiries within 30 days (or as required by applicable law).</p>
        </section>

        <section>
          <h2>15. Compliance and Certifications</h2>
          <p>We are committed to maintaining high standards of data protection and regularly review our practices to ensure compliance with applicable privacy laws and industry standards.</p>
        </section>

        <div className="legal-notice">
          <p><em>Note: This Privacy Policy is a template and should be reviewed by legal counsel before implementation. Specific jurisdictions may have additional requirements, and the policy should be customized based on your specific data practices and applicable laws.</em></p>
        </div>

        <div className="legal-links">
          <Link to="/terms" className="legal-link">
            Terms of Service
          </Link>
          <Link to="/" className="legal-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
