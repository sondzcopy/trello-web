import Box from '@mui/material/Box'
import { useColorScheme } from '@mui/material/styles'
function BoardContent() {
  const { mode } = useColorScheme()
  return (
    <Box sx={{
      bgcolor: mode === 'dark' ? '#34495e' : '#1976d2',
      width: '100%',
      height: (theme) => `calc(100vh - ${theme.trello.appBarHeight} - ${theme.trello.boardBarHeight})`,
      display: 'flex',
      alignItems: 'center'
    }}>
        Board Content
    </Box>
  )
}

export default BoardContent
