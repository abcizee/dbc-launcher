import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, ChevronRight, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ProfileModal } from '../ProfileModal/ProfileModal';
import styles from './Header.module.scss';

export const Header = ({ user, setUser, newsList, setNewsList }) => {
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');

  const [newsToDelete, setNewsToDelete] = useState(null);

  const handleAddNews = (e) => {
    e.preventDefault();
    if (!newTag || !newTitle) return;
    const newArticle = { tag: newTag.toUpperCase(), title: newTitle, link: newLink || '' };
    setNewsList([newArticle, ...newsList]);
    setNewTag(''); setNewTitle(''); setNewLink(''); setIsCreatingNews(false);
  };

  const confirmDeleteNews = (index) => {
    setNewsToDelete(index);
  };

  const executeDeleteNews = () => {
    if (newsToDelete !== null) {
      setNewsList(newsList.filter((_, i) => i !== newsToDelete));
      setNewsToDelete(null);
    }
  };

  return (
    <>
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      >
        <div className={styles.newsSection}>
          <button className={styles.newsToggle} onClick={() => setIsNewsOpen(!isNewsOpen)}>
            <Menu size={20} /> НОВОСТИ
          </button>

          <AnimatePresence>
            {isNewsOpen && (
              <motion.div 
                className={styles.newsDropdown}
                initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
              >
                <div className={styles.newsHeader}>
                  <h3>ОБНОВЛЕНИЯ ТУМАНА</h3>
                  <X size={20} className={styles.closeIcon} onClick={() => setIsNewsOpen(false)} style={{ cursor: 'pointer' }} />
                </div>

                {user?.isAdmin && (
                  <div style={{ marginBottom: '15px' }}>
                    {!isCreatingNews ? (
                      <button onClick={() => setIsCreatingNews(true)} className={styles.adminCreateBtn}>
                        <Plus size={14} /> Создать новость
                      </button>
                    ) : (
                      <form onSubmit={handleAddNews} className={styles.adminNewsForm}>
                        <input type="text" placeholder="Тег (например, PATCH 1.1)" value={newTag} onChange={(e) => setNewTag(e.target.value)} required />
                        <input type="text" placeholder="Текст новости..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                        <input type="url" placeholder="Ссылка (необязательно)" value={newLink} onChange={(e) => setNewLink(e.target.value)} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="submit" className={styles.submitBtn}>Опубликовать</button>
                          <button type="button" onClick={() => setIsCreatingNews(false)} className={styles.cancelBtn}>Отмена</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className={styles.newsList}>
                  {newsList.map((news, i) => (
                    <div key={i} className={styles.newsCard}>
                      {newsToDelete === i ? (
                         <div className={styles.deleteConfirm}>
                           <AlertTriangle size={16} color="#9e1010"/> Удалить новость?
                           <div>
                             <button onClick={executeDeleteNews} style={{ cursor: 'pointer', background: '#9e1010', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', marginRight: '5px' }}>Да</button>
                             <button onClick={() => setNewsToDelete(null)} style={{ cursor: 'pointer', background: 'transparent', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px' }}>Нет</button>
                           </div>
                         </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className={styles.tag}>{news.tag}</span>
                            {user?.isAdmin && <Trash2 size={14} color="#9ca3af" style={{ cursor: 'pointer' }} onClick={() => confirmDeleteNews(i)} />}
                          </div>
                          <p className={styles.title}>{news.title}</p>
                          
                          {/* ИСПРАВЛЕНИЕ: Блокировка открытия пустого окна */}
                          <a 
                            href={news.link || '#'} 
                            target={news.link && news.link !== '#' ? "_blank" : "_self"} 
                            rel="noreferrer" 
                            className={styles.readMore}
                            onClick={(e) => {
                              if (!news.link || news.link === '#') e.preventDefault(); // Запрещаем переход, если ссылки нет
                            }}
                            style={{ opacity: !news.link || news.link === '#' ? 0.5 : 1, cursor: !news.link || news.link === '#' ? 'default' : 'pointer' }}
                          >
                            ПОДРОБНЕЕ <ChevronRight size={12} />
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.logoWrapper}>
          <h1 className={styles.logoTitle}>DEAD <span>BY</span> CRAFT</h1>
          <div className={styles.logoSubtitle}>GLOBAL MODIFICATION</div>
        </div>

        <div className={styles.profileSection}>
          {/* ИСПРАВЛЕНИЕ: Колокольчик теперь тоже открывает новости */}
          <div className={styles.bellBtn} title="Уведомления" onClick={() => setIsNewsOpen(!isNewsOpen)} style={{ cursor: 'pointer' }}>
            <Bell size={20} />
            <div className={styles.dot} />
          </div>
          
          <div className={styles.profilePill} onClick={() => setIsProfileOpen(true)}>
            <img src={user ? `https://minotar.net/helm/${user.username}/100.png` : "https://minotar.net/helm/steve/100.png"} alt="Avatar" className={styles.avatar} />
            <div className={styles.details}>
              <span className={styles.name}>{user ? user.username : "Гость"}</span>
              <span className={styles.role}>{user ? (user.isAdmin ? "Администратор" : "Выживший") : "Войти"}</span>
            </div>
          </div>
        </div>
      </motion.header>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} setUser={setUser} />
    </>
  );
};