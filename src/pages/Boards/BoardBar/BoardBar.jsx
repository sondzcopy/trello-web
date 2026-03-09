import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { capitalizeFirstLetter } from '~/utils/formatter'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}
function BoardBar({ board }) {

  const { mode } = useColorScheme()
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: mode === 'dark' ? '#34495e' : '#1976d2',
      // borderBottom: '1px solid white',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description || ''}>
          <Chip
            sx = {MENU_STYLES}
            icon={<DashboardIcon />}
            label= {board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx = {MENU_STYLES}
          icon={<VpnLockIcon />}
          label= {capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx = {MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="App to Google Drive"
          clickable
        />
        <Chip
          sx = {MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx = {MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/** Xử lý mời User làm tv của boards */}
        <InviteBoardUser boardId = {board._id}/>
        { /** xử lý hiển thị ds thành viên group */}
        <BoardUserGroup boardUsers= { board?.FE_allUsers }/>
      </Box>
    </Box>
  )
}
export default BoardBar
