import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { clearToken } from '../lib/auth'
import '../styles/auth.css'

export function AddInquiryPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState({ loading: true, message: '' })
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    source: '',
    assignedTo: '',
    queryDate: '',
    remarks: '',
  })
  const [saving, setSaving] = useState(false)

  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/me')
        if (!alive) return
        setUser(data.user)
        setStatus({ loading: false, message: `Authenticated as ${data.user.email} (${data.user.role})` })
      } catch {
        if (!alive) return
        setStatus({ loading: false, message: 'Failed to load user data.' })
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function logout(e) {
    if (e) e.preventDefault()
    clearToken()
    navigate('/login', { replace: true })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/inquiries', form)
      alert('Inquiry added successfully')
      navigate('/dashboard')
    } catch (err) {
      console.error('Add inquiry error', err)
      alert(err?.response?.data?.message || 'Failed to add inquiry. Please try again.')
    } finally {
      setSaving(false)
    }
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
                      {status.loading ? 'Loading...' : (user?.name || 'User')} <img src="/images/downArrow.svg" className="icon" alt="dropdown" />
                    </h3>
                    {showDropdown && (
                      <ul className="unstyled dropDownMenu show" style={{ display: 'block', position: 'absolute', zIndex: 1000 }}>
                        <li><a href="/profile" className="text-link">Profile</a></li>
                        <li><a href="#" className="text-link" onClick={logout}>Logout</a></li>
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
                <div className="editProfile"><a href="/profile"><img src="/images/edit.svg" className="icon" alt="Edit" /></a></div>
                <div className="profileBg d-inline-block"><img src="/images/profile.svg" className="icon" alt="Profile" /></div>
                <h3 className="profileName d-inline-block">{status.loading ? 'Loading...' : (user?.name || 'User')}</h3>
              </div>
              <div className="sideMenu">
                <ul className="unstyled">
                  <li className="active"><a href="/dashboard"><img src="/images/dashboard.svg" className="icon" alt="Dashboard" /> Dashboard</a></li>
                  <li><a href="/all-inquiries"><img src="/images/inquiry.svg" className="icon" alt="All Inquiries" /> All Inquiries</a></li>
                  <li><a href="/today-follow-up"><img src="/images/follow-up.svg" className="icon" alt="Today Follow-up" /> Today&#39;s Follow-up</a></li>
                  <li><a href="/leads"><img src="/images/lead.svg" className="icon" alt="Leads" /> Leads</a></li>
                  <li><a href="/advanced-search"><img src="/images/search-a.svg" className="icon" alt="Advanced Search" /> Advanced Search</a></li>
                  <li><a href="/reports"><img src="/images/report.svg" className="icon" alt="Reports" /> Reports</a></li>
                  <li><a href="/managers"><img src="/images/manager.svg" className="icon" alt="Managers" /> Managers</a></li>
                  <li className="d-lg-none logout"><a href="#" onClick={logout}><img src="/images/logout.svg" className="icon" alt="Logout" /> Logout</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col mainBg">
            <div className="main">
              <div className="addInquiry">
                <div className="title mb-3">
                  <h1>Add Inquiry</h1>
                  <div className="breadcrumb"><p>Dashboard <span> &gt; </span> Add New Inquiry</p></div>
                </div>
                <section className="formSec">
                  <form onSubmit={onSubmit}>
                    <div className="row justify-content-between">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            name="name"
                            type="text"
                            placeholder="Enter Full Name"
                            className="form-control"
                            value={form.name}
                            onChange={onChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            name="email"
                            type="email"
                            placeholder="Enter Email Id"
                            className="form-control"
                            value={form.email}
                            onChange={onChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Mobile no.</label>
                          <input
                            name="mobile"
                            type="text"
                            placeholder="Enter Mobile no."
                            className="form-control"
                            value={form.mobile}
                            onChange={onChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Source of lead</label>
                          <div className="custom-select">
                            <select
                              name="source"
                              className="form-control"
                              value={form.source}
                              onChange={onChange}
                              required
                            >
                              <option value="">Select source</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Facebook">Facebook</option>
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="Twitter">Twitter</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Assign to</label>
                          <div className="custom-select">
                            <select
                              name="assignedTo"
                              className="form-control"
                              value={form.assignedTo}
                              onChange={onChange}
                              required
                            >
                              <option value="">Select manager</option>
                              <option value="Ranjana">Ranjana</option>
                              <option value="Kabita">Kabita</option>
                              <option value="Kajal Sharma">Kajal Sharma</option>
                              <option value="Mamta Sharma">Mamta Sharma</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Query received date</label>
                          <input
                            name="queryDate"
                            type="date"
                            className="form-control"
                            value={form.queryDate}
                            onChange={onChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Remarks</label>
                          <textarea
                            name="remarks"
                            className="form-control"
                            style={{ minHeight: '100px' }}
                            value={form.remarks}
                            onChange={onChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn blue-btn submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Add Inquiry'} <img src="/images/arrow.svg" alt="" />
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
