import React from 'react'
import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import Button from '@mui/material/Button'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import theme from '~/theme'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useState } from 'react'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import { cloneDeep } from 'lodash'
import { updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

import { toast } from 'react-toastify'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'

function Column({ column }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles = {
    // touchAction: 'none',
    transform: CSS.Translate.toString(transform),
    transition,
    // chiều cao luôn 100% nếu ko sẽ lỗi  lúc kéo column ngắn qua 1 column dài
    // lỗi rất khó chịu (trungquansev video 32) lúc này kết hợp với {...listeners} ở Box  chứ ko phải div ngoài cùng trnahs
    // trường hợp kéo trúng vùng xanh
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }
  //
  const orderedCard = column?.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => { setOpenNewCardForm(!openNewCardForm)}
  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {

    if (!newCardTitle) {
      // console.error('Card title is required')
      return
    }
    // tạo dữ liệu card để gọi api
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }
    // Fuc này có nv gọi API tạo mới Card và làm lại dữ liệu State Board
    const createCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    // cập nhật lại state board
    // Tưởng tự hàm createNewColumn ở trên.
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === createCard.columnId)
    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlayceholderCard)) {
        // column tỗng bản chất là nó đang có 1 cái playhoderCard
        columnToUpdate.cards = [createCard]
        columnToUpdate.cardOrderIds = [createCard._id]
      } else {
        // ngược lại có data thì putvaof cuối mảng
        columnToUpdate.cards.push(createCard)
        columnToUpdate.cardOrderIds.push(createCard._id)
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard))
    // Call API to add new Card
    // console.log('New Card added:', newCardTitle)
    //  Đóng trạng thái thêm Card mới & Clear Input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  // xử lý xóa 1 Column và Cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Delete Column',
      description: 'This action will permanently delete your column and Cards! Are you sure?',
      confirmationTexxt: 'Confirm',
      cancellationText: 'Cancel',
      buttonOrder: ['confirm', 'cancel']
    }).then(() => {
    // xử lý chuẩn state board
    // tương tự hàm moveColumns
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      dispatch(updateCurrentActiveBoard(newBoard))
      // gọi API
      deleteColumnDetailsAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
      })
    }).catch(() => {})

  }
  const onUpdateColumnTitle = (newTitle) => {
    // gọi API updatr Column và xử lý dl board trong redux
    updateColumnDetailsAPI(column._id, { title: newTitle })
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
    if (columnToUpdate) columnToUpdate.title = newTitle
    dispatch(updateCurrentActiveBoard(newBoard))
  }
  const { mode } = useColorScheme()
  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes} >
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: mode === 'dark' ? '#333643' : '#ebecf0',
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
        }}
      >
        {/* {Box column Header} */}
        <Box
          sx={{
            height: theme.trello.columnHeaderHeight,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <ToggleFocusInput
            value = {column?.title}
            onChangedValue = {onUpdateColumnTitle}
            data-no-dnd = "true"
          />
          <Box>
            <Tooltip title='more-option'>
              <KeyboardArrowDownIcon
                sx={{ color: 'text.primary', center: 'ponter' }}
                id='basic-column-dropdown'
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id='basic-menu-workspaces'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                list: {
                  'aria-labelledby': 'basic-button'
                }
              }}
            >
              <MenuItem
                onClick={toggleOpenNewCardForm}
                sx = {{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon':{ color: 'success.light' }
                  }
                }}>
                <ListItemIcon>
                  <AddCardIcon fontSize='small' className='add-card-icon' />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize='small' />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize='small' />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize='small' />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleDeleteColumn}
                sx = {{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon':{ color: 'warning.dark' }
                  }
                }}>
                <ListItemIcon>
                  <DeleteForeverIcon fontSize='small' className='delete-forever-icon' />
                </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize='small' />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* {Box list card} */}
        <ListCards cards = { orderedCard }/>
        {/* {Box column footer} */}
        <Box
          sx={{
            height: theme.trello.columnFooterHeight,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          { !openNewCardForm
            ? <Box sx = {{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button startIcon={<AddCardIcon />} onClick={toggleOpenNewCardForm}>App new card</Button>
              <Tooltip title='Drag to move'>
                <DragHandleIcon sxx={{ cursor: 'pointer' }} />
              </Tooltip>
            </Box>
            : <Box sx ={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label="Enter card title ..."
                type="text"
                size='small'
                variant="outlined"
                autoFocus
                data-no-dnd = "true"
                value = {newCardTitle}
                onChange= {(e) => setNewCardTitle(e.target.value)}
                sx = {{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': {
                    color:  (theme) => theme.palette.primary.main
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx = {{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className="interceptor-loading"
                  onClick={addNewCard}
                  variant="contained" color="success" size="small"
                  sx ={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgColor: (theme) => theme.palette.success.main }
                  }}
                >Add</Button>
                < CloseIcon
                  fontSize='small'
                  sx ={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer'
                  }}
                  onClick = {toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column
