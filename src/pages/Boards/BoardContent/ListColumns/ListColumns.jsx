import React from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { useState } from 'react'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

function ListColumns({ columns, createNewColumn, createNewCard, deleteColumnDetails }) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => { setOpenNewColumnForm(!openNewColumnForm)}
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Column title is required')
      return
    }
    // tạo dữ liệu column để gọi api
    const newColumnData = {
      title: newColumnTitle
    }
    /**
     * Gọi lên props function createNewColumn nằm ở component cha cao nhất (board/_id.jsx)
     * Lưu ý: về sau ở phần Advance sẽ đưa dữ liệu Board ra ngoài Redux Global Store,
     * Thì lúc này chúng ta có thể gọi luôn API ở đây xong thay vì phải lần lượt gọi ngược lên những
     * component cha phía trên. (đối với cpn con nằm càn sâu thì càng khổ)
     * Với vệ sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
     * **/
    await createNewColumn(newColumnData)
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }
  //   The <SortableContext> component requires that you pass it the sorted array of the unique identifiers
  // associated to each sortable item via the items prop.
  //  This array should look like ["1", "2", "3"], not [{id: "1"}, {id: "2}, {id: "3}].

  // All you have to do is map your items array to an array of strings that represent the unique identifiers for each item:
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx= {{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {columns?.map( column => <Column
          key ={column._id}
          column ={column}
          createNewCard ={createNewCard}
          deleteColumnDetails ={deleteColumnDetails}
        />)}
        {!openNewColumnForm
          ? <Box onClick={toggleOpenNewColumnForm} sx ={{
            minWidth: '200px',
            maxWidth: '200px',
            mx: 2,
            borderRadius: '5px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon ={ <NoteAddIcon />}
              sx = {{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                pi: 1
              }}
            >Add new column</Button>
          </Box>
          : <Box sx = {{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }} >
            <TextField
              label="Enter column title ..."
              type="text"
              size='small'
              variant="outlined"
              autoFocus
              value = {newColumnTitle}
              onChange= {(e) => setNewColumnTitle(e.target.value)}
              sx = {{
                minWidth: '120px',
                maxWidth: '180px',
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx = {{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={addNewColumn}
                variant="contained" color="success" size="small"
                sx ={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgColor: (theme) => theme.palette.success.main }
                }}
              >Add Column</Button>
              < CloseIcon
                fontSize='small'
                sx ={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { color: (theme) => theme.palette.warning.light }
                }}
                onClick = {toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns