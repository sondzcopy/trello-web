import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
// import { mockData } from '~/apis/mock-data'
import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { fetchBoardDetailsAPI, updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

function Board() {
  const dispatch = useDispatch()
  // ko dùng state của component nữa mà dùng state của redux.
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)

  useEffect(() => {
    const boardId = '695e29a6f661842fa810691b'
    // call api
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch])

  // Fuc này có nv gọi api và xử lý khi kéo thả Column xong xuôi
  /*** Khi di chuyển card trong cùng board:
   * Chỉ cần gọi API để cập nhật columnOrderIds của board chứa nó
  */
  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsId
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi Api update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }
  /*** Khi di chuyển card trong cùng column:
   * Chỉ cần gọi API để cập nhật cardOrderIds của column chứa nó
  */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard))
    // console.log( columnId)
    // Gọi Api update board
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }
  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOderIds của Column ban đầu chứa nó (xóa _id của card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column mới (thêm _id của card vào mảng )
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   *  => Làm 1 API support riêng
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
    // tương tự hàm moveColumns
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsId
    dispatch(updateCurrentActiveBoard(newBoard))


    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // xl vấn đề khi kéo card cuối cùng ra khỏi column,
    // Column rỗng sẽ có playayhodel card,
    // cần xóa nó đi trước khi gửi cho BE
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    // gọi API xl phía BE
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }
  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth = {false}>
      <AppBar />
      <BoardBar board ={board}/>
      <BoardContent
        board ={board}

        moveColumns = {moveColumns}
        moveCardInTheSameColumn ={moveCardInTheSameColumn}
        moveCardToDifferentColumn ={moveCardToDifferentColumn}

      />
    </Container>
  )
}

export default Board
