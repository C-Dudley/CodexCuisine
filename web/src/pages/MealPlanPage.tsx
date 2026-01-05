import React from "react";
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading meal plans</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meal Plan</h1>
      {mealPlans && <MealPlanChart initialData={mealPlans} />}
    </div>
  );
};

export default MealPlanPage;
