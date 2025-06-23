import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createContest } from "../services/contestServices";
import TAGS from "../utils/tags";

export default function CreateContest() {
  const [form, setForm] = useState({
    userHandle: "",
    numQuestions: 4,
    minRating: 1000,
    maxRating: 1800,
    recency: 2019,
    duration: 120,
    tags: [],
    shuffle: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox" && name === "shuffle") {
      setForm((f) => ({ ...f, shuffle: checked }));
    } else if (type === "checkbox") {
      setForm((f) => {
        const tags = checked
          ? [...f.tags, value]
          : f.tags.filter((t) => t !== value);
        return { ...f, tags };
      });
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const data = await createContest(form);
      navigate(`/contest/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Organized tags with better categorization
  const tagCategories = {
    "Difficulty Level": ["easy", "medium", "hard"],
    "Algorithm": [
      "binary search", "bitmasks", "brute force", "combinatorics", 
      "data structures", "divide and conquer", "dp", "graphs", "greedy"
    ],
    "Data Structures": [
      "dsu", "hashing", "sortings", "strings", "trees", 
      "two pointers", "matrices"
    ],
    "Mathematics": [
      "fft", "geometry", "math", "number theory", "probabilities"
    ],
    "Other": [
      "constructive algorithms", "games", "interactive", "shortest paths",
      "ternary search", "2-sat", "flows", "meet-in-the-middle", "strings"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Create Your Custom Contest
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Design the perfect coding challenge tailored to your skills and preferences
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
                <svg className="h-5 w-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* User Handle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codeforces Handle <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    name="userHandle"
                    required
                    value={form.userHandle}
                    onChange={handleChange}
                    placeholder="tourist"
                    className="block w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Contest Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Number of Questions */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="numQuestions"
                      min="1"
                      max="20"
                      value={form.numQuestions}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                      problems
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="duration"
                      min="10"
                      max="300"
                      value={form.duration}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                      minutes
                    </div>
                  </div>
                </div>

                {/* Rating Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Rating Range
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="minRating"
                        min="800"
                        max="3500"
                        value={form.minRating}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                        min
                      </div>
                    </div>
                    <div className="flex-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="maxRating"
                        min="800"
                        max="3500"
                        value={form.maxRating}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                        max
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recency */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problems From Year
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="recency"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={form.recency}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
                      or later
                    </div>
                  </div>
                </div>
              </div>

              {/* Shuffle Option */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="shuffle"
                  id="shuffle"
                  checked={form.shuffle}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="shuffle" className="ml-3 text-sm font-medium text-gray-700">
                  Shuffle question order for more authentic contest experience
                </label>
              </div>

              {/* Tags Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Tags (Select at least one)
                </label>
                <div className="space-y-6">
                  {Object.entries(tagCategories).map(([category, tags]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <label
                            key={tag}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              form.tags.includes(tag)
                                ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="tags"
                              value={tag}
                              checked={form.tags.includes(tag)}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            {tag}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                    isSubmitting ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Your Contest...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Generate Custom Contest
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}