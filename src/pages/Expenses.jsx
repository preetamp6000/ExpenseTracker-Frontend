import React, { useState, useEffect } from 'react'
import { expenseAPI } from '../utils/api'
import { useApp } from '../context/AppContext'
import ExpenseForm from '../components/Forms/ExpenseForm'
import Modal from '../components/UI/Modal'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { CATEGORIES } from '../utils/constants'
import { Plus, Search, Filter, Edit, Trash2, IndianRupee } from 'lucide-react'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: ''
  })
  const { addToast } = useApp()

  useEffect(() => {
    fetchExpenses()
  }, []) // Remove filters dependency to prevent infinite loops

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      
      // Build query parameters properly
      const queryParams = {}
      
      if (filters.category) {
        queryParams.category = filters.category
      }
      
      if (filters.search) {
        queryParams.search = filters.search
      }
      
      if (filters.startDate) {
        queryParams.startDate = filters.startDate
      }
      
      if (filters.endDate) {
        queryParams.endDate = filters.endDate
      }

      console.log('Fetching expenses with params:', queryParams) // Debug log
      
      const data = await expenseAPI.getExpenses(queryParams)
      setExpenses(data.data.expenses || [])
    } catch (error) {
      addToast('Failed to load expenses', 'error')
      console.error('Expenses error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (formData) => {
    try {
      setFormLoading(true)
      const data = await expenseAPI.addExpense(formData)
      setExpenses(prev => [data.data.expense, ...prev])
      setShowModal(false)
      addToast('Expense added successfully!', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to add expense', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateExpense = async (formData) => {
    try {
      setFormLoading(true)
      const data = await expenseAPI.updateExpense(editingExpense._id, formData)
      setExpenses(prev => prev.map(exp => 
        exp._id === editingExpense._id ? data.data.expense : exp
      ))
      setShowModal(false)
      setEditingExpense(null)
      addToast('Expense updated successfully!', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to update expense', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await expenseAPI.deleteExpense(id)
      setExpenses(prev => prev.filter(exp => exp._id !== id))
      addToast('Expense deleted successfully!', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete expense', 'error')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingExpense(null)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExpenses()
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      startDate: '',
      endDate: ''
    })
    // Fetch expenses without filters after a short delay to allow state update
    setTimeout(() => {
      fetchExpenses()
    }, 100)
  }

  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find(cat => cat.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1]
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track your expenses
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search expenses..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
            <Button type="submit" variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Summary Section */}
      {expenses.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Summary</h3>
            <p className="text-2xl font-bold text-red-600">
              Total: ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <IndianRupee className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some(filter => filter) 
                ? 'No expenses match your filters' 
                : 'Get started by creating a new expense.'
              }
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              {Object.values(filters).some(filter => filter) && (
                <Button 
                  onClick={handleClearFilters}
                  variant="secondary"
                  className="ml-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category)
                    return (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {expense.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}

export default Expenses