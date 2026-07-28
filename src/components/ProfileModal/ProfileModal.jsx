import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Coins, LogOut } from 'lucide-react';
import styles from './ProfileModal.module.scss';

export const ProfileModal = ({ isOpen, onClose, user, setUser }) => {
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('dbc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [setUser]);

  // В будущем эта функция будет делать реальный POST запрос на твой сервер
  const handleDatabaseAuth = async (isRegister) => {
    setIsLoading(true);
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        
        // Отправляем запрос в базу
        const action = isRegister ? 'db-register' : 'db-login';
        const result = await ipcRenderer.invoke(action, {
          username: usernameInput,
          password: passwordInput
        });
        
        if (result.success) {
          setUser(result.user);
          localStorage.setItem('dbc_user', JSON.stringify(result.user));
          setUsernameInput('');
          setPasswordInput('');
        } else {
          alert(result.error); // Показываем ошибку (неверный пароль, ник занят и т.д.)
        }
      }
    } catch (error) {
      console.error("Ошибка IPC БД", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) return;
    handleDatabaseAuth(authMode === 'register');
  };

  // Логика входа через Microsoft (OAuth)
  const handleMicrosoftLogin = async () => {
  setIsLoading(true);
  try {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('ms-login');
      
      if (result.success) {
        // Успешный вход! Получили реальный ник из лицензии
        const userData = {
          username: result.profile.name, // Тот самый ник из лицензии
          isPremium: true,
          isAdmin: ['admin', 'abcizee'].includes(result.profile.name.toLowerCase()),
          rank: 20,
          bloodpoints: 0,
          stats: { escapes: 0, sacrifices: 0 }
        };

        setUser(userData);
        localStorage.setItem('dbc_user', JSON.stringify(userData));
      } else {
        alert("Ошибка: На этом аккаунте Microsoft не найдена лицензия Minecraft!");
      }
    } else {
      alert("Авторизация через Microsoft работает только в Desktop-версии!");
    }
  } catch (error) {
     console.error("Ошибка IPC:", error);
  } finally {
    setIsLoading(false);
  }
 };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dbc_user');
    setUsernameInput('');
    setPasswordInput('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.modalOverlay}
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      >
        <motion.div 
          className={styles.profileCard}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={28} /></button>

          {user ? (
            <>
              <div className={styles.skinSection}>
            
                
                {/* Отображение модельки персонажа */}
                <div className={styles.characterViewer}>
                  <div className={styles.glowRing} />
                  <img 
                    src={`https://starlightskins.lunareclipse.studio/render/ultimate/${user.username}/full`} 
                    alt="Survivor Skin" 
                    className={styles.survivorModel}
                    onError={(e) => { e.target.src = "https://starlightskins.lunareclipse.studio/render/ultimate/steve/full" }}
                  />
                </div>
                <div className={styles.characterInfoTag}>УНИКАЛЬНЫЙ ВЫЖИВШИЙ • СЕРВЕРНЫЙ СТИЛЬ</div>
              </div>

              <div className={styles.infoSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 className={styles.username}>{user.username}</h2>
                  {user.isAdmin && <span className={styles.adminBadge}>👑 АДМИН</span>}
                </div>

                <div className={`${styles.accountType} ${user.isPremium ? styles.premium : styles.pirate}`}>
                  {user.isPremium ? 'Лицензия (Microsoft)' : 'Dead by Craft Аккаунт'}
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Очки Крови</span>
                    <span className={`${styles.statValue} ${styles.bloodpoints}`}>
                      <Coins size={22} style={{ display: 'inline', marginRight: '6px' }} />
                      {user.bloodpoints.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Успешные побеги</span>
                    <span className={styles.statValue}>{user.stats.escapes}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Жертвоприношения</span>
                    <span className={styles.statValue}>{user.stats.sacrifices}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Статус аккаунта</span>
                    <span className={styles.statValue} style={{ fontSize: '1.1rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={18} /> Защищен
                    </span>
                  </div>
                </div>

                <div className={styles.actionFooter}>
                  <button className={styles.secondary} onClick={handleLogout}>
                    <LogOut size={16} style={{ display: 'inline', marginRight: '8px' }} /> Сменить аккаунт
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.authContainer}>
              <h2>ВХОД В ТУМАН</h2>
              <div className={styles.authTabs}>
                <button className={authMode === 'login' ? styles.active : ''} onClick={() => setAuthMode('login')}>ВХОД</button>
                <button className={authMode === 'register' ? styles.active : ''} onClick={() => setAuthMode('register')}>РЕГИСТРАЦИЯ</button>
              </div>

              <form className={styles.authForm} onSubmit={handleAuthSubmit}>
                <input 
                  type="text" placeholder="Никнейм" 
                  value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} required 
                />
                <input 
                  type="password" placeholder="Пароль" 
                  value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required 
                />
                
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? 'ОБРАБОТКА...' : (authMode === 'login' ? 'ВОЙТИ В ИГРУ' : 'ЗАРЕГИСТРИРОВАТЬСЯ')}
                </button>
              </form>

              <div className={styles.divider}>ИЛИ</div>

              <button className={styles.microsoftBtn} onClick={handleMicrosoftLogin} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                  <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                  <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                  <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                </svg>
                ВОЙТИ ЧЕРЕЗ MICROSOFT
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};