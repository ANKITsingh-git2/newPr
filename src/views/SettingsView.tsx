import { useEffect, useState } from 'react';
import { UserPreferences, Difficulty, NotificationFrequency } from '../types';
import { Settings, Save } from 'lucide-react';
import { fetchPreferences, savePreferences } from '../lib/wpApi';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'SaaS', 'Consumer', 'Enterprise', 'AI/ML', 'Fintech'
];

const CONTENT_TYPES = [
  'Article', 'Video', 'Course', 'Tool', 'Template', 'Podcast'
];

export function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<UserPreferences>({
    preferred_industries: [],
    preferred_content_types: [],
    preferred_difficulty: 'intermediate' as Difficulty,
    excluded_tags: [],
    notification_frequency: 'weekly' as NotificationFrequency,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs: UserPreferences = await fetchPreferences();
        if (!cancelled) setFormData(prefs);
      } catch (e) {
        // ignore for anon users
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleIndustry = (industry: string) => {
    const updated = formData.preferred_industries.includes(industry)
      ? formData.preferred_industries.filter(i => i !== industry)
      : [...formData.preferred_industries, industry];
    setFormData({ ...formData, preferred_industries: updated });
  };

  const toggleContentType = (type: string) => {
    const updated = formData.preferred_content_types.includes(type)
      ? formData.preferred_content_types.filter(t => t !== type)
      : [...formData.preferred_content_types, type];
    setFormData({ ...formData, preferred_content_types: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await savePreferences(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Preferences saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Industries
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INDUSTRIES.map(industry => (
                <label
                  key={industry}
                  className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.preferred_industries.includes(industry)}
                    onChange={() => toggleIndustry(industry)}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Content Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map(type => (
                <label
                  key={type}
                  className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.preferred_content_types.includes(type)}
                    onChange={() => toggleContentType(type)}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Difficulty Level
            </label>
            <select
              value={formData.preferred_difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferred_difficulty: e.target.value as Difficulty,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Frequency
            </label>
            <select
              value={formData.notification_frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notification_frequency: e.target.value as NotificationFrequency,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
