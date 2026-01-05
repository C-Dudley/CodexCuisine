import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface ShoppingListItem {
  name: string;
  totalQty: number;
  unit: string;
  checked?: boolean;
}

interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

const ShoppingListPage: React.FC = () => {
  const [categories, setCategories] = useState<ShoppingListCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Mock meal plan IDs for now (in a real app, these would come from user selection)
  const mealPlanIds = ["1", "2", "3"];

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "/api/meal-plan/shopping-list",
        mealPlanIds
      );

      // Initialize checked state to false for all items
      const itemsWithChecked: ShoppingListCategory[] = response.data.map(
        (category: ShoppingListCategory) => ({
          ...category,
          items: category.items.map((item) => ({
            ...item,
            checked: false,
          })),
        })
      );

      setCategories(itemsWithChecked);

      // Expand all categories by default
      const allCategoryNames = new Set(
        itemsWithChecked.map((cat) => cat.category)
      );
      setExpandedCategories(allCategoryNames);
    } catch (err) {
      console.error("Error fetching shopping list:", err);
      setError(
        "Failed to generate shopping list. Please try selecting meal plans."
      );

      // Mock data fallback for demo
      setCategories([
        {
          category: "Produce",
          items: [
            { name: "Tomatoes", totalQty: 3, unit: "count", checked: false },
            { name: "Basil", totalQty: 1, unit: "bunch", checked: false },
            { name: "Garlic", totalQty: 2, unit: "cloves", checked: false },
          ],
        },
        {
          category: "Dairy",
          items: [
            { name: "Eggs", totalQty: 12, unit: "count", checked: false },
            { name: "Parmesan", totalQty: 0.5, unit: "cup", checked: false },
          ],
        },
        {
          category: "Pantry",
          items: [
            { name: "Pasta", totalQty: 1, unit: "lb", checked: false },
            { name: "Olive Oil", totalQty: 2, unit: "tbsp", checked: false },
            { name: "Salt", totalQty: 1, unit: "tsp", checked: false },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItemCheck = (itemKey: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey);
    } else {
      newChecked.add(itemKey);
    }
    setCheckedItems(newChecked);
  };

  const clearChecked = () => {
    setCheckedItems(new Set());
  };

  const deleteItem = (categoryName: string, itemIndex: number) => {
    const updatedCategories = categories.map((cat) => {
      if (cat.category === categoryName) {
        return {
          ...cat,
          items: cat.items.filter((_, idx) => idx !== itemIndex),
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const getTotalItems = () => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  };

  const getCheckedCount = () => {
    return checkedItems.size;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-bounce" />
          <p className="text-xl text-gray-700">Loading your shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Shopping List</h1>
          </div>
          <p className="text-gray-600">
            {getCheckedCount()} of {getTotalItems()} items completed
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {getTotalItems() > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(getCheckedCount() / getTotalItems()) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {getCheckedCount() > 0 && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={clearChecked}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Uncheck All Completed
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">
                No shopping list items yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Select meal plans to generate a shopping list
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.category}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {category.category}
                    </span>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {category.items.length} items
                    </span>
                  </div>
                  {expandedCategories.has(category.category) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {/* Items List */}
                {expandedCategories.has(category.category) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {category.items.map((item, idx) => {
                      const itemKey = `${category.category}-${idx}`;
                      const isChecked = checkedItems.has(itemKey);

                      return (
                        <div
                          key={itemKey}
                          className={`px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                            isChecked ? "bg-green-50" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItemCheck(itemKey)}
                            className="w-5 h-5 text-green-500 rounded cursor-pointer accent-green-500"
                          />

                          {/* Item Details */}
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                isChecked
                                  ? "line-through text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.name}
                            </p>
                          </div>

                          {/* Quantity & Unit */}
                          <div
                            className={`text-right font-semibold ${
                              isChecked ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            <p>
                              {item.totalQty % 1 !== 0
                                ? item.totalQty.toFixed(1)
                                : item.totalQty}{" "}
                              {item.unit}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteItem(category.category, idx)}
                            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Summary Card */}
        {getTotalItems() > 0 && (
          <div className="mt-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-3">Shopping Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-orange-100 text-sm">Total Items</p>
                <p className="text-3xl font-bold">{getTotalItems()}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Items Checked</p>
                <p className="text-3xl font-bold">{getCheckedCount()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
