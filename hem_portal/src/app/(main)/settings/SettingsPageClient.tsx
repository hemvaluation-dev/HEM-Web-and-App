'use client'

import { useRouter } from 'next/navigation'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, User, Mail, Phone, MapPin, Save, ShieldCheck, Trash2, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { updateProfile } from './actions'
import { findTemplate } from '@/lib/report-engine/templates'

export default function SettingsPage({ profile, initialClients = [] }: { profile: any, initialClients?: any[] }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [clients, setClients] = useState<any[]>(initialClients)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [institutionName, setInstitutionName] = useState('')
  const [institutionMessage, setInstitutionMessage] = useState('')

  async function handleRenameBank(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingClientId || loading) return
    setLoading(true)
    setInstitutionMessage('')
    try {
      const { renameClientBank } = await import('../admin/actions')
      const result = await renameClientBank(editingClientId, institutionName)
      if (result.error) {
        setInstitutionMessage(result.error)
      } else if (result.client) {
        setClients(prev => prev.map(client => client.id === result.client.id ? result.client : client)
          .sort((a, b) => a.name.localeCompare(b.name)))
        setEditingClientId(null)
        setInstitutionMessage('Institution name updated.')
        router.refresh()
      }
    } catch {
      setInstitutionMessage('Could not save the name. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDeleteBank(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

    setLoading(true)
    const { deleteClientBank } = await import('../admin/actions')
    const res = await deleteClientBank(id)
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: `Successfully deleted ${name}.` })
      setClients(prev => prev.filter(c => c.id !== id))
      router.refresh()
    }
    setLoading(false)
  }

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-on-surface">
      <div>
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Settings & Profile</h1>
        <p className="text-on-surface-variant mt-2">Manage your account details and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Profile Card */}
        <div className="col-span-1">
          <div className="bg-surface border border-border-base rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center text-brand-dark text-3xl font-bold mb-4">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : profile?.email?.[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-on-surface">{profile?.full_name || 'Unnamed User'}</h2>
            <p className="text-on-surface-variant flex items-center gap-1 mt-1 justify-center">
               <ShieldCheck className="w-4 h-4 text-brand-dark" />
               <span className="capitalize">{profile?.role === 'owner' ? 'Senior Management' : (profile?.role?.replace('_', ' ') || 'Agent')}</span>
            </p>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="col-span-1 md:col-span-2 space-y-8">

          {/* Profile Edit Form */}
          <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-base bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <User className="w-5 h-5 text-brand-dark" />
                Personal Information
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              {message.text && (
                <div className={`p-4 rounded-lg text-sm font-bold ${message.type === 'error' ? 'bg-danger-bg text-danger-text' : 'bg-success-bg text-success-text'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Full Name</label>
                  <input
                    name="full_name"
                    defaultValue={profile?.full_name}
                    className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Email (Read Only)</label>
                  <input
                    readOnly
                    disabled
                    defaultValue={profile?.email}
                    className="w-full bg-surface-hover border border-border-base rounded-lg px-4 py-2.5 text-on-surface-variant cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3.5 text-on-surface-variant" />
                    <input
                      name="phone"
                      defaultValue={profile?.phone}
                      className="w-full bg-surface-container-low border border-border-base rounded-lg pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-on-surface-variant" />
                    <input
                      name="address"
                      defaultValue={profile?.address}
                      className="w-full bg-surface-container-low border border-border-base rounded-lg pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Current Password</label>
                      <input
                        name="current_password"
                        type="password"
                        placeholder="Required to change password"
                        className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">New Password</label>
                      <input
                        name="new_password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-base">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Appearance Form */}
          <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-base bg-surface-container-low">
              <h2 className="text-xl font-bold text-on-surface mb-1">Appearance</h2>
              <p className="text-sm text-on-surface-variant">Select how the application looks to you.</p>
            </div>

            <div className="p-6">
              <div className="flex bg-surface-hover p-1 rounded-xl w-fit">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-surface text-brand-dark shadow-sm font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-surface text-brand-dark shadow-sm font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'system'
                      ? 'bg-surface text-brand-dark shadow-sm font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  System
                </button>
              </div>
            </div>
          </div>

          {/* Owner Only: Manage Financial Institutions */}
          {profile?.role === 'owner' && (
            <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-base bg-surface-container-low">
                <h2 className="text-xl font-bold text-on-surface mb-1">Financial Institutions</h2>
                <p className="text-sm text-on-surface-variant">Manage the list of lenders and banks available in the application.</p>
              </div>

              <form
                action={async (formData) => {
                  const bankName = formData.get('bank_name') as string
                  if (!bankName) return
                  setLoading(true)
                  const { createClientBank } = await import('../admin/actions')
                  const res = await createClientBank(bankName)
                  if (res.error) {
                    setMessage({ type: 'error', text: res.error })
                  } else {
                    setMessage({ type: 'success', text: `Successfully added ${bankName} to the list of institutions.` })
                    if (res.client) {
                      setClients(prev => [...prev, res.client].sort((a, b) => a.name.localeCompare(b.name)))
                    }
                    const form = document.getElementById('add-bank-form') as HTMLFormElement
                    if (form) form.reset()
                    router.refresh()
                  }
                  setLoading(false)
                }}
                id="add-bank-form"
                className="p-6 space-y-4"
              >
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-bold text-on-surface">Add New Lender / Institution</label>
                    <input
                      name="bank_name"
                      required
                      placeholder="e.g., HDFC Bank - LAP Valuation"
                      className="w-full bg-surface-container-low border border-border-base rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Add Institution
                  </button>
                </div>
              </form>

              <div className="border-t border-border-base">
                {institutionMessage && <p role="status" className="px-6 py-3 text-sm text-on-surface">{institutionMessage}</p>}
                <ul className="divide-y divide-border-base max-h-[300px] overflow-y-auto">
                  {clients.map(client => (
                    <li key={client.id} className="px-6 py-4 flex flex-wrap gap-3 items-center justify-between group hover:bg-surface-hover transition-colors">
                      {editingClientId === client.id ? (
                        <form onSubmit={handleRenameBank} className="w-full space-y-3">
                          <label htmlFor={`institution-${client.id}`} className="text-sm font-medium">Institution name</label>
                          <input id={`institution-${client.id}`} value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                            autoFocus required maxLength={150} disabled={loading}
                            className="w-full bg-surface-container-low border border-border-base rounded-lg px-3 py-2 text-on-surface" />
                          <div className="flex gap-3">
                            <button type="submit" disabled={loading || !institutionName.trim()} className="px-3 py-2 rounded-lg bg-primary text-on-primary disabled:opacity-50">{loading ? 'Saving…' : 'Save name'}</button>
                            <button type="button" disabled={loading} onClick={() => { setEditingClientId(null); setInstitutionMessage('') }} className="px-3 py-2 rounded-lg border border-border-base">Cancel</button>
                          </div>
                        </form>
                      ) : <>
                      <span className="text-sm font-medium text-on-surface">{client.name}</span>
                      <div className="flex items-center gap-2">
                        <button type="button" disabled={loading} aria-label={`Edit ${client.name}`} onClick={() => {
                          setEditingClientId(client.id); setInstitutionName(client.name); setInstitutionMessage('')
                        }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-brand-dark hover:bg-surface-container disabled:opacity-50">
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                      {!(findTemplate(client.template_name) ?? findTemplate(client.name)) ? (
                        <button
                          onClick={() => handleDeleteBank(client.id, client.name)}
                          disabled={loading}
                          className="text-danger hover:bg-danger-bg p-2 rounded-lg opacity-100 transition-all disabled:opacity-50"
                          title="Remove Institution"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant bg-surface-container py-1 px-2 rounded-md">Built-in Template</span>
                      )}
                      </div>
                      </>}
                    </li>
                  ))}
                  {clients.length === 0 && (
                    <li className="px-6 py-8 text-center text-on-surface-variant text-sm">
                      No institutions found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
