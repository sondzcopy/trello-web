import authorizaAxiosInstance from '~/utils/authorizaAxios'
import { API_ROOT } from '~/utils/constants'

// Board
// đã move vào redux
// export const fetchBoardDetailsAPI = async (boardId) => {
//   const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
//   // lưu ý axios sẽ trả kết quả về property của nó là data
//   return response.data
// }

// update Board orderIds
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizaAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)

  return response.data
}
export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizaAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)

  return response.data
}


// Columns
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizaAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)

  return response.data
}
export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizaAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)

  return response.data
}
export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizaAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)

  return response.data
}
// Cards
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizaAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData )

  return response.data
}