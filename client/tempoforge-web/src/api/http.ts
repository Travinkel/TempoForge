import axios from 'axios'
import { API_BASE } from '../config'

const http = axios.create({
  baseURL: API_BASE,
})

http.defaults.headers.common['Content-Type'] = 'application/json'

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('API request failed', error)
    }

    return Promise.reject(error)
  },
)

export default http
