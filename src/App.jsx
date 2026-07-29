import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Header } from './components/Header/Header';
import { PlayAction } from './components/PlayAction/PlayAction';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { WindowControls } from './components/WindowControls/WindowControls';
import { Updater } from './components/Updater/Updater'; 
import { APP_CONFIG } from './config.js';

import './styles/global.scss';
import styles from './App.module.scss';

export default function App() {
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [newsList, setNewsList] = useState([
    { id: 1, title: "Добро пожаловать в наш лаунчер!", content: "Мы рады видеть вас здесь. Наслаждайтесь игрой!" }
  ]);

  return (
    <div className={styles.launcherRoot}>
      {/* Кнопки управления окном (Свернуть / Закрыть) */}
      <WindowControls />

      {/* Фоновые эффекты */}
      <div className={styles.vignette} />
      <div className={styles.fogOverlay} />

      {/* ============================================================== */}
      {/* UPDATER (ОН ПЕРЕКРОЕТ ВСЁ, ЕСЛИ ЕСТЬ ОБНОВЛЕНИЕ) */}
      <Updater />
      {/* ============================================================== */}

      {/* Шапка с новостями, логотипом и профилем */}
      <Header 
        user={user} 
        setUser={setUser} 
        newsList={newsList} 
        setNewsList={setNewsList} 
      />

      {/* Центр: Кнопка ИГРАТЬ */}
      {/* ПЕРЕДАЕМ USER СЮДА */}
      <PlayAction user={user} />

      {/* Нижняя правая кнопка настроек */}
      <motion.div 
        className={styles.settingsBtnWrapper}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <button className={styles.settingsBtn} title="Настройки" onClick={() => setIsSettingsOpen(true)}>
          <Settings className={styles.gearIcon} size={24} />
        </button>
      </motion.div>

      {/* Версия приложения в левом нижнем углу */}
      <div className={styles.appVersion}>{APP_CONFIG.version}</div>

      {/* Модальное окно настроек */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}