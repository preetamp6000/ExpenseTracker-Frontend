import React, { useState, useEffect } from 'react'
import { expenseAPI } from '../utils/api'
import { useApp } from '../context/AppContext'
import ExpenseChart from '../components/Charts/ExpenseChart'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { CATEGORIES, MONTHS } from '../utils/constants'
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee,
  Calendar
} from 'lucide-react'

// Add COLORS constant at the top of the file
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b']

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { addToast } = useApp()

  useEffect(() => {
    fetchDashboardData()
  }, [selectedMonth, selectedYear])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get first and last day of selected month for date range
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

      console.log('Fetching data for:', { startDate, endDate }) // Debug log

      const data = await expenseAPI.getExpenses({
        startDate: startDate,
        endDate: endDate
      })
      
      const expenses = data.data.expenses || []

      // Calculate stats
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
      
      // Calculate category-wise spending
      const categoryData = CATEGORIES.map(category => {
        const categoryExpenses = expenses.filter(exp => exp.category === category.value)
        const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        return {
          category: category.label,
          amount: total,
          count: categoryExpenses.length,
          value: category.value
        }
      }).filter(item => item.amount > 0)

      // Get recent expenses (last 5)
      const recent = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setStats({
        totalExpenses,
        averageExpense,
        expenseCount: expenses.length,
        month: MONTHS[selectedMonth],
        year: selectedYear
      })
      
      setChartData(categoryData)
      setRecentExpenses(recent)
    } catch (error) {
      addToast('Failed to load dashboard data', 'error')
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value))
  }

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value))
  }

  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find(cat => cat.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1]
  }

  // Generate years for dropdown (current year and previous 4 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Selector */}
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your spending for {stats?.month} {stats?.year}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IndianRupee className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats?.totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Expense</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats?.averageExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.expenseCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories Used</p>
              <p className="text-2xl font-semibold text-gray-900">
                {chartData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Spending by Category
          </h3>
          <ExpenseChart data={chartData} type="bar" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Category Distribution
          </h3>
          <ExpenseChart data={chartData} type="pie" />
        </div>
      </div>

      {/* Category Breakdown & Recent Expenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{item.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.count} transaction{item.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        {recentExpenses.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Expenses
            </h3>
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category)
                return (
                  <div key={expense._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {expense.notes || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-red-600">
                      ₹{expense.amount.toFixed(2)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {stats?.expenseCount === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <IndianRupee className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expenses for {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <p className="text-gray-600 mb-4">
            Start tracking your expenses by adding your first expense for this month.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setSelectedMonth(new Date().getMonth())}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View Current Month
            </button>
            <button
              onClick={() => {
                setSelectedMonth(new Date().getMonth())
                setSelectedYear(new Date().getFullYear())
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard