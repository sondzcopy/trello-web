import { createContext, useContext, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

const ConfirmContext = createContext()

export const useConfirm = () => useContext(ConfirmContext)

export default function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState({})
  const [resolveRef, setResolveRef] = useState(null)

  const confirm = (opts) => {
    return new Promise((resolve) => {
      setOptions(opts)
      setResolveRef(() => resolve)
      setOpen(true)
    })
  }

  const handleClose = (result) => {
    setOpen(false)
    resolveRef?.(result)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Dialog open={open} onClose={() => handleClose(false)}>
        <DialogTitle>{options.title || 'Confirm'}</DialogTitle>
        <DialogContent>
          {options.description || 'Bạn có chắc không?'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>
            {options.cancelText || 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleClose(true)}
          >
            {options.confirmText || 'OK'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}