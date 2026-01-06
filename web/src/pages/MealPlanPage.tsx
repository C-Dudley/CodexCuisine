import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MealPlanChart from "../components/MealPlanChart";
import { Meal } from "@codex-cuisine/shared";

const MealPlanPage: React.FC = () => {
  const {
    data: mealPlans,
    isLoading,
    error,
  } = useQuery<Meal[]>({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const response = await axios.get("/api/meal-plans");
      return response.data;
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="ml-4 text-gray-600">Loading meal plans...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            Error loading meal plans
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {mealPlans && mealPlans.length > 0 ? (
          <MealPlanChart initialData={mealPlans} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No meal plans yet.</p>
            <Link
              to="/"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Browse Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanPage;
