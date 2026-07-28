import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { Auth } from 'msmc'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, frame: false, resizable: false, backgroundColor: '#08080a',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-close', () => win.close())

  if (process.env.VITE_DEV_SERVER_URL) { win.loadURL(process.env.VITE_DEV_SERVER_URL) } 
  else { win.loadFile(path.join(__dirname, '../dist/index.html')) }
}


// ----------------------------------------------------
// 1. РЕГИСТРАЦИЯ ЧЕРЕЗ POSTGRESQL
// ----------------------------------------------------
ipcMain.handle('db-register', async (event, { username, password }) => {
  const client = await pool.connect();
  try {
    // Проверка, существует ли пользователь
    const userCheck = await client.query('SELECT username FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return { success: false, error: 'Никнейм уже занят!' };

    await client.query('BEGIN'); // Начинаем транзакцию
    
    // Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Создаем пользователя
    const userRes = await client.query(
      'INSERT INTO users (username, password_hash, is_premium) VALUES ($1, $2, false) RETURNING id, username',
      [username, hash]
    );
    const userId = userRes.rows[0].id;

    // Создаем профиль и статистику с дефолтными значениями
    await client.query('INSERT INTO profiles (id) VALUES ($1)', [userId]);
    await client.query('INSERT INTO player_stats (profile_id) VALUES ($1)', [userId]);

    await client.query('COMMIT'); // Сохраняем изменения

    return { 
      success: true, 
      user: {
        username: username, isPremium: false, isAdmin: ['admin', 'abcizee'].includes(username.toLowerCase()),
        rank: 20, bloodpoints: 0, stats: { escapes: 0, sacrifices: 0 }
      } 
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("DB Register Error:", error);
    return { success: false, error: 'Внутренняя ошибка базы данных' };
  } finally {
    client.release();
  }
});

// ----------------------------------------------------
// 2. АВТОРИЗАЦИЯ (ВХОД) ЧЕРЕЗ POSTGRESQL
// ----------------------------------------------------
ipcMain.handle('db-login', async (event, { username, password }) => {
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) return { success: false, error: 'Пользователь не найден!' };

    const userRow = userRes.rows[0];

    if (userRow.is_premium) return { success: false, error: 'Этот аккаунт привязан к Microsoft. Войдите через лицензию.' };

    const validPassword = await bcrypt.compare(password, userRow.password_hash);
    if (!validPassword) return { success: false, error: 'Неверный пароль!' };

    const profileRes = await pool.query('SELECT * FROM profiles WHERE id = $1', [userRow.id]);
    const statsRes = await pool.query('SELECT * FROM player_stats WHERE profile_id = $1', [userRow.id]);

    const p = profileRes.rows[0];
    const s = statsRes.rows[0];

    return {
      success: true,
      user: {
        username: userRow.username, isPremium: false,
        isAdmin: userRow.role === 'admin' || ['admin', 'abcizee'].includes(userRow.username.toLowerCase()),
        rank: p.rank, bloodpoints: p.bloodpoints,
        stats: { escapes: s.survivor_escapes, sacrifices: s.killer_sacrifices }
      }
    };
  } catch (error) {
    console.error("DB Login Error:", error);
    return { success: false, error: 'Ошибка подключения к базе' };
  }
});

// ----------------------------------------------------
// 3. ВХОД ЧЕРЕЗ MICROSOFT
// ----------------------------------------------------
ipcMain.handle('ms-login', async () => {
  try {
    const authManager = new Auth("select_account");
    const xboxManager = await authManager.launch("raw"); 
    const token = await xboxManager.getMinecraft(); 
    return { success: true, profile: { name: token.profile.name, uuid: token.profile.id } };
  } catch (error) { return { success: false, error: String(error) }; }
})


// Настройка авто-обновлений
autoUpdater.autoDownload = false; // Мы хотим сначала спросить пользователя

ipcMain.handle('check-updates', () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', (info) => {
  // Отправляем сигнал в React: "Есть обновление!"
  BrowserWindow.getAllWindows()[0].webContents.send('update-available', info.version);
});

ipcMain.on('start-download', () => {
  autoUpdater.downloadUpdate();
});

autoUpdater.on('download-progress', (progressObj) => {
  BrowserWindow.getAllWindows()[0].webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});


app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })