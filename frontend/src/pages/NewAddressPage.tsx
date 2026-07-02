import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '../services/apiClient'
import { userService } from '../services/userService'
import type { AddressInput } from '../types/user'

const emptyAddress: AddressInput = {
  fullName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  detail: '',
}

export default function NewAddressPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const addressId = searchParams.get('id')
  const returnTo = searchParams.get('returnTo') === '/checkout' ? '/checkout' : '/shipping-address'
  const [form, setForm] = useState<AddressInput>(emptyAddress)
  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: userService.getAddresses,
    enabled: Boolean(addressId),
  })
  const saveMutation = useMutation({
    mutationFn: (input: AddressInput) =>
      addressId
        ? userService.updateAddress(addressId, input)
        : userService.createAddress(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
      navigate(returnTo)
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
    const address = addressesQuery.data?.find((item) => item.id === addressId)
    if (!address) return
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
    })
  }, [addressId, addressesQuery.data])

  function setField(field: keyof AddressInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveMutation.mutate(form)
  }

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/shipping-address">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>{addressId ? 'Edit Address' : 'Add New Address'}</h3>
          </div>
        </div>
      </header>
      <section className="section-b-space">
        <div className="custom-container">
          <form className="address-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <div className="form-input mb-3">
                <input type="text" className="form-control" placeholder="Enter your name" value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="form-input mb-3">
                <input type="text" className="form-control" placeholder="Enter your number" value={form.phone} onChange={(event) => setField('phone', event.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <div className="form-input mb-3">
                <input type="text" className="form-control" placeholder="Enter your address" value={form.detail} onChange={(event) => setField('detail', event.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ward</label>
              <div className="form-input mb-3">
                <input type="text" className="form-control" placeholder="Enter ward" value={form.ward} onChange={(event) => setField('ward', event.target.value)} required />
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Province/City</label>
                  <div className="form-input mb-3">
                    <input type="text" className="form-control" placeholder="Enter province" value={form.province} onChange={(event) => setField('province', event.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <div className="form-input mb-3">
                    <input type="text" className="form-control" placeholder="Enter district" value={form.district} onChange={(event) => setField('district', event.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address Type</label>
                <ul className="address-type">
                  <li>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="flexRadioDefault1" defaultChecked />
                      <label className="form-check-label" htmlFor="flexRadioDefault1">Home</label>
                    </div>
                  </li>
                  <li>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="flexRadioDefault2" />
                      <label className="form-check-label" htmlFor="flexRadioDefault2"> Office</label>
                    </div>
                  </li>
                  <li>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="addressType" id="flexRadioDefault3" />
                      <label className="form-check-label" htmlFor="flexRadioDefault3">Other</label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <section className="panel-space" />
            <div className="footer-modal d-flex gap-3">
              <a href="/shipping-address" className="btn gray-btn btn-inline mt-0 w-50">Cancel</a>
              <button type="submit" className="theme-btn btn btn-inline mt-0 w-50" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : addressId ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
