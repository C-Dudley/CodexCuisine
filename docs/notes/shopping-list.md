# Shopping List Generation

## Overview

The Shopping List feature automatically generates consolidated shopping lists from selected meal plans. It aggregates ingredient quantities across multiple recipes, groups items by category, and handles unit consolidation for efficient grocery shopping.

## Endpoints

- `POST /api/meal-plan/shopping-list` - Generate shopping list from meal plan IDs

## Logic Flow

1. **Input Validation**: Accepts array of meal plan IDs, validates UUID format
2. **Data Fetching**: Queries MealPlan with recipe and ingredient list includes
3. **Quantity Aggregation**: Groups ingredients by ID and unit, sums quantities
4. **Category Grouping**: Organizes items by ingredient category (Dairy, Meat, Pantry, etc.)
5. **Response**: Returns categorized shopping list with consolidated quantities

## Data Model

- **MealPlan**: Source of recipe selections
- **Recipe**: Contains ingredient lists
- **IngredientList**: Links recipes to ingredients with specific quantities
- **Ingredient**: Provides name, unit, and category for grouping

## State Management

- **Service Layer**: Pure function with no external state dependencies
- **Database Queries**: Direct Prisma calls within service function
- **No Caching**: Generates fresh shopping list on each request
