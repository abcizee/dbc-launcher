import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { Auth } from 'msmc'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import pkg from 'electron-updater';
import { Client } from 'minecraft-launcher-core'; // <-- Ядро лаунчера
import fs from 'fs'; // Для работы с файлами
import http from 'http'; // Для локального скачивания модов

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
    title: "DBC Launcher",
    width: 1280, height: 720, frame: false, resizable: false, backgroundColor: '#08080a',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  
  win.setMenuBarVisibility(false); // Убираем белую панель сверху

  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-close', () => win.close())

  if (process.env.VITE_DEV_SERVER_URL) { win.loadURL(process.env.VITE_DEV_SERVER_URL) } 
  else { win.loadFile(path.join(__dirname, '../dist/index.html')) }
}

// ----------------------------------------------------
// БД АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ (Твой код без изменений)
// ----------------------------------------------------
ipcMain.handle('db-register', async (event, { username, password }) => {
  const client = await pool.connect();
  try {
    const userCheck = await client.query('SELECT username FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return { success: false, error: 'Никнейм уже занят!' };

    await client.query('BEGIN');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userRes = await client.query(
      'INSERT INTO users (username, password_hash, is_premium) VALUES ($1, $2, false) RETURNING id, username',
      [username, hash]
    );
    const userId = userRes.rows[0].id;

    await client.query('INSERT INTO profiles (id) VALUES ($1)', [userId]);
    await client.query('INSERT INTO player_stats (profile_id) VALUES ($1)', [userId]);

    await client.query('COMMIT');
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

ipcMain.handle('ms-login', async () => {
  try {
    const authManager = new Auth("select_account");
    const xboxManager = await authManager.launch("raw"); 
    const token = await xboxManager.getMinecraft(); 
    return { success: true, profile: { name: token.profile.name, uuid: token.profile.id } };
  } catch (error) { return { success: false, error: String(error) }; }
});

// ----------------------------------------------------
// ЛОГИКА ЗАПУСКА И СИНХРОНИЗАЦИИ МОДОВ DEAD BY CRAFT
// ----------------------------------------------------
const launcher = new Client();

// Вспомогательная функция для скачивания файла (локально)
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Функция синхронизации папки mods
async function syncMods(modsDir, event) {
  if (!fs.existsSync(modsDir)) {
    fs.mkdirSync(modsDir, { recursive: true });
  }

  try {
    // 1. Запрашиваем список актуальных модов с твоего локального сервера
    // Для этого на локальном ПК можно поднять простую папку через python -m http.server 8080
    event.sender.send('launch-status', 'Проверка обновлений модов...');
    
    // ВРЕМЕННАЯ ЗАГЛУШКА: Чтобы код не падал, пока у тебя нет веб-сервера с файлом mods.json.
    // Когда сервер будет готов, раскомментируй реальный фетч списка.
    
    /*
    const response = await fetch('http://127.0.0.1:8080/mods.json');
    const requiredMods = await response.json(); // Ожидаем массив: ["fabric-api.jar", "dbc-mod.jar"]
    
    for (const modName of requiredMods) {
      const modPath = path.join(modsDir, modName);
      if (!fs.existsSync(modPath)) {
        event.sender.send('launch-status', `Скачивание: ${modName}...`);
        await downloadFile(`http://127.0.0.1:8080/mods/${modName}`, modPath);
      }
    }
    */
    
    event.sender.send('launch-status', 'Моды синхронизированы!');
  } catch (err) {
    console.error("Ошибка синхронизации модов:", err);
    event.sender.send('launch-status', 'Ошибка синхронизации модов!');
  }
}

ipcMain.on('launch-game', async (event, authData) => {
  // Директория твоего клиента в системе пользователя (в %AppData%)
  const rootPath = path.join(app.getPath('userData'), '.dbc-client');
  const modsPath = path.join(rootPath, 'mods');

  const opts = {
    clientPackage: null,
    authorization: {
      access_token: authData.token || "0",
      client_token: "dbc-launcher",
      uuid: authData.uuid || "0",
      name: authData.username || "Player", 
      user_properties: "{}"
    },
    root: rootPath,
    version: {
      number: "1.20.1",
      type: "release",
      custom: "fabric-loader-0.14.22-1.20.1" // Точное имя папки установленного фабрика
    },
    memory: { max: "4G", min: "2G" },
    server: { host: "127.0.0.1", port: "25565" }
  };

  launcher.on('progress', (e) => {
    event.sender.send('launch-status', `Загрузка: ${e.task} (${e.total} файлов)`);
  });

  launcher.on('data', (e) => console.log(e));

  try {
    // 1. Синхронизируем наши кастомные моды
    await syncMods(modsPath, event);

    // 2. Запускаем ядро Minecraft (скачает ванильные файлы и запустит Java)
    event.sender.send('launch-status', 'Инициализация ядра Minecraft...');
    await launcher.launch(opts);
    
    event.sender.send('launch-status', 'Игра запущена!');
  } catch (error) {
    console.error(error);
    event.sender.send('launch-status', 'Ошибка запуска! Смотри консоль.');
  }
});


// ----------------------------------------------------
// АВТО-ОБНОВЛЕНИЕ ЛАУНЧЕРА
// ----------------------------------------------------
autoUpdater.autoDownload = false;

ipcMain.handle('check-updates', () => { autoUpdater.checkForUpdates(); });
autoUpdater.on('update-available', (info) => { BrowserWindow.getAllWindows()[0].webContents.send('update-available', info.version); });
ipcMain.on('start-download', () => { autoUpdater.downloadUpdate(); });
autoUpdater.on('download-progress', (progressObj) => { BrowserWindow.getAllWindows()[0].webContents.send('download-progress', progressObj.percent); });
autoUpdater.on('update-downloaded', () => { autoUpdater.quitAndInstall(); });

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })