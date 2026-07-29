import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './PlayAction.module.scss';

// Подключаем IPC для общения с Electron
const { ipcRenderer } = window.require('electron');

export const PlayAction = ({ user }) => {
  const [status, setStatus] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // Слушаем статусы скачивания от Electron
    const handleStatus = (e, msg) => setStatus(msg);
    ipcRenderer.on('launch-status', handleStatus);
    
    return () => ipcRenderer.removeListener('launch-status', handleStatus);
  }, []);

  const handlePlayClick = () => {
    if (!user) {
      alert("Сначала нужно авторизоваться!");
      return;
    }

    setIsLaunching(true);
    setStatus('Инициализация...');

    // Отправляем команду на запуск вместе с данными игрока
    ipcRenderer.send('launch-game', {
      username: user.username,
      uuid: user.uuid,
      token: user.token 
    });
  };

  return (
    <motion.div 
      className={styles.centerActionArea}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
    >
      <button 
        className={styles.btnPlayWrapper} 
        onClick={handlePlayClick}
        disabled={isLaunching}
        style={{ cursor: isLaunching ? 'wait' : 'pointer' }}
      >
        <div className={styles.btnPlay}>
          <span className={styles.btnPlayText}>
            {isLaunching ? 'ЗАПУСК...' : 'ИГРАТЬ'}
          </span>
        </div>
      </button>
      
      <div className={styles.serverStatus}>
        <span className={styles.statusDot} />
        {status ? status : 'СЕРВЕРА АКТИВНЫ • 1,423 ОНЛАЙН'}
      </div>
    </motion.div>
  );
};