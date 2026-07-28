import React from 'react';
import { motion } from 'framer-motion';
import styles from './PlayAction.module.scss';

export const PlayAction = () => {
  return (
    <motion.div 
      className={styles.centerActionArea}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
    >
      <button className={styles.btnPlayWrapper}>
        <div className={styles.btnPlay}>
          <span className={styles.btnPlayText}>ИГРАТЬ</span>
        </div>
      </button>
      
      <div className={styles.serverStatus}>
        <span className={styles.statusDot} />
        СЕРВЕРА АКТИВНЫ • 1,423 ОНЛАЙН
      </div>
    </motion.div>
  );
};