// netlify/functions/chat.js
// DeepSeek API 代理函数

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 设置 CORS 头，允许前端访问
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // 解析请求体
    const { messages, max_tokens = 800, temperature = 0.7 } = JSON.parse(event.body);

    // 验证必需参数
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request: messages array required' })
      };
    }

    // 检查 API 密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not set in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    console.log(`Processing request with ${messages.length} messages`);

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens,
        temperature,
        stream: false  // 不使用流式响应
      })
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `DeepSeek API error: ${response.status}`,
          details: errorText 
        })
      };
    }

    // 解析响应数据
    const data = await response.json();
    
    // 验证响应格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format from DeepSeek API');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid response format from API' })
      };
    }

    console.log('Request processed successfully');

    // 返回成功响应
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    // 捕获所有异常
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
