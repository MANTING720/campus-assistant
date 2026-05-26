// API配置文件
export const API_CONFIG = {
  WEATHER_KEY: 'e8299896ab69420cb482da774dc77c0c', // 请替换为实际的API Key
  WEATHER_BASE_URL: 'https://n32mtftj89.re.qweatherapi.com/v7',
  GEO_BASE_URL: 'https://n32mtftj89.re.qweatherapi.com/geo/v2'  // 👈 添加地理编码 API
}

// 封装uni.request
export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 天气API
export const weatherAPI = {
  // 获取实时天气
  getNowWeather(location) {
    return request({
      url: `${API_CONFIG.WEATHER_BASE_URL}/weather/now`,
      data: {
        location: location,
        key: API_CONFIG.WEATHER_KEY
      }
    })
  },
  
  // 获取7天预报
  get7dWeather(location) {
    return request({
      url: `${API_CONFIG.WEATHER_BASE_URL}/weather/7d`,
      data: {
        location: location,
        key: API_CONFIG.WEATHER_KEY
      }
    })
  },
  
  // 获取生活指数
  getIndices(location) {
    return request({
      url: `${API_CONFIG.WEATHER_BASE_URL}/indices/1d`,
      data: {
        location: location,
        key: API_CONFIG.WEATHER_KEY,
        type: '0'
      }
    })
  }
}

// 获取城市ID（通过经纬度）
export const getCityId = (lon, lat) => {
  return request({
     url: `${API_CONFIG.GEO_BASE_URL}/city/lookup`,
    data: {
      location: `${lon},${lat}`,
      key: API_CONFIG.WEATHER_KEY
    }
  })
}