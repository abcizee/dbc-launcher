import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Header } from './components/Header/Header';
import { PlayAction } from './components/PlayAction/PlayAction';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { WindowControls } from './components/WindowControls/WindowControls';
import { Updater } from './components/Updater/Updater'; // <-- 1. ИМПОРТИРУЕМ UPDATER
import { APP_CONFIG } from './config.js';

import './styles/global.scss';
import styles from './App.module.scss';

export default function App() {
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [newsList, setNewsList] = useState([
    { tag: "PATCH 1.0.4", title: "Новый маньяк: 'Шахтёр' уже в тумане." },
    { tag: "HOTFIX", title: "Исправлен баг с текстурами генераторов." },
    { tag: "EVENT", title: "Кровавая жатва начнется в эти выходные!" }
  ]);

  return (
    <div className={styles.launcherRoot}>
      {/* Кнопки управления окном (Свернуть / Закрыть) */}
      <WindowControls />

      {/* Фоновые эффекты */}
      <div className={styles.vignette} />
      <div className={styles.fogOverlay} />

      {/* ============================================================== */}
      {/* 2. ДОБАВЛЯЕМ UPDATER СЮДА (ОН ПЕРЕКРОЕТ ВСЁ, ЕСЛИ ЕСТЬ ОБНОВЛЕНИЕ) */}
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
      <PlayAction />

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