import './App.css'
import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import ThreeDRotation from '@mui/icons-material/ThreeDRotation'
import HomeIcon from '@mui/icons-material/Home'
import { pink } from '@mui/material/colors'
import Typography from '@mui/material/Typography'
import useColorScheme from '@mui/material/styles'
// import useMediaQuery from '@mui/material/useMediaQuery'

import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

function ModeSelect() {
  const { mode, setMode } = useColorScheme()
  const handleChange = (event) => {
    const selectedMode = event.target.value
    setMode(selectedMode)
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="label-select-dark-light-mode">Mode</InputLabel>
      <Select
        labelId="label-select-dark-light-mode"
        id="select-dark-light-mode"
        value={mode ?? 'system'}
        label="Mode"
        onChange={handleChange}
      >
        <MenuItem value="light">
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <LightModeIcon fontSize ="small"/> Light
          </div>
        </MenuItem>
        <MenuItem value="dark">
          <Box sx = {{display: 'flex', alignItems: 'center', gap: 1}}>
            <DarkModeOutlinedIcon fontSize ="small"/> Dark
          </Box>
        </MenuItem>
        <MenuItem value="system">
          <Box sx = {{display: 'flex', alignItems: 'center', gap: 2}}>
            <SettingsBrightnessIcon fontSize ="small"/> System
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  )
}
function ModeToggle() {
  const { mode, setMode } = useColorScheme()
  // const prefersDarkModel = useMediaQuery('(prefers-color-scheme: dark)')
  // const prefersLightModel = useMediaQuery('(prefers-color-scheme: light)')
  // console.log('prefersDarkModel: ', prefersDarkModel)
  // console.log('prefersLightModel: ', prefersLightModel)
  return (
    <Button
      variant="outlined"
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light')
      }}>
      {mode === 'light' ? 'Turn dark' : 'Turn light'}
    </Button>
  )
}
function App() {
  return (
    <>
      <ModeSelect />
      <hr />
      <ModeToggle />
      <hr />
      <div>Nguyễn Hồng Sơn</div>
      <Typography variant="body2" color="text.secondary">Text Typograply</Typography>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contined</Button>
      <Button variant="outlined">OutLined</Button>
      <br />
      <AccessAlarmIcon />
      <ThreeDRotation />
      <HomeIcon color="primary" />
      <HomeIcon color="secondary" />
      <HomeIcon color="success" />
      <HomeIcon color="action" />
      <HomeIcon color="disabled" />
      <HomeIcon sx={{ color: pink[500] }} />
    </>
  )
}

export default App