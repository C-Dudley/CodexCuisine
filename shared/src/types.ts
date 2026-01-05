// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  _count?: {
    recipes: number;
    collections: number;
    favorites: number;
  };
}

// Recipe types
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  image?: string;
  videoUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: UserProfile;
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
  _count?: {
    favorites: number;
    ratings: number;
    reviews: number;
  };
}

export interface RecipeIngredient {
  id: string;
  amount?: number;
  unit?: string;
  notes?: string;
  ingredient: Ingredient;
}

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  image?: string;
  createdAt: Date;
}

export interface RecipeTag {
  id: string;
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: UserProfile;
  recipes: RecipeCollection[];
  _count?: {
    recipes: number;
  };
}

export interface RecipeCollection {
  id: string;
  recipe: Recipe;
}

// Rating and Review types
export interface RecipeRating {
  id: string;
  rating: number; // 1-5
  ratedAt: Date;
}

export interface RecipeReview {
  id: string;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  user: UserProfile;
}

// Favorite types
export interface RecipeFavorite {
  id: string;
  addedAt: Date;
}

// Meal planning types
export interface MealPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  user: UserProfile;
  meals: Meal[];
}

export interface Meal {
  id: string;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
  recipe?: Recipe;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateRecipeForm {
  title: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  image?: string;
  videoUrl?: string;
  isPublic: boolean;
  ingredients: CreateRecipeIngredient[];
  tags: string[];
}

export interface CreateRecipeIngredient {
  ingredientId: string;
  amount?: number;
  unit?: string;
  notes?: string;
}

export interface CreateCollectionForm {
  name: string;
  description?: string;
  isPublic: boolean;
}

// Search and Filter types
export interface RecipeSearchFilters {
  query?: string;
  cuisine?: string;
  difficulty?: "easy" | "medium" | "hard";
  maxPrepTime?: number;
  tags?: string[];
  page?: number;
  limit?: number;
}

// Nutrition types
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
