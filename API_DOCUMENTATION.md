# CodexCuisine API Documentation

Complete API reference for the CodexCuisine backend.

**Base URL**: `http://localhost:3001` (development)

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

Success response (2xx):
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error response (4xx, 5xx):
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "validationErrors": [
      {
        "path": "field_name",
        "message": "Validation error message",
        "code": "invalid_type"
      }
    ]
  }
}
```

## API Endpoints

### Health Check

**GET** `/health`

Check if API is running.

**Response**: `{ "status": "ok" }`

---

### Recipes

#### List Recipes

**GET** `/api/recipes?query=&page=1&limit=12`

Get paginated list of recipes with optional search.

**Query Parameters**:
- `query` (string, optional): Search by title or instructions
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 12)

**Response**:
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Recipe Name",
      "instructions": "Step by step...",
      "cookTime": 30,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "ingredientLists": [
        {
          "id": "uuid",
          "quantity": 2,
          "ingredient": {
            "id": "uuid",
            "name": "Flour",
            "unit": "cups",
            "category": "Pantry"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

#### Get Recipe Details

**GET** `/api/recipes/:id`

Get full details of a specific recipe.

**Response**: Single recipe object (same structure as list)

#### Create Recipe

**POST** `/api/recipes`

Create a new recipe. **Requires authentication**.

**Request Body**:
```json
{
  "title": "New Recipe",
  "instructions": "Instructions text",
  "cookTime": 30,
  "ingredientLists": [
    {
      "ingredientId": "uuid",
      "quantity": 2,
      "unit": "cups"
    }
  ]
}
```

**Validation**:
- `title`: Required, string, 3-255 characters
- `instructions`: Optional, string
- `cookTime`: Optional, positive number (minutes)
- `ingredientLists`: Array of ingredients

**Status Codes**:
- `201`: Recipe created successfully
- `400`: Validation error
- `401`: Not authenticated
- `409`: Conflict (duplicate ingredient)

#### Update Recipe

**PUT** `/api/recipes/:id`

Update an existing recipe. **Requires authentication**.

**Request Body**: Same as Create Recipe

**Status Codes**:
- `200`: Recipe updated
- `400`: Validation error
- `401`: Not authenticated
- `404`: Recipe not found

#### Delete Recipe

**DELETE** `/api/recipes/:id`

Delete a recipe. **Requires authentication**.

**Status Codes**:
- `204`: Recipe deleted
- `401`: Not authenticated
- `404`: Recipe not found

---

### Meal Plans

#### Get User's Meal Plans

**GET** `/api/meal-plan`

Get all meal plans for the authenticated user.

**Response**:
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "recipeId": "uuid",
    "externalRecipeId": null,
    "date": "2024-01-20T00:00:00Z",
    "mealType": "Breakfast",
    "recipe": {
      "id": "uuid",
      "title": "Pancakes",
      "cookTime": 20,
      "ingredientLists": [...]
    }
  }
]
```

#### Create Meal Plan Entry

**POST** `/api/meal-plan`

Add a recipe to user's meal plan. **Requires authentication**.

**Request Body**:
```json
{
  "recipeId": "uuid",
  "date": "2024-01-20T00:00:00Z",
  "mealType": "Breakfast"
}
```

**Validation**:
- `recipeId` OR `externalRecipeId`: At least one required
- `date`: Required, valid ISO date
- `mealType`: Required, must be "Breakfast", "Lunch", or "Dinner"

**Status Codes**:
- `201`: Meal plan created
- `400`: Validation error or missing recipe
- `401`: Not authenticated
- `404`: Recipe not found

#### Update Meal Plan Entry

**PUT** `/api/meal-plan/update`

Update a meal plan entry's date or meal type. **Requires authentication**.

**Request Body**:
```json
{
  "id": "uuid",
  "date": "2024-01-21T00:00:00Z",
  "mealType": "Lunch"
}
```

**Status Codes**:
- `200`: Meal plan updated
- `400`: Validation error
- `401`: Not authenticated
- `404`: Meal plan not found

#### Delete Meal Plan Entry

**DELETE** `/api/meal-plan/:id`

Remove a meal from the user's plan. **Requires authentication**.

**Status Codes**:
- `204`: Meal plan deleted
- `401`: Not authenticated
- `404`: Meal plan not found

#### Generate Shopping List

**POST** `/api/meal-plan/shopping-list`

Generate aggregated shopping list from meal plan IDs. **Requires authentication**.

**Request Body**:
```json
{
  "mealPlanIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response**:
```json
{
  "items": [
    {
      "name": "Flour",
      "category": "Pantry",
      "unit": "cups",
      "totalQuantity": 5
    }
  ]
}
```

**Status Codes**:
- `200`: Shopping list generated
- `400`: No meal plans provided
- `401`: Not authenticated
- `403`: Access denied to some meal plans

---

### Ingredients

**Note**: Ingredients are currently managed through recipe creation. Direct ingredient endpoints are not yet exposed.

---

## Error Handling

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | Recipe retrieved |
| `201` | Created | Recipe created |
| `204` | No Content | Deletion successful |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Missing/invalid JWT |
| `403` | Forbidden | Access denied |
| `404` | Not Found | Recipe doesn't exist |
| `500` | Server Error | Unexpected error |

### Validation Error Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "validationErrors": [
      {
        "path": "title",
        "message": "String must contain at least 3 character(s)",
        "code": "too_small"
      },
      {
        "path": "mealType",
        "message": "Invalid enum value",
        "code": "invalid_enum_value"
      }
    ]
  }
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. This is planned for future releases.

---

## Pagination

List endpoints support pagination:

- `page`: Page number (1-indexed)
- `limit`: Items per page (default: 12, max: 100)

Example: `/api/recipes?page=2&limit=20`

---

## Filtering & Search

### Recipe Search

Use the `query` parameter to search recipes:

```
GET /api/recipes?query=pasta&page=1&limit=12
```

Searches in:
- Recipe title
- Instructions

---

## Data Types

### Recipe
```typescript
{
  id: string (UUID)
  title: string
  instructions: string
  cookTime?: number (minutes)
  createdAt: ISO 8601 timestamp
  updatedAt: ISO 8601 timestamp
  ingredientLists: IngredientList[]
}
```

### IngredientList
```typescript
{
  id: string (UUID)
  quantity?: number
  ingredient: Ingredient
  recipeId: string
}
```

### Ingredient
```typescript
{
  id: string (UUID)
  name: string
  unit?: string (e.g., "cups", "grams", "pieces")
  category?: string (e.g., "Pantry", "Produce", "Dairy", "Meat")
}
```

### MealPlan
```typescript
{
  id: string (UUID)
  userId: string
  recipeId?: string
  externalRecipeId?: string
  date: ISO 8601 timestamp
  mealType: "Breakfast" | "Lunch" | "Dinner"
  recipe?: Recipe
  externalRecipe?: ExternalRecipe
}
```

---

## Example Requests

### Create a Recipe with cURL

```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Simple Pasta",
    "instructions": "Boil water and cook pasta",
    "cookTime": 20,
    "ingredientLists": [
      {
        "ingredientId": "abc123",
        "quantity": 1,
        "unit": "box"
      }
    ]
  }'
```

### Get User's Meal Plans

```bash
curl http://localhost:3001/api/meal-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Future API Features

- [ ] User authentication endpoints (login, register, profile)
- [ ] Recipe favorites/collections
- [ ] Dietary preferences and allergies
- [ ] Recipe ratings and reviews
- [ ] Image uploads for recipes
- [ ] Pagination cursors for large datasets
- [ ] Advanced filtering and sorting

