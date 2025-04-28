// api/buttons.js
import { Redis } from '@upstash/redis'

// 初始化 Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 数据验证函数
const validateButton = (btn) => {
  try {
    const url = new URL(btn.url)
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      typeof btn.name === 'string' &&
      btn.name.trim().length >= 1 &&
      btn.name.trim().length <= 30
    )
  } catch (error) {
    return false
  }
}

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        // 从 Redis 获取数据
        const data = await redis.get('buttons')
        return res.status(200).json(data || [])
      }

      case 'POST': {
        // 验证请求格式
        if (!Array.isArray(req.body)) {
          return res.status(400).json({ 
            error: '无效数据格式，需要数组格式'
          })
        }

        // 验证每个按钮项
        const isValid = req.body.every(validateButton)
        if (!isValid) {
          return res.status(422).json({
            error: '数据验证失败',
            details: [
              '名称需为1-30个字符',
              'URL必须为有效的HTTP/HTTPS地址'
            ]
          })
        }

        // 存储到 Redis
        await redis.set('buttons', req.body)
        return res.status(200).json({ 
          success: true,
          message: '配置保存成功'
        })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: '方法不允许' })
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API错误:`, error)
    
    // 生产环境隐藏敏感信息
    const errorResponse = {
      error: '服务器内部错误',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack
      })
    }
    
    return res.status(500).json(errorResponse)
  }
}