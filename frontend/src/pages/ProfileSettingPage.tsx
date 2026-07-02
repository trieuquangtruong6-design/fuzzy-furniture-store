import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../services/apiClient'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'

export default function ProfileSettingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  })
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (avatarFile) {
        await userService.uploadAvatar(avatarFile)
      }

      return userService.updateProfile({
        fullName,
        phone: phone || null,
        birthDate: birthDate || null,
        ...(!avatarFile ? { avatarUrl: avatarUrl || null } : {}),
      })
    },
    onSuccess: (user) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setAvatarFile(null)
      setUser(user)
      queryClient.setQueryData(['profile'], user)
      queryClient.setQueryData(['auth', 'me'], user)
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      navigate('/profile')
    },
    onError: (error) => window.alert(getApiErrorMessage(error)),
  })

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  useEffect(() => {
    if (!profileQuery.data) return
    setFullName(profileQuery.data.fullName)
    setPhone(profileQuery.data.phone ?? '')
    setBirthDate(profileQuery.data.birthDate?.slice(0, 10) ?? '')
    setAvatarUrl(profileQuery.data.avatarUrl ?? '')
  }, [profileQuery.data])

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      window.alert('Avatar must be a JPEG, PNG or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert('Avatar must not exceed 2MB.')
      event.target.value = ''
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleAvatarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      fileInputRef.current?.click()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateMutation.mutate()
  }

  return (
    <div>
      <header className="profile-header section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/categories">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>Profile</h3>
          </div>
          <div
            className="profile-setting-pic mx-auto"
            role="button"
            tabIndex={0}
            aria-label="Choose avatar image"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleAvatarKeyDown}
            style={{ cursor: 'pointer', minHeight: 44, minWidth: 44 }}
          >
            <img className="img-fluid img" src={previewUrl || avatarUrl || "/fuzzy/assets/images/icons/profile1.png"} alt="profile" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              hidden
            />
          </div>
        </div>
      </header>
      <form className="theme-form profile-setting mt-5" onSubmit={handleSubmit}>
        <div className="custom-container">
          <div className="form-group d-block">
            <label htmlFor="inputname" className="form-label">Name</label>
            <div className="form-input mb-4">
              <input type="text" className="form-control" id="inputname" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              <i className="iconsax icons" data-icon="user-1" />
            </div>
          </div>
          <div className="form-group d-block">
            <label htmlFor="inputuseremail" className="form-label">Email id</label>
            <div className="form-input mb-4">
              <input type="email" className="form-control" id="inputuseremail" value={profileQuery.data?.email ?? ''} disabled />
              <i className="iconsax icons" data-icon="mail" />
            </div>
          </div>
          <div className="form-group d-block">
            <label htmlFor="inputusernumber" className="form-label">Phone Number</label>
            <div className="form-input">
              <input type="text" className="form-control" id="inputusernumber" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <i className="iconsax icons" data-icon="phone" />
            </div>
          </div>
          <div className="form-group d-block">
            <label htmlFor="inputbirthdate" className="form-label">Birth Date</label>
            <div className="form-input mb-4">
              <input type="date" className="form-control" id="inputbirthdate" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
            </div>
          </div>
          <div className="form-group d-block">
            <label htmlFor="inputavatar" className="form-label">Avatar URL</label>
            <div className="form-input">
              <input type="text" className="form-control" id="inputavatar" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
            </div>
          </div>
          <div className="footer-modal d-flex gap-3">
            <a href="/profile" className="btn gray-btn btn-inline mt-0 w-50">Cancel</a>
            <button type="submit" className="theme-btn btn btn-inline mt-0 w-50" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </form>
      <section className="panel-space" />
    </div>
    
  )
}
