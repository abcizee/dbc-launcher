<div align="center">
  <h1>🩸 DEAD BY CRAFT: LAUNCHER</h1>
  <p><strong>Официальный лаунчер для глобальной модификации «Dead by Craft»</strong></p>

  [![Version](https://img.shields.io/badge/version-v0.2_beta-b81414?style=for-the-badge)](https://github.com/abcizee/dead-by-craft/releases)
  [![Status](https://img.shields.io/badge/status-Active_Development-109e46?style=for-the-badge)]()
</div>

---

## 🌫️ О проекте
**Dead by Craft Launcher** — это производительная, безопасная и атмосферная точка входа в игру. Разработан с нуля для обеспечения максимального комфорта игроков, интеграции с базой данных сервера и автоматической доставки обновлений.

### ⚡ Ключевые особенности
* **Продвинутая авторизация:** Поддержка лицензионных аккаунтов (Microsoft/Xbox) и защищенной регистрации через внутреннюю БД проекта.
* **Атмосферный UI/UX:** Дизайн в стиле ААА-игр с эффектами объемного тумана, динамическими тенями и плавными анимациями (Framer Motion).
* **Синхронизация профиля:** Отображение игровой статистики (Очки крови, Побеги, Жертвоприношения) напрямую из базы данных.
* **Smart-Обновления:** Лаунчер автоматически скачивает патчи в фоновом режиме, не требуя ручных манипуляций от игрока.

## 📥 Установка (v0.2 Beta)
> [!WARNING]
> Проект находится в стадии бета-тестирования. Возможны непредвиденные ошибки.

1. Перейдите на вкладку [Releases](../../releases).
2. Скачайте последний файл `Dead by Craft Setup X.X.X.exe`.
3. Запустите установщик (при необходимости разрешите запуск в Windows SmartScreen).

## 🛠️ Технический стек
- **Frontend:** React, Vite, SCSS (Модульная архитектура)
- **Backend/Desktop:** Electron, Node.js
- **Database:** PostgreSQL (хэширование `bcryptjs`)
- **Authentication:** `msmc` (Microsoft Authentication)

---
<div align="center">
  <p>Created by <strong>abcizee</strong> | 2026</p>
</div>