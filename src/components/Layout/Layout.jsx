import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { ToastContainer } from '../UI/Toast'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

export default Layout