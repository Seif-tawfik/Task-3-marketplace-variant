import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadListing() {
      setError('')
      try {
        const res = await api.get('/listings/' + id)
        const { title, description = '', price, category, condition, status } = res.data.listing

        if (!cancelled) {
          setForm({ title, description, price, category, condition, status })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load listing')
        }
      }
    }

    loadListing()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const { title, description, price, category, condition, status } = form
    const payload = { title, description, price, category, condition }
    if (id) payload.status = status

    try {
      if (id) {
        await api.patch('/listings/' + id, payload)
      } else {
        await api.post('/listings', payload)
      }
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save listing')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          type="text"
          placeholder="Calculus textbook"
          value={form.title}
          onChange={onChange}
          required
        />
        <input
          className="input"
          name="price"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          value={form.price}
          onChange={onChange}
          required
        />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          <option value="textbooks">Textbooks</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          <option value="new">New</option>
          <option value="like-new">Like new</option>
          <option value="used">Used</option>
          <option value="worn">Worn</option>
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        )}
        <textarea
          className="input"
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={onChange}
          rows="3"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
