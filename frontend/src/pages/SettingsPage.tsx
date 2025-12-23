import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-gray-600 to-gray-800 text-white min-h-screen rounded-lg">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h1 className="text-4xl font-bold mb-4 text-white">⚙️ Settings</h1>
        <p className="text-xl opacity-90 mb-6">Manage your account preferences and privacy settings</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🎨 Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full p-3 rounded bg-white/20 border border-white/30 text-white">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full p-3 rounded bg-white/20 border border-white/30 text-white">
                  <option>English</option>
                  <option>中文</option>
                  <option>Español</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🔔 Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Transaction Alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span>Weekly Reports</span>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span>Security Alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🔒 Privacy & Security</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span>Blockchain Storage</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✓</span>
                <span>Private Keys Local</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">💾 Data Management</h2>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white/20 hover:bg-white/30 rounded transition-colors text-left">
                📥 Export Data
              </button>
              <button className="w-full p-3 bg-white/20 hover:bg-white/30 rounded transition-colors text-left">
                🔑 Backup Keys
              </button>
              <button className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors text-left text-red-300">
                🗑️ Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;