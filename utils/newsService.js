import axios from 'axios';
import config from './config';

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
const NEWS_API_KEY = config.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

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

// 根据公司获取新闻
export const getNewsByCompany = (companyId) => {
  const company = llmCompanies.find(c => c.id === companyId);
  if (!company) {
    return Promise.resolve([]);
  }

  // 构建API请求URL
  const query = encodeURIComponent(company.keywords);
  const url = `${NEWS_API_BASE_URL}/everything?q=${query}&apiKey=${NEWS_API_KEY}&language=zh&sortBy=publishedAt&pageSize=10`;

  return axios.get(url)
    .then(response => transformNewsData(response.data, company))
    .catch(error => {
      console.error(`获取${company.name}新闻失败:`, error);
      // 如果API调用失败，返回一些备用的示例数据
      return [
        {
          id: `${company.id}-fallback-1`,
          title: `${company.name}最新AI技术进展`,
          content: `${company.name}在人工智能领域持续创新，最近发布了多项重要技术更新。`,
          date: new Date().toISOString().split('T')[0],
          image: null,
          companyName: company.name,
          companyColor: company.color,
        },
      ];
    });
};

// 获取所有公司的新闻
export const getAllNews = () => {
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
      return [];
    });
};

// 直接获取新闻的API函数
export const fetchNewsFromAPI = (endpoint, params = {}) => {
  return axios.get(`${NEWS_API_BASE_URL}${endpoint}`, {
    params: { ...params, apiKey: NEWS_API_KEY }
  }).then(response => response.data);
};