// Sử dụng trong component
import api from '../api/axiosConfig'

const fetchData = async () => {
  const response = await api.get('/products/')
  console.log(response.data)
}
// React — gọi thử
const res = await api.get('/test/')
console.log(res.data) // { message: "Kết nối thành công!" }