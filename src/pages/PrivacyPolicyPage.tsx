import { Link } from 'react-router-dom'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">🔒 Privacy Policy</h1>
          <p className="text-slate-400">Last updated: June 25, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-amber max-w-none">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  DevOpsQuest is designed with privacy in mind. We collect minimal information to provide you with the best learning experience.
                </p>
                <h3 className="text-lg font-semibold text-amber-400">Local Storage Data</h3>
                <p>
                  We store the following information locally in your browser using localStorage:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Character Progress:</strong> Your level, XP, gold, and streak data</li>
                  <li><strong>Completed Quests:</strong> Records of quests you've completed</li>
                  <li><strong>Achievements:</strong> Badges and milestones you've unlocked</li>
                  <li><strong>Settings:</strong> Your theme preferences and display settings</li>
                  <li><strong>Game State:</strong> Your inventory, companions, and shop purchases</li>
                </ul>
                <p>
                  This data stays on your device and is never transmitted to our servers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
              <div className="text-slate-300 space-y-4">
                <p>We use the collected information solely to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Save and restore your game progress</li>
                  <li>Track your learning journey and achievements</li>
                  <li>Personalize your experience based on your progress</li>
                  <li>Calculate XP, levels, and rewards</li>
                  <li>Enable streak tracking and daily bonuses</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  <strong>Local Storage Only:</strong> All game data is stored exclusively in your browser's localStorage. This means:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can only access your progress on this specific browser and device</li>
                  <li>Clearing your browser data will reset your game progress</li>
                  <li>We cannot access, view, or modify your game data</li>
                  <li>There is no account system or user authentication</li>
                </ul>
                <p>
                  <strong>No Server Storage:</strong> We do not maintain any server-side databases. The application is entirely client-side, which means your data never leaves your device.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
              <div className="text-slate-300 space-y-4">
                <p>Our application uses the following third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Cloudflare Pages:</strong> Our hosting provider. They may collect basic hosting analytics as per their privacy policy.
                  </li>
                  <li>
                    <strong>W3Schools:</strong> We scrape content from W3Schools to generate quiz questions. Their content is publicly available educational material.
                  </li>
                </ul>
                <p>
                  We do not sell, trade, or otherwise transfer your information to any other third parties.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  DevOpsQuest does not use cookies. We use localStorage for data persistence, which does not involve cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Children's Privacy</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  Our application is not specifically designed for children under 13. However, we do not knowingly collect any information from children. Since we don't collect any personal data, this is not a significant concern for our application.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  Since all data is stored locally on your device, you are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Keeping your browser and device secure</li>
                  <li>Not sharing your device with unauthorized users</li>
                  <li>Clearing browser data if needed (note: this will reset progress)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
              <div className="text-slate-300 space-y-4">
                <p>Because we don't collect your data on our servers, you have full control:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Your data is viewable in the game itself</li>
                  <li><strong>Deletion:</strong> Clear your browser data to delete all stored information</li>
                  <li><strong>Portability:</strong> Currently not supported (data stays local)</li>
                </ul>
                <p>
                  To delete your data, simply clear your browser's localStorage for this site, or use your browser's "Clear Data" option.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  We may update this privacy policy from time to time. Any changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Open an issue on our <a href="https://github.com/aliasfoxkde/DevOpsRPG" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">GitHub repository</a></li>
                  <li>Visit our <Link to="/about" className="text-amber-400 hover:underline">About page</Link> for more information</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
