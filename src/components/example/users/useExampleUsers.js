import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractApiErrorMessage } from '../../../api/clients'
import {
  getExampleUsers,
  registerExampleUser,
  updateExampleUser,
  disableExampleUser,
} from '../../../api/exampleUsersService'
import { getProfile } from '../../../auth/session'
import { formatDate } from '../../../utils/dateTime'

const DEFAULT_FILTERS = { search: '', status: 'all' }
const EMPTY_FORM      = { email: '', password: '', role: 'User', fullName: '' }

export default function useExampleUsers() {
  const [rows, setRows]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [busyRowId, setBusyRowId]   = useState(null)
  const [notification, setNotification] = useState(null)

  const [formOpen, setFormOpen]     = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', variant: 'info',
    confirmText: 'Confirmar', requireComment: false, action: null,
  })
  const [actionForm, setActionForm] = useState({ comments: '' })

  const [filters, setFilters]       = useState(DEFAULT_FILTERS)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(50)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getExampleUsers()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setRows([])
      setError(extractApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return rows.filter((row) => {
      if (q && !String(row.fullName || '').toLowerCase().includes(q)) return false
      if (filters.status === 'active'   && !row.isActive) return false
      if (filters.status === 'inactive' &&  row.isActive) return false
      return true
    })
  }, [rows, filters])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / pageSize)),
    [filteredRows.length, pageSize],
  )
  const pagedRows = useMemo(
    () => filteredRows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    [filteredRows, pageNumber, pageSize],
  )

  function handleOpenCreate() {
    setEditingRow(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function handleOpenEdit(row) {
    setEditingRow(row)
    setForm({ ...EMPTY_FORM, fullName: row.fullName ?? '' })
    setFormOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updatedByUser = getProfile().email || 'unknown'
      if (editingRow) {
        await updateExampleUser(editingRow.publicId, { fullName: form.fullName, updatedByUser })
        setNotification({ id: crypto.randomUUID(), type: 'success', message: 'Usuario actualizado.' })
      } else {
        await registerExampleUser({ email: form.email, password: form.password, role: form.role })
        setNotification({ id: crypto.randomUUID(), type: 'success', message: 'Usuario creado.' })
      }
      setFormOpen(false)
      await loadData()
    } catch (err) {
      setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivate(row) {
    setActionForm({ comments: '' })
    setConfirmModal({
      open: true,
      title: 'Dar de baja usuario',
      message: `¿Confirmas dar de baja a "${row.fullName}"?`,
      confirmText: 'Dar de baja',
      variant: 'danger',
      requireComment: false,
      action: async () => {
        setBusyRowId(row.publicId)
        try {
          await disableExampleUser(row.publicId)
          setNotification({ id: crypto.randomUUID(), type: 'success', message: `"${row.fullName}" dado de baja.` })
          await loadData()
        } catch (err) {
          setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
        } finally {
          setBusyRowId(null)
        }
      },
    })
  }

  function handleReactivate(row) {
    setConfirmModal({
      open: true,
      title: 'Reactivar usuario',
      message: `¿Confirmas reactivar a "${row.fullName}"?`,
      confirmText: 'Reactivar',
      variant: 'success',
      requireComment: false,
      action: async () => {
        setBusyRowId(row.publicId)
        try {
          const updatedByUser = getProfile().email || 'unknown'
          await updateExampleUser(row.publicId, { isActive: true, updatedByUser })
          setNotification({ id: crypto.randomUUID(), type: 'success', message: `"${row.fullName}" reactivado.` })
          await loadData()
        } catch (err) {
          setNotification({ id: crypto.randomUUID(), type: 'error', message: extractApiErrorMessage(err) })
        } finally {
          setBusyRowId(null)
        }
      },
    })
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPageNumber(1)
  }

  return {
    rows, loading, error,
    filteredRows, pagedRows, totalPages,
    pageNumber, setPageNumber, pageSize,
    filters, setFilters, handleClearFilters,
    busyRowId,
    notification, setNotification,
    formOpen, setFormOpen, form, setForm, saving,
    handleOpenCreate, handleOpenEdit, handleSave,
    confirmModal, setConfirmModal, actionForm, setActionForm,
    handleDeactivate, handleReactivate,
    loadData, formatDate,
  }
}
