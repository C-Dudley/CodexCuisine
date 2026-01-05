import React, { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Recipe {
  id: string;
  title: string;
  instructions: string;
  cookTime: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MealPlan {
  id: string;
  date: Date;
  mealType: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
  updatedAt: Date;
  recipe: Recipe;
}

interface MealPlanChartProps {
  initialData: MealPlan[];
}

const MealPlanChart: React.FC<MealPlanChartProps> = ({ initialData }) => {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
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
    const grouped: { [key: string]: { [mealType: string]: MealPlan[] } } = {};
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

  const getTotalTime = (plans: MealPlan[]) => {
    return plans.reduce(
      (total, plan) => total + (plan.recipe.cookTime || 0),
      0
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Weekly Meal Plan</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayKey = day.toDateString();
            const isToday = dayKey === today;
            return (
              <div
                key={dayKey}
                className={`border rounded-lg p-2 ${
                  isToday ? "bg-blue-100" : "bg-white"
                }`}
              >
                <h3 className="font-semibold text-center mb-2">
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
                        className="min-h-[100px] border border-gray-300 rounded p-2 mb-2 bg-gray-50"
                      >
                        <h4 className="text-sm font-medium mb-1">{mealType}</h4>
                        {groupedData[dayKey][mealType].map((plan, index) => (
                          <Draggable
                            key={plan.id}
                            draggableId={plan.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white border rounded p-2 mb-1 shadow-sm"
                              >
                                <div className="text-sm font-medium">
                                  {plan.recipe.title}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {plan.recipe.cookTime
                                    ? `${plan.recipe.cookTime} min`
                                    : "N/A"}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
                <div className="text-xs text-gray-500 mt-2">
                  Total Time:{" "}
                  {getTotalTime(Object.values(groupedData[dayKey]).flat())} min
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default MealPlanChart;
