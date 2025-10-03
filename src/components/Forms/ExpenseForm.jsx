import React, { useState, useEffect } from "react";
import Button from "../UI/Button";
import { CATEGORIES } from "../../utils/constants";

const ExpenseForm = ({ expense, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "other",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        date: new Date(expense.date).toISOString().split("T")[0],
        notes: expense.notes || "",
      });
    }
  }, [expense]);

  const validateForm = () => {
    const errors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    }

    if (formData.notes && formData.notes.length > 500) {
      errors.notes = "Notes cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1 ${
            formErrors.amount ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="0.00" // You can change this to "0.00" or keep as is
          required
        />
        {formErrors.amount && (
          <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1 ${
            formErrors.category ? "border-red-300" : "border-gray-300"
          }`}
          required
        >
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {formErrors.category && (
          <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1 ${
            formErrors.date ? "border-red-300" : "border-gray-300"
          }`}
          required
        />
        {formErrors.date && (
          <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1 ${
            formErrors.notes ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Add any additional notes..."
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-500">
            {formData.notes.length}/500 characters
          </p>
          {formErrors.notes && (
            <p className="text-sm text-red-600">{formErrors.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {expense ? "Update Expense" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
