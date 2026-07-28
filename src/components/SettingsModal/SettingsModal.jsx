import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, HardDrive, Cpu, Volume2, Monitor, Globe } from 'lucide-react';
import styles from './SettingsModal.module.scss';
import { APP_CONFIG } from '../../config';

// Простая локализация
const translations = {
  RU: {
    title: "НАСТРОЙКИ", section: "Игра и Клиент", launchParams: "ПАРАМЕТРЫ ЗАПУСКА",
    ram: "Выделение памяти ОЗУ", ramDesc: "Рекомендуется выделять не менее 4 ГБ для стабильной работы глобальной модификации.",
    fullscreen: "Полноэкранный режим", vol: "Громкость звуков лаунчера", path: "Путь к папке игры",
    change: "Изменить", save: "СОХРАНИТЬ ПАРАМЕТРЫ", lang: "Язык лаунчера"
  },
  EN: {
    title: "SETTINGS", section: "Game & Client", launchParams: "LAUNCH PARAMETERS",
    ram: "RAM Allocation", ramDesc: "Allocating at least 4 GB is recommended for stable operation of the global modification.",
    fullscreen: "Fullscreen Mode", vol: "Launcher Volume", path: "Game Directory",
    change: "Change", save: "SAVE SETTINGS", lang: "Launcher Language"
  }
};

export const SettingsModal = ({ isOpen, onClose }) => {
  const [ram, setRam] = useState(4);
  const [fullscreen, setFullscreen] = useState(true);
  const [volume, setVolume] = useState(80);
  const [language, setLanguage] = useState('RU'); // RU или EN

  const t = translations[language];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div 
          className={styles.modal}
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
          
          <div className={styles.sidebar}>
            <h3><Sliders size={18} /> {t.title}</h3>
            <span className={styles.activeTab}>{t.section}</span>
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              <h2>{t.launchParams}</h2>

              {/* Выбор языка */}
              <div className={styles.settingGroup}>
                <label><Globe size={18} /> {t.lang}</label>
                <div className={styles.langSelector}>
                  <button className={language === 'RU' ? styles.activeLang : ''} onClick={() => setLanguage('RU')}>RU</button>
                  <button className={language === 'EN' ? styles.activeLang : ''} onClick={() => setLanguage('EN')}>EN</button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label><Cpu size={18} /> {t.ram}: <span>{ram} GB</span></label>
                <input type="range" min="2" max="16" step="2" value={ram} onChange={(e) => setRam(e.target.value)} className={styles.rangeInput}/>
                <p className={styles.desc}>{t.ramDesc}</p>
              </div>

              <div className={styles.settingGroup}>
                <label><Monitor size={18} /> {t.fullscreen}</label>
                <input type="checkbox" checked={fullscreen} onChange={(e) => setFullscreen(e.target.checked)} className={styles.checkboxInput}/>
              </div>

              <div className={styles.settingGroup}>
                <label><Volume2 size={18} /> {t.vol}: <span>{volume}%</span></label>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} className={styles.rangeInput}/>
              </div>

              <div className={styles.settingGroup}>
                <label><HardDrive size={18} /> {t.path}</label>
                <div className={styles.pathBox}>
                  <span>C:/Users/AppData/Roaming/.deadbycraft</span>
                  <button>{t.change}</button>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '20px' }}>
                Текущая версия: <span style={{ color: '#B49A5A' }}>{APP_CONFIG.version}</span>
             </div>
            </div>
            
            <div className={styles.footer}>
              <button className={styles.saveBtn} onClick={onClose}>{t.save}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};