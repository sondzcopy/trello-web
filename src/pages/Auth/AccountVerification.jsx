import React, { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { verifyUserAPI } from '~/apis'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'

function AccountVerification() {
  // lấy giá trị email và tolen từ URL
  let [searchParams] = useSearchParams()
  // const email = searchParams.get('email')
  // const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])
  // console.log(email, token)
  // console.log(searchParams)

  // tạo 1 biến state để biết đc là đã verify tài khoản thành công hay chưa
  const [verified, setVerified] = useState(false)
  // Gọi api để verify tài khoản
  useEffect(() => {
    if (email && token) {
      verifyUserAPI( { email, token } ).then( () => {
        setVerified(true)
      })
    }
  }, [email, token] )
  // Nếu url có vấn đề và ko tồn tại 1 trong 2 gtri thì sẽ đá sang 404
  if (!email || !token) {
    return <Navigate to = "/404" />
  }
  // Nếu đang trong quá trình verify thì hiển thị loading
  if (verified) {
    return <PageLoadingSpinner caption='Đang xác thực tài khoản của bạn...' />
  }
  // Cuối cùng nếu ko gặp vấn đề gì + với verify thành công thì điều hướng về login cùng giá trị verifiedEmail

  return <Navigate to = {`/login?verifiedEmail=${email}`} />
}

export default AccountVerification