import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatter'
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
  },
)

// Interceptors Request: can thiệp vào giữa cái Reponse API
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
