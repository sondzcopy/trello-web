import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import Board from '~/pages/Boards/_id'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

/*
  Giải pháp Clear code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới truy cập được
  Sử dụng <Outline /> của react-route-dom để hiển thị các child route xem các sử dụng trong App() bên dưới
  tên + điều kiện kiểm tra
*/
const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <Routes>

      {/* Redirect Route */}
      <Route path='/' element={
        <Navigate to='/boards/695e29a6f661842fa810691b' replace = {true} />
      } />
      {/* Protected Routed cta muốn là phải login thì mới vào được route */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        <Route path='/boards/:boardId' element={<Board />} />
      </Route>
      {/* Authentication */}
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />
      {/* 404 Not Fouce */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
export default App
