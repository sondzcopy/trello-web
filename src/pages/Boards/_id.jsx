import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, updateBoardDetailsAPI } from '~/apis'
import { genneratePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'
// import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '695e29a6f661842fa810691b'
    // call api
    fetchBoardDetailsAPI(boardId).then((board) => {
      // cần xử lý vấn đề kéo that vào column rống (vd 37.2 code hiện tại là ở 69)
      board.columns.forEach(column => {
        if (isEmpty(column.cards) ) {
          column.cards = [genneratePlaceholderCard(column)]
          column.cardOrderIds = [genneratePlaceholderCard(column)._id]
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
      columnToUpdate.cards.push(createCard)
      columnToUpdate.cardOrderIds.push(createCard._id)
    }
    setBoard(newBoard)
  }
  // Fuc này có nv gọi api và xử lý khi kéo thả Column xong xuôi
  const moveColumns = async(dndOrderedColumns) => {
    const dndOrderedColumnsId = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsId
    setBoard(newBoard)

    // Gọi Api update board
    await updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
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
      />
    </Container>
  )
}

export default Board
