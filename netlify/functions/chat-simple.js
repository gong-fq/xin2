// Netlify Functions - chat.js (简化版 - 非流式)
// 放置路径: /netlify/functions/chat.js
// 这个版本更稳定，不使用流式传输

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS请求（预检）
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. 获取API密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY 环境变量未设置');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API密钥未配置',
          message: '请在Netlify Dashboard的Environment Variables中添加 DEEPSEEK_API_KEY'
        })
      };
    }

    // 2. 解析请求
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '无效的JSON格式' })
      };
    }

    const { model, messages } = requestData;
    
    console.log('📨 收到请求:', {
      model: model || 'deepseek-chat',
      messageCount: messages?.length || 0,
      timestamp: new Date().toISOString()
    });

    // 3. 调用DeepSeek API（非流式）
    const fetch = (await import('node-fetch')).default;
    
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: messages,
        stream: false, // 关闭流式传输
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    // 4. 处理API响应
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ DeepSeek API错误:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      return {
        statusCode: apiResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'DeepSeek API请求失败',
          status: apiResponse.status,
          details: errorText
        })
      };
    }

    // 5. 返回成功响应
    const data = await apiResponse.json();
    console.log('✅ 请求成功');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ 函数执行错误:', {
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
};
