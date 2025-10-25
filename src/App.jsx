import React, { useState, useEffect } from 'react';
import { getLLMCompanies, getAllNews, getNewsByCompany, NewsSourceType } from '../utils/newsService';
import { Capacitor, Plugins } from '@capacitor/core';
import './App.css';

const { Haptics } = Plugins;

function App() {
  const [companies, setCompanies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [selectedNewsSource, setSelectedNewsSource] = useState(NewsSourceType.API);

  // 加载公司列表
  useEffect(() => {
    loadCompanies();
  }, []);

  // 当选中公司或新闻来源变化时，加载相应的新闻
  useEffect(() => {
    loadNews();
  }, [selectedCompany, selectedNewsSource]);

  const loadCompanies = async () => {
    try {
      const companiesData = await getLLMCompanies();
      setCompanies(companiesData);
    } catch (err) {
      console.error('加载公司列表失败:', err);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      let newsData;
      if (selectedCompany === 'all') {
        newsData = await getAllNews(selectedNewsSource);
      } else {
        newsData = await getNewsByCompany(selectedCompany, selectedNewsSource);
      }
      setNews(newsData);
    } catch (err) {
      console.error('加载新闻失败:', err);
      setError('加载新闻失败，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNewsSourceChange = (sourceType) => {
    setSelectedNewsSource(sourceType);
    // 触觉反馈
    if (Capacitor.isPluginAvailable('Haptics')) {
      Haptics.selection();
    }
    // 重新加载新闻数据
    loadNews();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // 触觉反馈
    if (Capacitor.isPluginAvailable('Haptics')) {
      Haptics.impact({ style: 'light' });
    }
    loadNews();
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
    // 触觉反馈
    if (Capacitor.isPluginAvailable('Haptics')) {
      Haptics.selection();
    }
  };

  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  // 处理触摸结束事件
  const handleTouchEnd = (e) => {
    setTouchEndX(e.changedTouches[0].clientX);
    handleSwipe();
  };

  // 处理滑动逻辑
  const handleSwipe = () => {
    const minSwipeDistance = 50; // 最小滑动距离
    const swipeDistance = touchStartX - touchEndX;

    // 获取当前选中的索引
    const allTabs = ['all', ...companies.map(c => c.id)];
    const currentIndex = allTabs.indexOf(selectedCompany);

    // 向左滑动（显示下一个标签）
    if (swipeDistance > minSwipeDistance && currentIndex < allTabs.length - 1) {
      handleCompanySelect(allTabs[currentIndex + 1]);
    }
    // 向右滑动（显示上一个标签）
    else if (swipeDistance < -minSwipeDistance && currentIndex > 0) {
      handleCompanySelect(allTabs[currentIndex - 1]);
    }
  };

  const handleNewsPress = (newsItem) => {
    // 触觉反馈
    if (Capacitor.isPluginAvailable('Haptics')) {
      Haptics.impact({ style: 'medium' });
    }
    // 打开新闻链接
    if (Capacitor.isPluginAvailable('Browser')) {
      Plugins.Browser.open({ url: newsItem.url });
    } else {
      window.open(newsItem.url, '_blank');
    }
  };

  const renderCompanyTabs = () => {
    return (
      <div className="company-tabs">
        <div 
          className={`company-tab ${selectedCompany === 'all' ? 'active' : ''}`}
          onClick={() => handleCompanySelect('all')}
        >
          全部
        </div>
        {companies.map(company => (
          <div 
            key={company.id}
            className={`company-tab ${selectedCompany === company.id ? 'active' : ''}`}
            onClick={() => handleCompanySelect(company.id)}
            style={{ 
              borderColor: selectedCompany === company.id ? company.color : 'transparent',
              color: selectedCompany === company.id ? company.color : '#666'
            }}
          >
            {company.name}
          </div>
        ))}
      </div>
    );
  };

  const renderNewsItem = (item) => {
    return (
      <div 
        key={item.id} 
        className="news-item"
        onClick={() => handleNewsPress(item)}
      >
        <div className="news-header">
          <span className="company-tag" style={{ backgroundColor: item.companyColor }}>
            {item.companyName}
          </span>
          <span className="news-date">{item.date}</span>
        </div>
        <h3 className="news-title">{item.title}</h3>
        <p className="news-content">{item.content}</p>
        {item.image && (
          <img src={item.image} alt={item.title} className="news-image" />
        )}
        <div className="news-source">{item.source}</div>
      </div>
    );
  };

  const renderNewsSourceSelector = () => {
    return (
      <div className="news-source-selector">
        <div 
          className={`source-option ${selectedNewsSource === NewsSourceType.API ? 'active' : ''}`}
          onClick={() => handleNewsSourceChange(NewsSourceType.API)}
        >
          API来源
        </div>
        <div 
          className={`source-option ${selectedNewsSource === NewsSourceType.OFFICIAL ? 'active' : ''}`}
          onClick={() => handleNewsSourceChange(NewsSourceType.OFFICIAL)}
        >
          官方来源
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LLM News</h1>
        <div className="refresh-button" onClick={handleRefresh}>
          {refreshing ? '刷新中...' : '刷新'}
        </div>
      </header>
      
      {renderNewsSourceSelector()}
      {renderCompanyTabs()}
      
      <div 
        className="news-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading && !refreshing ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : news.length === 0 ? (
          <div className="empty">暂无新闻</div>
        ) : (
          news.map(renderNewsItem)
        )}
      </div>
    </div>
  );
}

export default App;