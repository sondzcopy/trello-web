import React from 'react'
import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

function BoardContent({ board }) {
  const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')

  const { mode } = useColorScheme()
  return (
    <Box sx={{
      bgcolor: mode === 'dark' ? '#34495e' : '#1976d2',
      width: '100%',
      height: (theme) => theme.trello.boardContentHeight,
      p: '10px 0'
    }}>
      <ListColumns columns = {orderedColumns}/>
    </Box>
  )
}

export default BoardContent
