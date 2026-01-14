// Netlify Functions - chat.js
// 放置路径: /netlify/functions/chat.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 从环境变量获取API密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY未配置');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API密钥未配置',
          message: '请在Netlify环境变量中设置DEEPSEEK_API_KEY'
        })
      };
    }

    // 解析请求体
    const { model, messages, stream } = JSON.parse(event.body);

    console.log('收到请求:', { model, messageCount: messages.length, stream });

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: messages,
        stream: stream || false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'DeepSeek API请求失败',
          details: errorText
        })
      };
    }

    // 如果是流式响应
    if (stream) {
      // Netlify Functions支持流式响应
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        body: response.body // 直接传递流
      };
    } else {
      // 非流式响应
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

  } catch (error) {
    console.error('函数执行错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '服务器错误',
        message: error.message
      })
    };
  }
};
