import { Routes, Route, Navigate} from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import Board from '~/pages/Boards/_id'
function App() {

  return (
    <Routes>

      {/* Redirect Route */}
      <Route path='/' element={
        <Navigate to='/boards/695e29a6f661842fa810691b' replace = {true} />
      } />
      {/* Board Detail */}
      <Route path='/boards/:boardId' element={<Board />} />

      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      {/* 404 Not Fouce */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
