import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../services/apiClient'
import { userService } from '../services/userService'

export default function ShippingAddressPage() {
  const queryClient = useQueryClient()
  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: userService.getAddresses,
  })
  const defaultMutation = useMutation({
    mutationFn: userService.setDefaultAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
    onError: (error) => window.alert(getApiErrorMessage(error)),
  })
  const deleteMutation = useMutation({
    mutationFn: userService.deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
    onError: (error) => window.alert(getApiErrorMessage(error)),
  })

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ""
    return () => {
      document.body.className = previousClass
    }
  }, [])

  function handleDelete(id: string) {
    if (window.confirm('Delete this address?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/profile">
              <i className="iconsax back-btn" data-icon="arrow-left" />
            </a>
            <h3>Shipping Details</h3>
          </div>
        </div>
      </header>
      <section className="shipping-details-sec">
        <div className="custom-container">
          <ul className="address-list">
            {(addressesQuery.data ?? []).map((address) => (
              <li key={address.id}>
                <div className="shipping-address">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="shippingAddress"
                        id={`address-${address.id}`}
                        checked={address.isDefault}
                        onChange={() => defaultMutation.mutate(address.id)}
                      />
                      <label className="form-check-label" htmlFor={`address-${address.id}`}>
                        {address.fullName}
                      </label>
                    </div>
                    <div className="options">
                      <a href={`/new-address?id=${address.id}`}>
                        <i className="iconsax icons" data-icon="edit-2" />
                      </a>
                      <a href="#" onClick={(event) => { event.preventDefault(); handleDelete(address.id) }}>
                        <i className="iconsax icons" data-icon="trash" />
                      </a>
                    </div>
                  </div>
                  <div className="address-details">
                    <p>{address.detail}, {address.ward}, {address.district}, {address.province}</p>
                    <h5 className="content-number">Phone no. : <span> {address.phone}</span></h5>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <a href="/new-address" className="btn gray-btn w-100">+ Add New Address</a>
          <div className="apply-btn">
            <a href="/profile" className="btn theme-btn w-100">apply</a>
          </div>
        </div>
      </section>
      <section className="panel-space" />
    </div>
  )
}
