import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { clearToken } from '../lib/auth'
import '../styles/auth.css'

export function DashboardPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState({ loading: true, message: '' })
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/me')
        if (!alive) return
        setUser(data.user)
        setStatus({
          loading: false,
          message: `Authenticated as ${data?.user?.email || 'user'} (${data?.user?.role || 'n/a'})`,
        })
      } catch (e) {
        if (!alive) return
        setStatus({
          loading: false,
          message:
            e?.response?.data?.message ||
            e?.message ||
            'Failed to load protected data.',
        })
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function logout(e) {
    if (e) e.preventDefault()
    clearToken()
    navigate('/login', { replace: true })
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
                  <div className="myProFile col-auto" ref={dropdownRef}>
                    <h3 className="dropDownBTN" onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }}>
                      {status.loading ? 'Loading...' : (user?.name || 'User')} <img src="/images/downArrow.svg" className="icon" alt="dropdown" style={{ pointerEvents: 'none' }} />
                    </h3>
                    {showDropdown && (
                      <ul className="unstyled dropDownMenu show" style={{ display: 'block', position: 'absolute', zIndex: 1000 }}>
                        <li>
                          <a href="/profile" className="text-link">
                            Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-link" onClick={logout}>
                            Logout
                          </a>
                        </li>
                      </ul>
                    )}
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
                  <img src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`) : '/images/profile.svg'} className="icon" alt="Profile" />
                </div>
                <h3 className="profileName d-inline-block">{status.loading ? 'Loading...' : (user?.name || 'User')}</h3>
              </div>
              <div className="sideMenu">
                <ul className="unstyled">
                  <li className="active">
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
                    <a href="#" onClick={logout}>
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
                <h1>Welcome to TheMotoMen</h1>
              </div>

              <section className="totleCount">
                <div className="row">
                  <div className="col-xl-4 col-md-6">
                    <div className="shadowBox mb-3">
                      <div className="row align-items-center">
                        <div className="col">
                          <p>Total Inquiry</p>
                          <h3>{3200}</h3>
                        </div>
                        <div className="col text-right iconWithBgParent">
                          <div className="iconWithbg">
                            <img src="/images/inquiry-red.svg" className="icon" alt="Inquiry" />
                          </div>
                        </div>
                      </div>
                      <div className="latestQuery">
                        <h4>Your Latest Inquiry</h4>
                        <ul className="unstyled mb-3">
                          <li><span>Name :</span> Manish Panday</li>
                          <li><span>Car :</span> BMW</li>
                          <li><span>Services :</span> Paint Protection Film</li>
                        </ul>
                        <button type="button" className="whiteBgBtn btn" onClick={() => navigate('/add-inquiry')}>
                          <span>+</span> Add New Query
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-6">
                    <div className="shadowBox mb-3">
                      <div className="row align-items-center">
                        <div className="col">
                          <p>Total Leads</p>
                          <h3 className="skyColor">605</h3>
                        </div>
                        <div className="col text-right iconWithBgParent">
                          <div className="iconWithbg skyBg">
                            <img src="/images/lead-fill.svg" className="icon" alt="Leads" />
                          </div>
                        </div>
                      </div>
                      <div className="latestQuery">
                        <h4>Latest Lead</h4>
                        <ul className="unstyled mb-3">
                          <li><span>Name :</span> Manish Panday</li>
                          <li><span>Car :</span> BMW</li>
                          <li><span>Services :</span> Paint Protection Film</li>
                        </ul>
                        <button type="button" className="whiteBgBtn btn" onClick={() => navigate('/leads')}>
                          View or Update
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-6">
                    <div className="shadowBox mb-3">
                      <div className="row align-items-center">
                        <div className="col">
                          <p>Today&apos;s New Inquiry</p>
                          <h3 className="blueColor">805</h3>
                        </div>
                        <div className="col text-right iconWithBgParent">
                          <div className="iconWithbg blueBg">
                            <img src="/images/inquiry-blue.svg" className="icon" alt="Today's Inquiry" />
                          </div>
                        </div>
                      </div>
                      <div className="latestQuery">
                        <h4>Latest Inquiry</h4>
                        <ul className="unstyled mb-3">
                          <li><span>Name :</span> Manish Panday</li>
                          <li><span>Car :</span> BMW</li>
                          <li><span>Services :</span> Paint Protection Film</li>
                        </ul>
                        <button type="button" className="whiteBgBtn btn" onClick={() => navigate('/all-inquiries')}>
                          View or Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

