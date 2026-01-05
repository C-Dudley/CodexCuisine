# Meal Planning

## Overview

The Meal Planning feature allows users to plan meals for the week using a drag-and-drop interface. Users can view their meal plans in a weekly calendar format and modify meal assignments by dragging recipes between days and meal types.

## Endpoints

- `GET /api/meal-plan` - Get user's meal plans
- `POST /api/meal-plan` - Create new meal plan entry
- `PUT /api/meal-plan/update` - Update meal plan entry (date/meal type)
- `DELETE /api/meal-plan/:id` - Delete meal plan entry
- `POST /api/meal-plan/shopping-list` - Generate shopping list from selected meal plans

## Logic Flow

1. **Data Fetching**: MealPlanPage uses React Query to fetch meal plans from `/api/meal-plan`
2. **Weekly Display**: MealPlanChart component groups meal plans by date and meal type (Breakfast/Lunch/Dinner)
3. **Drag & Drop**: @hello-pangea/dnd handles drag operations between calendar slots
4. **Update API**: On drop completion, PUT request updates meal plan with new date/mealType
5. **Cache Invalidation**: React Query invalidates meal-plans query to refresh UI

## Data Model

- **MealPlan**: Links user, recipe, date, and meal type
- **Recipe**: Referenced for meal plan display
- **User**: Ownership and authorization (requires authentication)

## State Management

- **React Query**: Caches meal plan data, handles loading/error states, invalidates on mutations
- **Local State**: MealPlanChart manages drag-drop state internally
- **Optimistic Updates**: Mutations trigger immediate UI updates via cache invalidation
