import React from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const Toast = ({ toast }) => {
  const { removeToast } = useApp()
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />
  }
  
  const styles = {
    success: 'bg-green-50 border border-green-200',
    error: 'bg-red-50 border border-red-200',
    warning: 'bg-yellow-50 border border-yellow-200'
  }

  return (
    <div className={`flex items-center p-4 mb-2 rounded-lg shadow-sm ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="ml-3 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-400 hover:text-gray-900"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export const ToastContainer = () => {
  const { toasts } = useApp()
  
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default Toast