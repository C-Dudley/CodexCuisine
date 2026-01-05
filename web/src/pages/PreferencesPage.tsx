import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Plus, X, Save, AlertCircle } from "lucide-react";

interface DietaryPreference {
  id: string;
  type: string;
}

interface Allergy {
  id: string;
  ingredient: string;
}

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New preference/allergy inputs
  const [newPreference, setNewPreference] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  // Mock user ID (in real app, get from auth context)
  const userId = "mock-user-id-123";

  // Common dietary preference options
  const dietaryOptions = ["vegan", "vegetarian", "keto", "paleo", "gluten-free", "dairy-free", "nut-free"];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/preferences/${userId}`);
      setPreferences(response.data.preferences || []);
      setAllergies(response.data.allergies || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      // Mock data fallback for demo
      setPreferences([
        { id: "1", type: "vegetarian" },
        { id: "2", type: "gluten-free" },
      ]);
      setAllergies([
        { id: "1", ingredient: "peanuts" },
        { id: "2", ingredient: "shellfish" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addPreference = async () => {
    if (!newPreference.trim()) {
      setError("Please enter a dietary preference");
      return;
    }

    // Check if already added
    if (preferences.some((p) => p.type.toLowerCase() === newPreference.toLowerCase())) {
      setError("This preference is already added");
      return;
    }

    try {
      const response = await axios.post(`/api/preferences/${userId}/preferences`, {
        type: newPreference.toLowerCase(),
      });

      setPreferences([...preferences, response.data]);
      setNewPreference("");
      setSuccessMessage("Dietary preference added!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add preference");
    }
  };

  const removePreference = async (id: string) => {
    try {
      await axios.delete(`/api/preferences/${userId}/preferences/${id}`);
      setPreferences(preferences.filter((p) => p.id !== id));
      setSuccessMessage("Dietary preference removed!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove preference");
    }
  };

  const addAllergy = async () => {
    if (!newAllergy.trim()) {
      setError("Please enter an allergen");
      return;
    }

    // Check if already added
    if (allergies.some((a) => a.ingredient.toLowerCase() === newAllergy.toLowerCase())) {
      setError("This allergen is already tracked");
      return;
    }

    try {
      const response = await axios.post(`/api/preferences/${userId}/allergies`, {
        ingredient: newAllergy.toLowerCase(),
      });

      setAllergies([...allergies, response.data]);
      setNewAllergy("");
      setSuccessMessage("Allergen added!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add allergen");
    }
  };

  const removeAllergy = async (id: string) => {
    try {
      await axios.delete(`/api/preferences/${userId}/allergies/${id}`);
      setAllergies(allergies.filter((a) => a.id !== id));
      setSuccessMessage("Allergen removed!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove allergen");
    }
  };

  const toggleQuickPreference = async (pref: string) => {
    const existing = preferences.find((p) => p.type.toLowerCase() === pref.toLowerCase());

    if (existing) {
      await removePreference(existing.id);
    } else {
      setNewPreference(pref);
      // We'll add it using the state instead of calling addPreference
      // to avoid the async delay
      try {
        const response = await axios.post(`/api/preferences/${userId}/preferences`, {
          type: pref.toLowerCase(),
        });
        setPreferences([...preferences, response.data]);
        setSuccessMessage(`Added ${pref}!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to add preference");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Settings className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-700">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Food Preferences</h1>
          </div>
          <p className="text-gray-600">
            Set your dietary preferences and allergies to filter recipes that match your needs
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800 flex gap-2">
            <Save className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Dietary Preferences Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🥗</span> Dietary Preferences
            </h2>

            {/* Quick Toggle Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => {
                  const isSelected = preferences.some(
                    (p) => p.type.toLowerCase() === option.toLowerCase()
                  );
                  return (
                    <button
                      key={option}
                      onClick={() => toggleQuickPreference(option)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Add custom preference (e.g., low-carb)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && addPreference()}
              />
              <button
                onClick={addPreference}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Selected Preferences */}
            <div className="space-y-2">
              {preferences.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No dietary preferences set yet
                </p>
              ) : (
                preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="font-medium text-blue-900 capitalize">{pref.type}</span>
                    <button
                      onClick={() => removePreference(pref.id)}
                      className="p-1 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Allergies Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Allergies & Restrictions
            </h2>

            {/* Common Allergens Quick Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Common allergens:</p>
              <div className="flex flex-wrap gap-2">
                {["peanuts", "tree nuts", "shellfish", "dairy", "eggs", "soy", "wheat"].map(
                  (allergen) => {
                    const isSelected = allergies.some(
                      (a) => a.ingredient.toLowerCase() === allergen.toLowerCase()
                    );
                    return (
                      <button
                        key={allergen}
                        onClick={() => {
                          if (isSelected) {
                            const allergyToRemove = allergies.find(
                              (a) => a.ingredient.toLowerCase() === allergen.toLowerCase()
                            );
                            if (allergyToRemove) removeAllergy(allergyToRemove.id);
                          } else {
                            setNewAllergy(allergen);
                            // Add directly
                            axios
                              .post(`/api/preferences/${userId}/allergies`, {
                                ingredient: allergen.toLowerCase(),
                              })
                              .then((response) => {
                                setAllergies([...allergies, response.data]);
                                setSuccessMessage(`Added ${allergen} to allergies!`);
                                setTimeout(() => setSuccessMessage(null), 3000);
                              })
                              .catch((err) => {
                                setError(
                                  err.response?.data?.error || "Failed to add allergen"
                                );
                              });
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {allergen}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Custom Input */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add custom allergen (e.g., sesame)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && addAllergy()}
              />
              <button
                onClick={addAllergy}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Tracked Allergies */}
            <div className="space-y-2">
              {allergies.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No allergies tracked yet
                </p>
              ) : (
                allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <span className="font-medium text-red-900 capitalize">{allergy.ingredient}</span>
                    <button
                      onClick={() => removeAllergy(allergy.id)}
                      className="p-1 text-red-600 hover:bg-red-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Your Settings Summary</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Dietary Preferences</p>
              <p className="text-3xl font-bold">{preferences.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Tracked Allergies</p>
              <p className="text-3xl font-bold">{allergies.length}</p>
            </div>
          </div>
          <p className="mt-4 text-blue-100 text-sm">
            Your preferences will be used to filter recipes and meal plans automatically.
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> These settings will be applied to filter recipes across all
            sources (your collection, external recipes, and video recipes) to ensure every recipe
            suggestion matches your dietary needs and avoids your allergens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
