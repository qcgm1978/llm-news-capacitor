import axios from 'axios';

// 尝试导入配置文件
let NEWS_API_KEY = null;
let NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// 使用try-catch处理配置文件导入
try {
  const config = require('./config').default;
  NEWS_API_KEY = config?.NEWS_API_KEY;
} catch (error) {
  console.log('配置文件不存在，将使用模拟数据或提示用户输入API key');
  NEWS_API_KEY = null;
}

// 服务提供商枚举
const ServiceProvider = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  META: 'meta',
  MICROSOFT: 'microsoft',
  BAIDU: 'baidu',
  ALIBABA: 'alibaba',
  XUNFEI: 'xunfei',
  DEEPSEEK: 'deepseek',
  GEMINI: 'gemini',
  GROQ: 'groq',
  DOUBAO: 'doubao',
  OPENROUTER: 'openrouter',
  MOONSHOT: 'moonshot',
  IFLOW: 'iflow'
};

// 获取服务商官方URL
const getProviderOfficialUrl = (provider) => {
  switch (provider) {
    case ServiceProvider.XUNFEI:
      return 'https://console.xfyun.cn/app/myapp';
    case ServiceProvider.DEEPSEEK:
      return 'https://platform.deepseek.com/';
    case ServiceProvider.GEMINI:
      return 'https://makersuite.google.com/app/apikey';
    case ServiceProvider.GROQ:
      return 'https://console.groq.com/keys';
    case ServiceProvider.OPENAI:
      return 'https://openai.com/zh-Hans-CN/news/';
    case ServiceProvider.DOUBAO:
      return 'https://console.volcengine.com/vei/aigateway/overview?region=cn-beijing';
    case ServiceProvider.OPENROUTER:
      return 'https://openrouter.ai/settings/keys';
    case ServiceProvider.MOONSHOT:
      return 'https://platform.moonshot.cn/console/api-keys';
    case ServiceProvider.IFLOW:
      return 'https://platform.iflow.cn/profile?tab=apiKey';
    // 为现有公司添加官方URL
    case ServiceProvider.ANTHROPIC:
      return 'https://console.anthropic.com/';
    case ServiceProvider.GOOGLE:
      return 'https://console.cloud.google.com/';
    case ServiceProvider.META:
      return 'https://developers.facebook.com/';
    case ServiceProvider.MICROSOFT:
      return 'https://portal.azure.com/';
    case ServiceProvider.BAIDU:
      return 'https://ai.baidu.com/tech/';
    case ServiceProvider.ALIBABA:
      return 'https://dashscope.aliyun.com/';
    default:
      return '#';
  }
};

// LLM公司列表
const llmCompanies = [
  { id: 'openai', name: 'OpenAI', color: '#10a37f', keywords: 'OpenAI GPT ChatGPT', officialUrl: getProviderOfficialUrl(ServiceProvider.OPENAI), twitterHandle: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic', color: '#FF5700', keywords: 'Anthropic Claude AI', officialUrl: getProviderOfficialUrl(ServiceProvider.ANTHROPIC), twitterHandle: 'AnthropicAI' },
  { id: 'google', name: 'Google DeepMind', color: '#4285F4', keywords: 'Google DeepMind Gemini AI', officialUrl: getProviderOfficialUrl(ServiceProvider.GOOGLE), twitterHandle: 'GoogleDeepMind' },
  { id: 'meta', name: 'Meta AI', color: '#1877F2', keywords: 'Meta AI Llama Facebook', officialUrl: getProviderOfficialUrl(ServiceProvider.META), twitterHandle: 'MetaAI' },
  { id: 'microsoft', name: 'Microsoft', color: '#0078D4', keywords: 'Microsoft Copilot Azure OpenAI', officialUrl: getProviderOfficialUrl(ServiceProvider.MICROSOFT), twitterHandle: 'Microsoft' },
  { id: 'baidu', name: '百度', color: '#3B82F6', keywords: '百度 文心一言ERNIE', officialUrl: getProviderOfficialUrl(ServiceProvider.BAIDU), twitterHandle: 'Baidu_Inc' },
  { id: 'alibaba', name: '阿里巴巴', color: '#FF6A00', keywords: '阿里巴巴 通义千问', officialUrl: getProviderOfficialUrl(ServiceProvider.ALIBABA), twitterHandle: 'alibaba' },
];

// Twitter API 配置
let TWITTER_API_KEY = null;
let TWITTER_API_SECRET = null;
let TWITTER_ACCESS_TOKEN = null;
let TWITTER_ACCESS_TOKEN_SECRET = null;
const TWITTER_API_BASE_URL = 'https://api.twitter.com/2';

// 尝试从配置文件导入Twitter API凭证
try {
  const config = require('./config').default;
  TWITTER_API_KEY = config?.TWITTER_API_KEY;
  TWITTER_API_SECRET = config?.TWITTER_API_SECRET;
  TWITTER_ACCESS_TOKEN = config?.TWITTER_ACCESS_TOKEN;
  TWITTER_ACCESS_TOKEN_SECRET = config?.TWITTER_ACCESS_TOKEN_SECRET;
} catch (error) {
  console.log('Twitter API配置不存在');
}

// 新闻来源类型
export const NewsSourceType = {
  API: 'api',          // 使用NewsAPI获取新闻
  OFFICIAL: 'official', // 使用官方来源
  TWITTER: 'twitter'   // 使用Twitter API获取新闻
};

// 配置新闻API
// NEWS_API_KEY 已经在文件顶部定义
// NEWS_API_BASE_URL 已经在文件顶部定义

// 转换API响应数据为应用所需格式
const transformNewsData = (apiData, company) => {
  if (!apiData.articles || !Array.isArray(apiData.articles)) {
    return [];
  }
  
  return apiData.articles
    .filter(article => article.title && article.description)
    .map((article, index) => ({
      id: `${company.id}-${Date.now()}-${index}`,
      title: article.title || '无标题',
      content: article.description || article.content || '暂无内容',
      date: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      image: article.urlToImage || null,
      url: article.url,
      source: article.source?.name || '未知来源',
      companyName: company.name,
      companyColor: company.color,
    }));
};

// 获取公司列表
export const getLLMCompanies = () => {
  return Promise.resolve(llmCompanies);
};

// 保存Twitter API凭证
export const saveTwitterApiCredentials = (credentials) => {
  try {
    // 保存到localStorage
    localStorage.setItem('twitter_api_key', credentials.apiKey);
    localStorage.setItem('twitter_api_secret', credentials.apiSecret);
    localStorage.setItem('twitter_access_token', credentials.accessToken);
    localStorage.setItem('twitter_access_token_secret', credentials.accessTokenSecret);
    
    // 更新全局变量
    TWITTER_API_KEY = credentials.apiKey;
    TWITTER_API_SECRET = credentials.apiSecret;
    TWITTER_ACCESS_TOKEN = credentials.accessToken;
    TWITTER_ACCESS_TOKEN_SECRET = credentials.accessTokenSecret;
    
    return true;
  } catch (error) {
    console.error('保存Twitter API凭证失败:', error);
    return false;
  }
};

// 从本地存储加载Twitter API凭证
const loadTwitterApiCredentials = () => {
  try {
    const apiKey = localStorage.getItem('twitter_api_key');
    const apiSecret = localStorage.getItem('twitter_api_secret');
    const accessToken = localStorage.getItem('twitter_access_token');
    const accessTokenSecret = localStorage.getItem('twitter_access_token_secret');
    
    if (apiKey && apiSecret && accessToken && accessTokenSecret) {
      TWITTER_API_KEY = apiKey;
      TWITTER_API_SECRET = apiSecret;
      TWITTER_ACCESS_TOKEN = accessToken;
      TWITTER_ACCESS_TOKEN_SECRET = accessTokenSecret;
      return true;
    }
  } catch (error) {
    console.error('加载Twitter API凭证失败:', error);
  }
  return false;
};

// 显示Twitter API凭证输入对话框
export const showTwitterApiDialog = () => {
  return new Promise((resolve) => {
    // 检查是否已经从本地存储加载了凭证
    if (loadTwitterApiCredentials()) {
      resolve({
        apiKey: TWITTER_API_KEY,
        apiSecret: TWITTER_API_SECRET,
        accessToken: TWITTER_ACCESS_TOKEN,
        accessTokenSecret: TWITTER_ACCESS_TOKEN_SECRET
      });
      return;
    }
    
    // 创建对话框元素
    const dialogContainer = document.createElement('div');
    dialogContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      position: relative;
    `;
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f5f5;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '请输入Twitter API凭证';
    title.style.cssText = 'margin-top: 0; color: #333; font-size: 18px;';
    
    const description = document.createElement('p');
    description.textContent = '需要Twitter API凭证才能获取Twitter上的公司动态。没有凭证？请访问：';
    description.style.cssText = 'color: #666; margin-bottom: 12px;';
    
    const link = document.createElement('a');
    link.href = 'https://developer.twitter.com/en/docs/twitter-api';
    link.textContent = 'https://developer.twitter.com/en/docs/twitter-api';
    link.target = '_blank';
    link.style.cssText = 'color: #1a73e8; text-decoration: none; display: block; margin-bottom: 16px;';
    
    // 创建输入字段容器
    const createInputField = (labelText, placeholder, type = 'text') => {
      const container = document.createElement('div');
      container.style.cssText = 'margin-bottom: 16px;';
      
      const label = document.createElement('label');
      label.textContent = labelText;
      label.style.cssText = 'display: block; margin-bottom: 6px; font-size: 14px; color: #555;';
      
      const input = document.createElement('input');
      input.type = type;
      input.placeholder = placeholder;
      input.style.cssText = `
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      `;
      
      container.appendChild(label);
      container.appendChild(input);
      return { container, input };
    };
    
    const { container: apiKeyContainer, input: apiKeyInput } = createInputField('API Key', '输入您的Twitter API Key');
    const { container: apiSecretContainer, input: apiSecretInput } = createInputField('API Secret', '输入您的Twitter API Secret');
    const { container: accessTokenContainer, input: accessTokenInput } = createInputField('Access Token', '输入您的Access Token');
    const { container: accessTokenSecretContainer, input: accessTokenSecretInput } = createInputField('Access Token Secret', '输入您的Access Token Secret');
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存凭证';
    saveButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #1a73e8;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    // 关闭对话框的函数
    const closeDialog = (result) => {
      if (document.body.contains(dialogContainer)) {
        document.body.removeChild(dialogContainer);
      }
      resolve(result);
    };
    
    // 组装对话框
    dialogContent.appendChild(closeButton);
    dialogContent.appendChild(title);
    dialogContent.appendChild(description);
    dialogContent.appendChild(link);
    dialogContent.appendChild(apiKeyContainer);
    dialogContent.appendChild(apiSecretContainer);
    dialogContent.appendChild(accessTokenContainer);
    dialogContent.appendChild(accessTokenSecretContainer);
    dialogContent.appendChild(buttonsContainer);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    dialogContainer.appendChild(dialogContent);
    
    // 添加事件监听
    cancelButton.addEventListener('click', () => {
      closeDialog(null);
    });
    
    saveButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      const apiSecret = apiSecretInput.value.trim();
      const accessToken = accessTokenInput.value.trim();
      const accessTokenSecret = accessTokenSecretInput.value.trim();
      
      if (apiKey && apiSecret && accessToken && accessTokenSecret) {
        const credentials = {
          apiKey,
          apiSecret,
          accessToken,
          accessTokenSecret
        };
        const saved = saveTwitterApiCredentials(credentials);
        if (saved) {
          closeDialog(credentials);
        } else {
          alert('保存凭证失败，请重试');
        }
      } else {
        alert('请填写所有必填字段');
      }
    });
    
    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      closeDialog(null);
    });
    
    // 点击背景关闭对话框
    dialogContainer.addEventListener('click', (e) => {
      if (e.target === dialogContainer) {
        closeDialog(null);
      }
    });
    
    // 添加到文档
    document.body.appendChild(dialogContainer);
    apiKeyInput.focus();
  });
};

// 模拟Twitter数据（当无法使用API时）
const generateMockTwitterData = (company) => {
  const mockContents = [
    `刚刚发布了全新的AI模型，性能提升了50%！ #AI #创新`,
    `我们的研究团队在自然语言处理领域取得了重大突破！`,
    `今天与@PartnerCompany 宣布战略合作，共同推进AI技术发展。`,
    `新的开发者工具现已上线，立即体验：https://example.com/tools`,
    `回顾我们在今年AI技术发展中的关键里程碑。`,
    `分享一个使用我们技术的有趣案例研究：https://example.com/case-study`,
    `加入我们的技术讲座，了解AI的未来发展方向。`,
    `我们的CEO刚刚接受了独家访谈，分享了对AI发展的见解。`
  ];
  
  return Array.from({ length: 5 }, (_, index) => ({
    id: `${company.id}-twitter-mock-${index}`,
    title: `${company.name}的最新推文`,
    content: mockContents[index % mockContents.length],
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image: `https://picsum.photos/400/300?random=${index + 100}`,
    url: `https://twitter.com/${company.twitterHandle}/status/${Math.floor(Math.random() * 1000000000)}`,
    source: 'Twitter模拟数据',
    companyName: company.name,
    companyColor: company.color,
    isTwitter: true
  }));
};

// 获取Twitter授权头
const getTwitterAuthHeaders = () => {
  // 简化实现，实际应用中需要正确生成OAuth签名
  // 这里我们使用Bearer Token方式，需要用户提供有效的访问令牌
  return {
    'Authorization': `Bearer ${TWITTER_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

// 从Twitter获取公司推文
const fetchTweetsFromCompany = async (company) => {
  // 检查是否有Twitter API凭证
  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
    const credentials = await showTwitterApiDialog();
    if (!credentials) {
      console.log('没有Twitter API凭证，使用模拟数据');
      return generateMockTwitterData(company);
    }
  }
  
  try {
    // 构建Twitter API请求URL
    const params = new URLSearchParams({
      'tweet.fields': 'created_at,public_metrics,attachments',
      'user.fields': 'profile_image_url',
      'max_results': '10',
      'expansions': 'attachments.media_keys'
    });
    
    // 获取用户ID（因为Twitter API v2需要用户ID来获取推文）
    const userResponse = await axios.get(`${TWITTER_API_BASE_URL}/users/by/username/${company.twitterHandle}`, {
      headers: getTwitterAuthHeaders()
    });
    
    const userId = userResponse.data.data.id;
    
    // 获取用户推文
    const tweetsResponse = await axios.get(`${TWITTER_API_BASE_URL}/users/${userId}/tweets?${params}`, {
      headers: getTwitterAuthHeaders()
    });
    
    // 转换Twitter数据为应用所需格式
    return tweetsResponse.data.data.map((tweet, index) => {
      // 提取图片URL（如果有）
      let imageUrl = null;
      if (tweet.attachments && tweet.attachments.media_keys && tweetsResponse.data.includes && tweetsResponse.data.includes.media) {
        const media = tweetsResponse.data.includes.media.find(m => m.media_key === tweet.attachments.media_keys[0]);
        imageUrl = media?.url || null;
      }
      
      return {
        id: `${company.id}-twitter-${tweet.id}`,
        title: `${company.name}的推文`,
        content: tweet.text,
        date: new Date(tweet.created_at).toISOString().split('T')[0],
        image: imageUrl || null,
        url: `https://twitter.com/${company.twitterHandle}/status/${tweet.id}`,
        source: 'Twitter',
        companyName: company.name,
        companyColor: company.color,
        isTwitter: true
      };
    });
  } catch (error) {
    console.error(`获取${company.name}的Twitter数据失败:`, error);
    // API调用失败时返回模拟数据
    return generateMockTwitterData(company);
  }
};

// 模拟新闻数据
const generateMockNews = (company) => {
  const mockTitles = [
    `${company.name}发布全新AI模型`,
    `${company.name}在人工智能领域取得突破`,
    `${company.name}与合作伙伴共同推进AI研究`,
    `${company.name}推出新的开发者工具`,
    `${company.name}AI技术应用案例分析`
  ];
  
  const mockContents = [
    `${company.name}今日宣布推出新一代人工智能模型，在多项基准测试中表现优异。该模型具有更强的语言理解和生成能力，将为用户带来全新体验。`,
    `${company.name}研究团队在自然语言处理领域取得重大突破，新算法在复杂推理任务上超越了现有水平，为AI技术发展开辟了新方向。`,
    `${company.name}与多家科技公司建立战略合作关系，共同推进人工智能技术的研发与应用，旨在打造更加智能、高效的解决方案。`,
    `${company.name}今天正式发布全新开发者工具包，简化AI应用的开发流程，降低技术门槛，让更多开发者能够快速构建AI应用。`,
    `${company.name}分享了最新AI技术在医疗、金融、教育等领域的应用案例，展示了人工智能技术对各行业的积极影响。`
  ];
  
  return Array.from({ length: 5 }, (_, index) => ({
    id: `${company.id}-mock-${index}`,
    title: mockTitles[index % mockTitles.length],
    content: mockContents[index % mockContents.length],
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    image: `https://picsum.photos/400/300?random=${index}`,
    url: '#',
    source: '模拟新闻源',
    companyName: company.name,
    companyColor: company.color,
  }));
};

// 保存API Key到本地存储
export const saveApiKey = (apiKey) => {
  try {
    // 保存到localStorage
    localStorage.setItem('news_api_key', apiKey);
    NEWS_API_KEY = apiKey;
    return true;
  } catch (error) {
    console.error('保存API Key失败:', error);
    return false;
  }
};

// 从本地存储加载API Key
const loadApiKeyFromStorage = () => {
  try {
    const savedKey = localStorage.getItem('news_api_key');
    if (savedKey) {
      NEWS_API_KEY = savedKey;
      return true;
    }
  } catch (error) {
    console.error('加载API Key失败:', error);
  }
  return false;
};

// 显示API Key输入对话框
export const showApiKeyDialog = () => {
  return new Promise((resolve) => {
    // 检查是否已经从本地存储加载了key
    if (loadApiKeyFromStorage()) {
      resolve(NEWS_API_KEY);
      return;
    }
    
    // 创建对话框元素
    const dialogContainer = document.createElement('div');
    dialogContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      position: relative;
    `;
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: #f5f5f5;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '请输入NewsAPI密钥';
    title.style.cssText = 'margin-top: 0; color: #333; font-size: 18px;';
    
    const description = document.createElement('p');
    description.textContent = '需要NewsAPI密钥才能获取最新新闻。没有密钥？请访问：';
    description.style.cssText = 'color: #666; margin-bottom: 12px;';
    
    const link = document.createElement('a');
    link.href = 'https://newsapi.org/account';
    link.textContent = 'https://newsapi.org/account';
    link.target = '_blank';
    link.style.cssText = 'color: #1a73e8; text-decoration: none; display: block; margin-bottom: 16px;';
    
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'margin-bottom: 20px;';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '输入您的NewsAPI密钥';
    input.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    `;
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end;';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '使用模拟数据';
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存密钥';
    saveButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #1a73e8;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    // 关闭对话框的函数
    const closeDialog = (result) => {
      if (document.body.contains(dialogContainer)) {
        document.body.removeChild(dialogContainer);
      }
      resolve(result);
    };
    
    // 组装对话框
    inputContainer.appendChild(input);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    dialogContent.appendChild(closeButton); // 添加关闭按钮
    dialogContent.appendChild(title);
    dialogContent.appendChild(description);
    dialogContent.appendChild(link);
    dialogContent.appendChild(inputContainer);
    dialogContent.appendChild(buttonsContainer);
    dialogContainer.appendChild(dialogContent);
    
    // 添加事件监听
    cancelButton.addEventListener('click', () => {
      closeDialog(null); // 使用模拟数据
    });
    
    saveButton.addEventListener('click', () => {
      const apiKey = input.value.trim();
      if (apiKey) {
        const saved = saveApiKey(apiKey);
        if (saved) {
          closeDialog(apiKey);
        } else {
          alert('保存密钥失败，请重试');
        }
      } else {
        alert('请输入有效的API密钥');
      }
    });
    
    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
      closeDialog(null); // 默认使用模拟数据
    });
    
    // 点击背景关闭对话框
    dialogContainer.addEventListener('click', (e) => {
      if (e.target === dialogContainer) {
        closeDialog(null);
      }
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveButton.click();
      }
    });
    
    // 添加到文档
    document.body.appendChild(dialogContainer);
    input.focus();
  });
};

// 根据公司获取新闻
export const getNewsByCompany = async (companyId, sourceType = NewsSourceType.API) => {
  const company = llmCompanies.find(c => c.id === companyId);
  if (!company) {
    return Promise.resolve([]);
  }
  
  // 如果选择Twitter来源，从Twitter获取数据
  if (sourceType === NewsSourceType.TWITTER) {
    return fetchTweetsFromCompany(company);
  }
  
  // 如果选择官方来源，返回包含官方URL的新闻条目
  if (sourceType === NewsSourceType.OFFICIAL) {
    return Promise.resolve([{
      id: `${company.id}-official-source`,
      title: `${company.name}官方新闻`,
      content: `访问${company.name}官方网站获取最新、最准确的新闻和更新。`,
      date: new Date().toISOString().split('T')[0],
      image: null,
      url: company.officialUrl,
      source: '官方来源',
      companyName: company.name,
      companyColor: company.color,
      isOfficialSource: true
    }]);
  }
  
  // 使用API来源（原有逻辑）
  // 检查是否有API Key，如果没有则显示对话框
  if (!NEWS_API_KEY) {
    const apiKey = await showApiKeyDialog();
    // 如果用户没有提供API Key，返回模拟数据
    if (!apiKey) {
      console.log('使用模拟数据');
      return Promise.resolve(generateMockNews(company));
    }
  }
  
  try {
    // 构建API请求URL
    const query = encodeURIComponent(company.keywords);
    const url = `${NEWS_API_BASE_URL}/everything?q=${query}&apiKey=${NEWS_API_KEY}&language=zh&sortBy=publishedAt&pageSize=10`;

    const response = await axios.get(url);
    return transformNewsData(response.data, company);
  } catch (error) {
    console.error(`获取${company.name}新闻失败:`, error);
    // API调用失败时返回模拟数据
    return generateMockNews(company);
  }
};

// 获取所有公司的新闻
export const getAllNews = async (sourceType = NewsSourceType.API) => {
  // 如果选择Twitter来源，需要特殊处理
  if (sourceType === NewsSourceType.TWITTER) {
    // 检查是否有Twitter API凭证
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
      const credentials = await showTwitterApiDialog();
      // 如果用户没有提供凭证，生成所有公司的模拟Twitter数据
      if (!credentials) {
        console.log('使用Twitter模拟数据');
        const allMockTwitterData = llmCompanies.flatMap(company => generateMockTwitterData(company));
        return Promise.resolve(allMockTwitterData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    }
    
    // 并发请求所有公司的Twitter数据
    const allRequests = llmCompanies.map(company => 
      fetchTweetsFromCompany(company)
    );

    return Promise.all(allRequests)
      .then(results => {
        // 合并所有推文并按日期排序
        const allTweets = results.flat();
        return allTweets.sort((a, b) => new Date(b.date) - new Date(a.date));
      })
      .catch(error => {
        console.error('获取所有Twitter数据失败:', error);
        // 失败时返回模拟数据
        const allMockTwitterData = llmCompanies.flatMap(company => generateMockTwitterData(company));
        return allMockTwitterData.sort((a, b) => new Date(b.date) - new Date(a.date));
      });
  }
  
  // 原有逻辑...
  // 如果选择官方来源，返回所有公司的官方来源新闻
  if (sourceType === NewsSourceType.OFFICIAL) {
    const officialNews = llmCompanies.map(company => ({
      id: `${company.id}-official-source`,
      title: `${company.name}官方新闻`,
      content: `访问${company.name}官方网站获取最新、最准确的新闻和更新。`,
      date: new Date().toISOString().split('T')[0],
      image: null,
      url: company.officialUrl,
      source: '官方来源',
      companyName: company.name,
      companyColor: company.color,
      isOfficialSource: true
    }));
    return Promise.resolve(officialNews);
  }
  
  // 使用API来源（原有逻辑）
  // 检查是否有API Key，如果没有则显示对话框
  if (!NEWS_API_KEY) {
    const apiKey = await showApiKeyDialog();
    // 如果用户没有提供API Key，生成所有公司的模拟数据
    if (!apiKey) {
      console.log('使用模拟数据');
      const allMockNews = llmCompanies.flatMap(company => generateMockNews(company));
      return Promise.resolve(allMockNews.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  }
  
  // 并发请求所有公司的新闻
  const allRequests = llmCompanies.map(company => 
    getNewsByCompany(company.id, sourceType)
  );

  return Promise.all(allRequests)
    .then(results => {
      // 合并所有新闻并按日期排序
      const allNews = results.flat();
      return allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    })
    .catch(error => {
      console.error('获取所有新闻失败:', error);
      // 失败时返回模拟数据
      const allMockNews = llmCompanies.flatMap(company => generateMockNews(company));
      return allMockNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
};

// 直接获取新闻的API函数
export const fetchNewsFromAPI = async (endpoint, params = {}) => {
  // 检查是否有API Key，如果没有则显示对话框
  if (!NEWS_API_KEY) {
    const apiKey = await showApiKeyDialog();
    if (!apiKey) {
      throw new Error('未提供API密钥');
    }
  }
  
  return axios.get(`${NEWS_API_BASE_URL}${endpoint}`, {
    params: { ...params, apiKey: NEWS_API_KEY }
  }).then(response => response.data);
}

// 清除保存的API Key
export const clearApiKey = () => {
  try {
    localStorage.removeItem('news_api_key');
    NEWS_API_KEY = null;
    return true;
  } catch (error) {
    console.error('清除API Key失败:', error);
    return false;
  }
};

// 清除保存的Twitter API凭证
export const clearTwitterApiCredentials = () => {
  try {
    localStorage.removeItem('twitter_api_key');
    localStorage.removeItem('twitter_api_secret');
    localStorage.removeItem('twitter_access_token');
    localStorage.removeItem('twitter_access_token_secret');
    TWITTER_API_KEY = null;
    TWITTER_API_SECRET = null;
    TWITTER_ACCESS_TOKEN = null;
    TWITTER_ACCESS_TOKEN_SECRET = null;
    return true;
  } catch (error) {
    console.error('清除Twitter API凭证失败:', error);
    return false;
  }
};

// 导出Twitter相关功能
export const twitterService = {
  saveCredentials: saveTwitterApiCredentials,
  showApiDialog: showTwitterApiDialog,
  clearCredentials: clearTwitterApiCredentials
};