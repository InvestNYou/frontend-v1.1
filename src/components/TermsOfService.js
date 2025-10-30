import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <div className="terms-content">
        <div className="terms-header">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to InvestNYou, a financial literacy education platform ("Service") operated by InvestNYou Team ("Company," "we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>InvestNYou is a comprehensive financial literacy platform that provides:</p>
          <ul>
            <li><strong>Educational Content:</strong> Courses, lessons, and daily facts about personal finance, investing, and financial planning</li>
            <li><strong>Virtual Portfolio Simulation:</strong> A simulated trading environment using real market data for educational purposes</li>
            <li><strong>AI-Powered Chat:</strong> Financial Q&A assistance using artificial intelligence</li>
            <li><strong>Progress Tracking:</strong> XP system, levels, badges, and achievement tracking</li>
            <li><strong>Stock Market Data:</strong> Real-time and historical stock information for educational use</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts and Registration</h2>
          <h3>3.1 Account Creation</h3>
          <ul>
            <li>You may create an account or use our Service in guest mode</li>
            <li>You must provide accurate and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must be at least 13 years old to create an account (see Section 12 for additional requirements for minors)</li>
          </ul>
          
          <h3>3.2 Account Security</h3>
          <ul>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
          </ul>
        </section>

        <section>
          <h2>4. Educational Purpose and Limitations</h2>
          <h3>4.1 Educational Nature</h3>
          <ul>
            <li>InvestNYou is designed for educational purposes only</li>
            <li>The virtual portfolio simulation is not real trading and involves no real money</li>
            <li>All financial information provided is for educational purposes and should not be considered as financial advice</li>
          </ul>
          
          <h3>4.2 No Financial Advice</h3>
          <ul>
            <li>We do not provide personalized financial advice</li>
            <li>Our content is general educational material</li>
            <li>You should consult with qualified financial professionals before making real financial decisions</li>
            <li>We are not responsible for any financial decisions you make based on information learned through our Service</li>
          </ul>
        </section>

        <section>
          <h2>5. User Conduct and Prohibited Activities</h2>
          <h3>5.1 Acceptable Use</h3>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful or malicious code</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for commercial purposes without permission</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Provide false or misleading information</li>
            <li>Interfere with the proper functioning of the Service</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property Rights</h2>
          <h3>6.1 Our Content</h3>
          <ul>
            <li>All content on InvestNYou, including text, graphics, logos, and software, is owned by us or our licensors</li>
            <li>You may not copy, modify, distribute, or create derivative works without permission</li>
            <li>Educational content may be used for personal learning purposes only</li>
          </ul>
          
          <h3>6.2 User-Generated Content</h3>
          <ul>
            <li>You retain ownership of content you create or submit</li>
            <li>By submitting content, you grant us a license to use, display, and distribute it in connection with the Service</li>
            <li>You represent that you have the right to submit any content you provide</li>
          </ul>
        </section>

        <section>
          <h2>7. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Services and Data</h2>
          <h3>8.1 Stock Market Data</h3>
          <ul>
            <li>We use third-party services to provide real-time stock market data</li>
            <li>We do not guarantee the accuracy, completeness, or timeliness of this data</li>
            <li>Market data is provided for educational purposes only</li>
          </ul>
          
          <h3>8.2 AI Services</h3>
          <ul>
            <li>Our chat feature uses third-party AI services</li>
            <li>AI responses are generated automatically and may not always be accurate</li>
            <li>You should verify any financial information provided by AI before making decisions</li>
          </ul>
        </section>

        <section>
          <h2>9. Disclaimers and Limitations of Liability</h2>
          <h3>9.1 Service Availability</h3>
          <ul>
            <li>We strive to maintain Service availability but cannot guarantee uninterrupted access</li>
            <li>We may modify, suspend, or discontinue the Service at any time</li>
            <li>We are not liable for any downtime or service interruptions</li>
          </ul>
          
          <h3>9.2 Educational Content</h3>
          <ul>
            <li>Educational content is provided "as is" without warranties</li>
            <li>We do not guarantee that the content will meet your specific needs</li>
            <li>Content may become outdated and should be verified independently</li>
          </ul>
          
          <h3>9.3 Limitation of Liability</h3>
          <p className="disclaimer">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING FROM YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless InvestNYou and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <h3>11.1 Termination by You</h3>
          <ul>
            <li>You may terminate your account at any time</li>
            <li>You may stop using the Service at any time</li>
          </ul>
          
          <h3>11.2 Termination by Us</h3>
          <ul>
            <li>We may suspend or terminate your access for violations of these Terms</li>
            <li>We may discontinue the Service with reasonable notice</li>
            <li>Upon termination, your right to use the Service ceases immediately</li>
          </ul>
        </section>

        <section>
          <h2>12. Children's Privacy (COPPA Compliance)</h2>
          <h3>12.1 Age Requirements</h3>
          <ul>
            <li>Users under 13 may not create accounts without parental consent</li>
            <li>Users between 13-18 should have parental guidance when using the Service</li>
            <li>We do not knowingly collect personal information from children under 13</li>
          </ul>
          
          <h3>12.2 Parental Rights</h3>
          <ul>
            <li>Parents may request to review, modify, or delete their child's information</li>
            <li>Parents may refuse further collection of their child's information</li>
            <li>Contact us at privacy@investnyou.app for parental requests</li>
          </ul>
        </section>

        <section>
          <h2>13. Modifications to Terms</h2>
          <ul>
            <li>We may modify these Terms at any time</li>
            <li>We will notify users of significant changes via email or through the Service</li>
            <li>Continued use of the Service after changes constitutes acceptance of new Terms</li>
            <li>Material changes will be effective 30 days after notification</li>
          </ul>
        </section>

        <section>
          <h2>14. Governing Law and Dispute Resolution</h2>
          <h3>14.1 Governing Law</h3>
          <p>These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>
          
          <h3>14.2 Dispute Resolution</h3>
          <ul>
            <li>We encourage resolving disputes through direct communication</li>
            <li>For formal disputes, we prefer binding arbitration over litigation</li>
            <li>You may opt out of arbitration within 30 days of account creation</li>
          </ul>
        </section>

        <section>
          <h2>15. Severability</h2>
          <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>
        </section>

        <section>
          <h2>16. Entire Agreement</h2>
          <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and InvestNYou regarding the Service.</p>
        </section>

        <section>
          <h2>17. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <div className="contact-info">
            <p><strong>Email:</strong> legal@investnyou.app</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
            <p><strong>Phone:</strong> [Your Phone Number]</p>
          </div>
        </section>

        <div className="legal-notice">
          <p><em>Note: This Terms of Service document is a template and should be reviewed by legal counsel before implementation. Specific jurisdictions may have additional requirements, and the document should be customized based on your specific business model and applicable laws.</em></p>
        </div>

        <div className="legal-links">
          <Link to="/privacy" className="legal-link">
            Privacy Policy
          </Link>
          <Link to="/" className="legal-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
