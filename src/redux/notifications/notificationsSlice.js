import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizaAxiosInstance from '~/utils/authorizaAxios'
import { API_ROOT } from '~/utils/constants'

// Khởi tạo giá trị của một Slice trong redux
const initialState = {
  currentNotifications: null
}

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizaAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    // Lưu ý axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ status, invitationId }) => {
    const response = await authorizaAxiosInstance.put(
      `${API_ROOT}/v1/invitations/board/${invitationId}`,
      { status }
    )
    return response.data
  }
)

// Khởi tạo một slice trong kho lưu trữ - redux store
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,

  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },

    updateCurrentNotifications: (state, action) => {
      state.currentNotifications = action.payload
    },

    addNotification: (state, action) => {
      const incomingInvitation = action.payload
      // unshift là thêm phần tử vào đầu mảng, ngược lại với push
      state.currentNotifications.unshift(incomingInvitation)
    }
  },

  // ExtraReducers: Xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      let incomingInvitations = action.payload
      // Đoạn này đảo ngược lại mảng invitations nhận được, đơn giản là để hiển thị cái mới nhất lên đầu
      state.currentNotifications = Array.isArray(incomingInvitations)
        ? incomingInvitations.reverse()
        : []
    })

    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
      const incomingInvitation = action.payload

      // Cập nhật lại dữ liệu boardInvitation (bên trong nó sẽ có status mới sau khi update)
      const getInvitation = state.currentNotifications.find(
        i => i._id === incomingInvitation._id
      )

      if (getInvitation) {
        getInvitation.boardInvitation = incomingInvitation.boardInvitation
      }
    })
  }
})

// Action creators
export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification
} = notificationsSlice.actions

// Selectors
export const selectCurrentNotifications = state => {
  return state.notifications.currentNotifications
}


export const notificationsReducer = notificationsSlice.reducer
