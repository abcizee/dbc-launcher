import React from 'react';
import { Minus, X } from 'lucide-react';
import styles from './WindowControls.module.scss';

export const WindowControls = () => {
  const handleMinimize = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-minimize');
    }
  };

  const handleClose = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-close');
    }
  };

  return (
    <div className={styles.controls}>
      <button className={styles.controlBtn} onClick={handleMinimize} title="Свернуть">
        <Minus size={16} />
      </button>
      <button className={`${styles.controlBtn} ${styles.close}`} onClick={handleClose} title="Закрыть">
        <X size={16} />
      </button>
    </div>
  );
};