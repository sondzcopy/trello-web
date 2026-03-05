import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatter'
import { refreshTokenAPI } from '~/apis/index'
import { logoutUserApi } from '~/redux/user/userSlice'
/**
 * Không thể import { store } trong reddux theo cách thông thường ở đây
 * Giải pháp: Inject store: là kĩ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi component
 * Hiểu đơn giản: khi ứng dụng chạy lên từ main.jsx cta gọi hàm InjectStore ngay lập tức để gán biến mainStore vào axiosReduxStore cục bộ trong file này
 */
let axiosReduxStore

export const injectStore = mainstore => {
  axiosReduxStore = mainstore
}
// Khởi tạo đối tượng Axios mục đích để custom và cấu hình chung cho dự án
let authorizaAxiosInstance = axios.create()
// thời gian chờ tối đa của 1 request: để 18p
authorizaAxiosInstance.defaults.timeout = 18 * 60 * 1000
// withCredentials: Sẽ cho phép Axios tự động gửi cookietrong mỗi reqest lê BE
// phục vụ việc chúng ta sễ lưu JWT token (refresh && access) vào trong httpOnly Cookie của trình duyệt
authorizaAxiosInstance.defaults.withCredentials = true

// Interceptors Request: can thiệp vào giữa cái request API
authorizaAxiosInstance.interceptors.request.use(
  (config) => {
    // Kĩ thuật chặn spam click (xem kỹ mô tả ở file formatter.js chứa func)
    interceptorLoadingElements(true)
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)
// Khởi tạo 1 cái promesse cho việc gọi api refresh_token
// Mục đích tạp 1 cái Promisse này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trcs đó
let refreshTokenPromise = null


// Interceptors Reponse: can thiệp vào giữa cái Reponse API
// Add a response interceptor
authorizaAxiosInstance.interceptors.response.use(
  (response) => {
    // Kĩ thuật chặn spam click (xem kỹ mô tả ở file formatter.js chứa func)
    interceptorLoadingElements(false)

    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    /* Mọi mã http status code nằm ngoài khoảng 2xx đều sẽ rơi vào đây */
    // Kĩ thuật chặn spam click (xem kỹ mô tả ở file formatter.js chứa func)


    interceptorLoadingElements(false)

    /** Quan trongj: Xử lý Refresh Token tự động */
    // TH1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn
    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserApi(false))
    }
    // TH2: Nếu như nhận mã 410 từ BE, thì gọi api refresh Token để làm mới lại accessToken
    // Đầu tiên lấy được các request api đang bị lỗi thông qua error.config
    const originalRequests = error.config
    console.log('originalRequests', originalRequests)
    if (error.response?.status === 410 && !originalRequests._retry) {
      // Gán thêm 1 gtri _retry luôn = true trong khoảng thời gian chờ, đảm bảo việc refesh này luôn gọi 1 lần trong thời điểm
      originalRequests._retry = true
      // Ktr nếu chưa có cái refreshTokenPormise thì thực hiện gọi refresh_token đồng thời gán vào 1 cái refreshTokenPormise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then(data => {
            // đồng thời cái accessToken đã nằm trong httpOnly cookie này
            return data?.accessToken
          })
          .catch((_error) => {
            // Nếu nhận bất kì lỗi nào từ refresh token thì cứ logout
            axiosReduxStore.dispatch(logoutUserApi(false))
            return Promise.reject(_error)
          })
          .finally(() => {
            // Dù api thành công hay là lỗi thì cta cũng gán lại như ban đầu
            refreshTokenPromise = null
          })
      }
      // Cần return Th refreshTokenPromise chạy thành công và xử thêm ở đây:
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then(accessToken => {
        /**
         * B1 đối với dự án cần lưu accessToken vào localStorage hoặc đâu đó thì sẽ viết code xử lý ở đây
         * Hiện tại ở đây 0 cần b1 vì cta đã đưa accessToken vào cookie (xl từ BE) sau khi api gọi refresh_token thành công
         */

        /**B2: Qtr: Return lại axios Instanse của chúng ta kết hớp với originalRequest để gọi lại n api ban đầu bị lỗi */
        return authorizaAxiosInstance(originalRequests)
      })
    }
    /* Xử lý tập trung phần hiển thị mọi thông báo lỗi API trả về ở đây
        Clg error ra là sẽ thấy cấu trúc data dẫn tới messege lỗi như dưới đây */
    console.log(error)
    let errorMessage = error?.message || 'Lỗi không xác định'
    if (error.response?.data?.message) {
      errorMessage = error.response?.data?.message
    }
    // Dùng Toastify để hiển thị bất kỳ mã lỗi nào - mã 410
    if (error.response?.status !== 410) {
      toast.error(errorMessage)
    }
    return Promise.reject(error)
  }
)

export default authorizaAxiosInstance
