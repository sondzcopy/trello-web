import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizaAxiosInstance from '~/utils/authorizaAxios'
import { API_ROOT } from '~/utils/constants'

// khởi tạo giá trị State của slice trong redux
const initialState = {
  currentUser: null
}
// Các hành động gọi api (bất đồng bộ ) và truy cập dữ liệu vào redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizaAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // lưu ý axios sẽ trả kết quả về property của nó là data
    return response.data
  }
)
// Khởi tạo một cái Slice trong kho lưu trữ - redux store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // nơi xl dữ liệu đồng bộ
  reducers: {},
  // Extra Reducers: nơi xl dữ liệu bất đồng bộ
  // và nó nhận là arrow function với tham số là builder, và builder này sẽ có các method để xử lý các action bất đồng bộ được tạo ra bởi createAsyncThunk ở trên
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload ở đây chính là cái reponsse.data trả về từ API ở trong createAsyncThunk ở trên
      const user = action.payload
      state.currentUser = user
    })
  }
})

// Action creators are generated for each case reducer function
// Action: là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu trong redux (chạy đồng bộ)
// để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái action này đc thằng redux tạo tự dộng trên reducer.
// export const {} = userSlice.actions

// selector:  là nơi dành cho các component bên dưới gọi bằng  Hook useSelector() để lấy dữ liệu từ kho reduxra ngoài store để sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}
export const userReducer = userSlice.reducer