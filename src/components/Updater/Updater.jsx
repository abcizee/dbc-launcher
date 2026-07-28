import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Updater.module.scss';

export const Updater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Сразу проверяем обновления при запуске
      ipcRenderer.invoke('check-updates');

      ipcRenderer.on('update-available', (event, version) => {
        setNewVersion(version);
        setUpdateAvailable(true);
      });

      ipcRenderer.on('download-progress', (event, percent) => {
        setProgress(Math.round(percent));
      });
    }
  }, []);

  const startUpdate = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('start-download');
      setIsDownloading(true);
    }
  };

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div className={styles.updaterOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.updaterBox}>
          <h2>ОБНОВЛЕНИЕ ТУМАНА</h2>
          {!isDownloading ? (
            <>
              <p>Доступна новая версия лаунчера: <strong>{newVersion}</strong></p>
              <div className={styles.buttons}>
                <button className={styles.updateBtn} onClick={startUpdate}>ОБНОВИТЬ СЕЙЧАС</button>
                <button className={styles.skipBtn} onClick={() => setUpdateAvailable(false)}>ПОЗЖЕ</button>
              </div>
            </>
          ) : (
            <>
              <p>Скачивание обновления... Не закрывайте лаунчер.</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.percent}>{progress}%</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};