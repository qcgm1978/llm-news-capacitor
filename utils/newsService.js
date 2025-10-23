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

// LLM公司列表
const llmCompanies = [
  { id: 'openai', name: 'OpenAI', color: '#10a37f', keywords: 'OpenAI GPT ChatGPT' },
  { id: 'anthropic', name: 'Anthropic', color: '#FF5700', keywords: 'Anthropic Claude AI' },
  { id: 'google', name: 'Google DeepMind', color: '#4285F4', keywords: 'Google DeepMind Gemini AI' },
  { id: 'meta', name: 'Meta AI', color: '#1877F2', keywords: 'Meta AI Llama Facebook' },
  { id: 'microsoft', name: 'Microsoft', color: '#0078D4', keywords: 'Microsoft Copilot Azure OpenAI' },
  { id: 'baidu', name: '百度', color: '#3B82F6', keywords: '百度 文心一言ERNIE' },
  { id: 'alibaba', name: '阿里巴巴', color: '#FF6A00', keywords: '阿里巴巴 通义千问' },
];

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
export const getNewsByCompany = async (companyId) => {
  const company = llmCompanies.find(c => c.id === companyId);
  if (!company) {
    return Promise.resolve([]);
  }
  
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
export const getAllNews = async () => {
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
    getNewsByCompany(company.id)
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