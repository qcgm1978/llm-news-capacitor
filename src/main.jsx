import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';

// 注册Capacitor插件
if (Capacitor.isPluginAvailable('StatusBar')) {
  StatusBar.setStyle({ style: 'DARK' });
  StatusBar.setBackgroundColor({ color: '#ffffff' });
}

if (Capacitor.isPluginAvailable('Keyboard')) {
  Keyboard.setResizeMode({ mode: 'native' });
}

// 监听应用状态变化
CapacitorApp.addListener('appStateChange', ({ isActive }) => {
  console.log('App state changed. Active:', isActive);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);