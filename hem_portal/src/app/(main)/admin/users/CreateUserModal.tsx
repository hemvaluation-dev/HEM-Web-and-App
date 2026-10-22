'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createAgent } from '../actions'
import { INDIAN_STATES } from '@/utils/constants'

export default function CreateUserModal({ managers = [] }: { managers?: any[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedLevel, setSelectedLevel] = useState('L1')
  const [selectedRole, setSelectedRole] = useState('field_agent')
  const [selectedDept, setSelectedDept] = useState('Valuation')

  // Auto-derive tier/role and validate department based on level
  const handleLevelChange = (lvl: string) => {
    setSelectedLevel(lvl)
    if (lvl === 'L1' || lvl === 'L2') setSelectedRole('field_agent')
    else if (lvl === 'L3') {
      setSelectedRole('manager')
      if (selectedDept !== 'Management' && selectedDept !== 'Valuation') setSelectedDept('Management')
    }
    else if (lvl === 'L4') {
      setSelectedRole('lead')
      if (selectedDept !== 'Management' && selectedDept !== 'HR/Admin') setSelectedDept('Management')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await createAgent(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-lg transition-all duration-200 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add User
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Add New User</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-danger-bg text-danger-text rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Full Name</label>
                  <input 
                    name="full_name" 
                    required 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="john@hem.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Level</label>
                  <input type="hidden" name="role" value={selectedRole} />
                  <select 
                    name="level" 
                    required 
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary font-bold text-brand-dark"
                  >
                    <option value="L1">L1 (Employee)</option>
                    <option value="L2">L2 (Employee)</option>
                    <option value="L3">L3 (Manager)</option>
                    <option value="L4">L4 (Sr. Manager)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Department</label>
                  <select 
                    name="department" 
                    required
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    {selectedLevel === 'L3' ? (
                      <>
                        <option value="Management">Management</option>
                        <option value="Valuation">Valuation</option>
                      </>
                    ) : selectedLevel === 'L4' ? (
                      <>
                        <option value="Management">Management</option>
                        <option value="HR/Admin">HR/Admin</option>
                      </>
                    ) : (
                      <>
                        <option value="Valuation">Valuation</option>
                        <option value="Field Operations">Field Operations</option>
                        <option value="HR/Admin">HR/Admin</option>
                        <option value="Management">Management</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {['L1', 'L2', 'L3'].includes(selectedLevel) && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Reporting Manager</label>
                  <select 
                    name="reporting_manager" 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">None (Direct to Senior Management)</option>
                    {managers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || m.email} ({m.level || 'L4'} - {m.department || 'Management'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">State</label>
                  <select 
                    name="state" 
                    required
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Phone Number</label>
                  <input 
                    name="phone" 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="+91..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Temporary Password</label>
                  <input 
                    name="password" 
                    type="password"
                    required 
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface">Address</label>
                <input 
                  name="address" 
                  className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="123 Main St, Mumbai, Maharashtra"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-base mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 text-on-surface-variant font-bold hover:bg-surface-hover rounded-lg transition-colors border border-border-base"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
