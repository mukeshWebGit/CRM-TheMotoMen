import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import '../styles/auth.css'

export function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('/images/profile.svg')
  const fileInputRef = useRef(null)

  const backendOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const resolveProfileImageUrl = useCallback((url) => {
    if (!url) return '/images/profile.svg'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${backendOrigin}${url}`
    return `${backendOrigin}/${url}`
  }, [backendOrigin])

  const loadUserProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/api/me')
      console.log('Loaded user profile data:', data.user)
      setUser(data.user)
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        mobile: data.user.mobile || '',
        password: ''
      })
      if (data.user.profileImage) {
        setImagePreview(resolveProfileImageUrl(data.user.profileImage))
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }, [resolveProfileImageUrl])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (100KB max)
      if (file.size > 100 * 1024) {
        alert('File size must be less than 100KB')
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = new FormData()
      updateData.append('name', formData.name)
      updateData.append('email', formData.email)
      updateData.append('mobile', formData.mobile)
      if (formData.password) {
        updateData.append('password', formData.password)
      }
      if (profileImage) {
        updateData.append('profileImage', profileImage)
      }

      await api.put('/api/me', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Profile updated successfully!')
      // Reload user data
      await loadUserProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to update profile. Please try again.'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="dash-card">
          <div>Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="leftHeader col">
              <div className="row my-0 align-items-center">
                <div className="menuIcon col py-0">
                  <div className="bar1" />
                  <div className="bar2" />
                  <div className="bar3" />
                </div>
                <div className="logo col">
                  <img src="/images/Logo.svg" alt="Logo" />
                </div>
              </div>
            </div>
            <div className="rightHeader col">
              <div className="profileMenu">
                <div className="row justify-content-end">
                  <div className="myProFile col-auto">
                    <h3 className="dropDownBTN">
                      {user?.name || 'User'} <img src="/images/downArrow.svg" className="icon" alt="dropdown" />
                    </h3>
                    <ul className="unstyled dropDownMenu">
                      <li>
                        <a href="/profile" className="text-link">Profile</a>
                      </li>
                      <li>
                        <a href="#" className="text-link" onClick={(e) => {
                          e.preventDefault()
                          navigate('/login', { replace: true })
                        }}>Logout</a>
                      </li>
                    </ul>
                  </div>
                  <div className="addBtn col-auto text-right">
                    <button type="button" className="addQueryBtn withIcon" onClick={() => navigate('/add-inquiry')}>
                      <span>+</span> <i className="d-lg-inline">Add New</i> Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="content container-fluid py-3">
        <div className="row">
          <div className="sideBar col-auto">
            <div className="sideBarArea">
              <div className="sideProfile mb-2">
                <div className="editProfile">
                  <a href="/profile">
                    <img src="/images/edit.svg" className="icon" alt="Edit" />
                  </a>
                </div>
                <div className="profileBg d-inline-block">
                  <img src="/images/profile.svg" className="icon" alt="Profile" />
                </div>
                <h3 className="profileName d-inline-block">{user?.name || 'User'}</h3>
              </div>
              <div className="sideMenu">
                <ul className="unstyled">
                  <li>
                    <a href="/dashboard">
                      <img src="/images/dashboard.svg" className="icon" alt="Dashboard" /> Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/all-inquiries">
                      <img src="/images/inquiry.svg" className="icon" alt="All Inquiries" /> All Inquiries
                    </a>
                  </li>
                  <li>
                    <a href="/today-follow-up">
                      <img src="/images/follow-up.svg" className="icon" alt="Today Follow-up" /> Today&#39;s Follow-up
                    </a>
                  </li>
                  <li>
                    <a href="/leads">
                      <img src="/images/lead.svg" className="icon" alt="Leads" /> Leads
                    </a>
                  </li>
                  <li>
                    <a href="/advanced-search">
                      <img src="/images/search-a.svg" className="icon" alt="Advanced Search" /> Advanced Search
                    </a>
                  </li>
                  <li>
                    <a href="/reports">
                      <img src="/images/report.svg" className="icon" alt="Reports" /> Reports
                    </a>
                  </li>
                  <li>
                    <a href="/managers">
                      <img src="/images/manager.svg" className="icon" alt="Managers" /> Managers
                    </a>
                  </li>
                  <li className="d-lg-none logout">
                    <a href="#" onClick={(e) => {
                      e.preventDefault()
                      navigate('/login', { replace: true })
                    }}>
                      <img src="/images/logout.svg" className="icon" alt="Logout" /> Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col mainBg">
            <div className="main">
              <div className="title mb-3">
                <h1>Profile Settings</h1>
                <p>Provide the information below</p>
              </div>

              <section className="profileSec">
                <div className="profile row my-0 align-items-center">
                  <div className="col profilePic">
                    <div className="profileImg">
                      <span id="preview">
                        <img src={imagePreview} className="preview-item" alt="Profile" />
                      </span>
                    </div>
                  </div>
                  <div className="col profileUpload">
                    <label className="profile-upload-btn">
                      <img src="/images/upload.svg" className="icon" alt="Upload" /> Upload File
                      <input
                        type="file"
                        className="input-img"
                        id="fileInput"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p>JPG, GIF or PNG. Max size of 100K</p>
                  </div>
                </div>

                <form className="profileDetails formSec mt-3" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Change Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter Your New Password"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn blue-btn updateProfile" disabled={saving}>
                      {saving ? 'Updating...' : 'Update'} <img src="/images/arrow.svg" alt="" />
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container-fluid" />
      </footer>
    </>
  )
}