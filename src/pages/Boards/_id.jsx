import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { genneratePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'
// import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '695e29a6f661842fa810691b'
    // call api
    fetchBoardDetailsAPI(boardId).then((board) => {
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach(column => {
        // cần xử lý vấn đề kéo that vào column rống (vd 37.2 code hiện tại là ở 69)
        if (isEmpty(column.cards) ) {
          column.cards = [genneratePlaceholderCard(column)]
          column.cardOrderIds = [genneratePlaceholderCard(column)._id]
        }
        else {
        // Sxep các thứ tự các coumn luôn ở đây trước khi đưa Dl xuống các coponent vd71
          column.cards = mapOrder(column?.cards, column?.cardOrderIds, '_id')
        }
      })
      setBoard(board)
    })
  }, [])
  // Fuc này có nv gọi API tạo mới Column và làm lại dữ liệu State Board
  const createNewColumn = async(newColumnData) => {
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
    const newBoard = { ...board }
    newBoard.columns.push(createColumn)
    newBoard.columnOrderIds.push(createColumn._id)
    setBoard(newBoard)
  }

  // Fuc này có nv gọi API tạo mới Card và làm lại dữ liệu State Board
  const createNewCard = async(newCardData) => {
    const createCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    // cập nhật lại state board
    const newBoard = { ...board }
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
    setBoard(newBoard)
  }
  // Fuc này có nv gọi api và xử lý khi kéo thả Column xong xuôi
  /*** Khi di chuyển card trong cùng board:
   * Chỉ cần gọi API để cập nhật columnOrderIds của board chứa nó
  */
  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsId
    setBoard(newBoard)

    // Gọi Api update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }
  /*** Khi di chuyển card trong cùng column:
   * Chỉ cần gọi API để cập nhật cardOrderIds của column chứa nó
  */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)
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
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsId
    setBoard(newBoard)


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
        createNewColumn = {createNewColumn}
        createNewCard = {createNewCard}
        moveColumns = {moveColumns}
        moveCardInTheSameColumn ={moveCardInTheSameColumn}
        moveCardToDifferentColumn ={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
