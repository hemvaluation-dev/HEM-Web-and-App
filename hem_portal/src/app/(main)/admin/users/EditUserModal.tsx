'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { Edit2, X, Trash2 } from 'lucide-react'
import { updateUser, deleteUserAction } from '../actions'
import { INDIAN_STATES } from '@/utils/constants'

export default function EditUserModal({ user, managers = [] }: { user: any; managers?: any[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedLevel, setSelectedLevel] = useState(user.level || 'L1')
  const [selectedRole, setSelectedRole] = useState(user.role || 'field_agent')
  const [selectedDept, setSelectedDept] = useState(user.department || 'Valuation')

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
    formData.append('id', user.id)
    
    const result = await updateUser(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      setIsOpen(false)
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    setDeleteLoading(true)
    setError('')
    
    const result = await deleteUserAction(user.id)
    
    if (result.error) {
      setError(result.error)
      setDeleteLoading(false)
    } else {
      router.refresh()
      setIsOpen(false)
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors text-on-surface-variant hover:text-brand-dark"
        title="Edit User"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface">Edit User</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
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
                    defaultValue={user.full_name}
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Email (Read Only)</label>
                  <input 
                    name="email" 
                    type="email" 
                    readOnly
                    disabled
                    defaultValue={user.email}
                    className="w-full bg-surface-hover border border-border-base rounded-lg px-4 py-2 text-on-surface-variant focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Level</label>
                  <input type="hidden" name="role" value={selectedRole} />
                  {user.role === 'owner' && <input type="hidden" name="level" value={selectedLevel} />}
                  <select 
                    name={user.role === 'owner' ? undefined : "level"}
                    required 
                    value={selectedLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    disabled={user.role === 'owner'}
                    className={`w-full border border-border-base rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-bold ${
                      user.role === 'owner' ? 'bg-surface-hover text-on-surface-variant cursor-not-allowed appearance-none' : 'bg-surface-container-low text-brand-dark'
                    }`}
                  >
                    <option value="L1">L1 (Employee)</option>
                    <option value="L2">L2 (Employee)</option>
                    <option value="L3">L3 (Manager)</option>
                    <option value="L4">L4 (Sr. Manager)</option>
                    {user.role === 'owner' && <option value="L5">L5 (Senior Management)</option>}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">Department</label>
                  {user.role === 'owner' && <input type="hidden" name="department" value={selectedDept} />}
                  <select 
                    name={user.role === 'owner' ? undefined : "department"}
                    required
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    disabled={user.role === 'owner'}
                    className={`w-full border border-border-base rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${
                      user.role === 'owner' ? 'bg-surface-hover text-on-surface-variant cursor-not-allowed appearance-none' : 'bg-surface-container-low text-on-surface'
                    }`}
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
                    defaultValue={user.reporting_manager || ''}
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">None (Direct to Senior Management)</option>
                    {managers.map((m: any) => {
                      return (
                        <option key={m.id} value={m.id}>
                          {m.full_name || m.email} ({m.level || 'L4'} - {m.department || 'Management'})
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-on-surface">State</label>
                  <select 
                    name="state" 
                    required
                    defaultValue={user.state || ''}
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
                  defaultValue={user.phone}
                  className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              </div>

              {user.role !== 'owner' ? (
                <div className="space-y-1">
                   <label className="flex items-center gap-2 text-sm font-bold text-on-surface cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="is_active" 
                        value="true"
                        defaultChecked={user.is_active !== false}
                        className="w-4 h-4 rounded text-brand-dark focus:ring-primary"
                      />
                      Active User (Can log in)
                   </label>
                </div>
              ) : (
                <input type="hidden" name="is_active" value="true" />
              )}

              <div className="pt-4 flex justify-between items-center border-t border-border-base mt-6">
                {user.role !== 'owner' ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading || loading}
                    className="flex items-center gap-2 px-4 py-2 text-danger-text hover:bg-danger-bg font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                ) : <div />}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 text-on-surface-variant font-bold hover:bg-surface-hover rounded-lg transition-colors border border-border-base"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || deleteLoading}
                    className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
