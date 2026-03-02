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
import { createNewColumnAPI } from '~/apis'
import { genneratePlaceholderCard } from '~/utils/formatter'
import { cloneDeep } from 'lodash'
import { updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

function ListColumns({ columns }) {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

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

    // Fuc này có nv gọi API tạo mới Column và làm lại dữ liệu State Board
    const createColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    createColumn.cards = [genneratePlaceholderCard(createColumn)]
    createColumn.cardOrderIds = [genneratePlaceholderCard(createColumn)._id]

    // cập nhật lại state board
    /**
     * Phía Fe chúng ta tự làm lại đúng state data board thay vì phải gọi lại API fetchBoardDetailsApi
     * Lưu ý cahcs làm này phụ thuộc vào tùy chọn và đặc thù của dự án, có nơi thì Be sẽ hỗ trợ
     * trẳ về luôn toàn bộ Board dù đây có là api tạo Column hay Card đi chăng nữa  **/
    /** Vi phạm luật của Redux
     * Đoạn này dính phải nối Object is not extensible khi chúng ta cố gắng push trực tiếp createColumn vào mảng column của board,
     * nguyên nhân là do dữ liệu board đang lấy từ redux store,
     *  mà dữ liệu trong redux store là bất biến (immutable)
     * nên chúng ta không thể thay đổi trực tiếp nó được,
     * mà phải tạo ra một bản sao mới của board rồi mới thay đổi được,
    */
    const newBoard = cloneDeep(board) // deep copy - copy sâu toàn bộ
    newBoard.columns.push(createColumn) // push và chỉnh sửa bên ngoài reducer
    newBoard.columnOrderIds.push(createColumn._id)
    dispatch(updateCurrentActiveBoard(newBoard))

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
                className="interceptor-loading"
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