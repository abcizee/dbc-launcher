import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './PlayAction.module.scss';

const { ipcRenderer } = window.require('electron');

export const PlayAction = ({ user }) => {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0); // Процент от 0 до 100
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    const handleStatus = (e, data) => {
      // Поддерживаем и простой текст, и объекты с процентами
      if (typeof data === 'string') {
        setStatus(data);
        setProgress(0);
      } else {
        setStatus(data.text);
        if (data.percent !== undefined) setProgress(data.percent);
      }
      
      // Если прилетела ошибка — отжимаем кнопку обратно
      if ((typeof data === 'string' && data.includes('Ошибка')) || 
          (data.text && data.text.includes('Ошибка'))) {
        setIsLaunching(false);
      }
    };
    
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
    setProgress(0);

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
        {/* Рендерим прогресс-бар, если загрузка в процессе */}
        {progress > 0 && progress < 100 && (
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', margin: '8px 0', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: '#fff', height: '100%', borderRadius: '2px', transition: 'width 0.2s' }} />
          </div>
        )}
        
        <span className={styles.statusDot} style={{ background: isLaunching ? '#ffaa00' : '#00ff88' }} />
        {status ? status : 'СЕРВЕРА АКТИВНЫ • 1,423 ОНЛАЙН'}
      </div>
    </motion.div>
  );
};