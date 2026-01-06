import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { fetchBoardDetailsAPI } from '~/apis'
import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '695cb49da61ce800aa2335fb'
    // call api
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board)
    })
  }, [])
  return (
    <Container disableGutters maxWidth = {false}>
      <AppBar />
      <BoardBar board ={mockData.board}/>
      <BoardContent board ={mockData.board}/>
    </Container>
  )
}

export default Board
