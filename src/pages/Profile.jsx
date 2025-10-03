import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useApp } from '../context/AppContext'
import { profileAPI } from '../utils/api'
import ProfileForm from '../components/Forms/ProfileForm'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Button from '../components/UI/Button'
import { User, Mail, Calendar, Phone } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const { addToast } = useApp()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await profileAPI.getProfile()
      setProfile(data.data.user)
    } catch (error) {
      addToast('Failed to load profile', 'error')
      console.error('Profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (formData) => {
    try {
      setUpdating(true)
      const data = await profileAPI.updateProfile(formData)
      setProfile(data.data.user)
      addToast('Profile updated successfully!', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {profile?.username}
                </h2>
                <p className="text-sm text-gray-500">{profile?.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{profile?.email}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span>
                  Joined {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>

              {profile?.profile?.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{profile.profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Personal Information
            </h3>
            <ProfileForm
              user={profile}
              onSubmit={handleUpdateProfile}
              loading={updating}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile