import React, { useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Meal } from "../../../shared/src";

interface MealPlanChartProps {
  initialData: Meal[];
}

const MealPlanChart: React.FC<MealPlanChartProps> = ({ initialData }) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMealPlanMutation = useMutation({
    mutationFn: async ({
      id,
      date,
      mealType,
    }: {
      id: string;
      date: Date;
      mealType: string;
    }) => {
      const response = await axios.put("/api/meal-plan/update", {
        id,
        date,
        mealType,
      });
      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to update meal plan. Please try again.";
      setErrorMessage(message);
      console.error("Meal plan update failed:", error);
    },
  });

  const getWeekDays = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const weekDays = getWeekDays();
  const today = new Date().toDateString();

  const groupedData = useMemo(() => {
    const grouped: { [key: string]: { [mealType: string]: Meal[] } } = {};
    weekDays.forEach((day) => {
      const dayKey = day.toDateString();
      grouped[dayKey] = { Breakfast: [], Lunch: [], Dinner: [] };
    });

    initialData.forEach((plan) => {
      const dayKey = new Date(plan.date).toDateString();
      if (
        grouped[dayKey] &&
        ["Breakfast", "Lunch", "Dinner"].includes(plan.mealType)
      ) {
        grouped[dayKey][plan.mealType].push(plan);
      }
    });

    return grouped;
  }, [initialData, weekDays]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceDay = source.droppableId.split("-")[0];
    const sourceMeal = source.droppableId.split("-")[1];
    const destDay = destination.droppableId.split("-")[0];
    const destMeal = destination.droppableId.split("-")[1];

    if (sourceDay === destDay && sourceMeal === destMeal) return;

    // Find the meal plan item
    const plan = groupedData[sourceDay][sourceMeal].find(
      (p) => p.id === draggableId
    );
    if (!plan) return;

    // Update the date and mealType
    const newDate = new Date(destDay);
    updateMealPlanMutation.mutate({
      id: plan.id,
      date: newDate,
      mealType: destMeal,
    });
  };

  const getTotalTime = (plans: Meal[]) => {
    return plans.reduce(
      (total, plan) => total + (plan.recipe?.cookTime || 0),
      0
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Weekly Meal Plan</h2>
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 text-xs mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 min-w-full lg:min-w-0">
            {weekDays.map((day) => {
              const dayKey = day.toDateString();
              const isToday = dayKey === today;
              return (
                <div
                  key={dayKey}
                  className={`border rounded-lg p-3 ${
                    isToday
                      ? "bg-purple-100 border-purple-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className="font-semibold text-center mb-3 text-sm md:text-base">
                    {day.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                    <Droppable
                      key={`${dayKey}-${mealType}`}
                      droppableId={`${dayKey}-${mealType}`}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="min-h-[80px] md:min-h-[100px] border border-gray-300 rounded p-2 mb-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="text-xs md:text-sm font-medium mb-1 text-gray-700">
                            {mealType}
                          </h4>
                          {groupedData[dayKey][mealType].map((plan, index) => (
                            <Draggable
                              key={plan.id}
                              draggableId={plan.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white border rounded p-2 mb-1 shadow-sm text-xs transition-all ${
                                    snapshot.isDragging
                                      ? "shadow-lg ring-2 ring-purple-500"
                                      : ""
                                  }`}
                                >
                                  {plan.recipe && (
                                    <>
                                      <div className="font-medium line-clamp-2">
                                        {plan.recipe.title}
                                      </div>
                                      <div className="text-gray-600">
                                        {plan.recipe.cookTime
                                          ? `${plan.recipe.cookTime}m`
                                          : "N/A"}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                  <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded font-medium">
                    Total:{" "}
                    {getTotalTime(Object.values(groupedData[dayKey]).flat())}m
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default MealPlanChart;
