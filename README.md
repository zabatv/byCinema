# ByCinema Merch

Интернет-магазин одежды из кино и фильмов. Проект построен на архитектуре монолит + SPA, адаптирован для деплоя на [Render](https://render.com).

**Стек:** Node.js + Express + SQLite (backend), React + Vite (frontend), Docker.

---

## Структура проекта

```
bycinema-merch/
├── backend/              # Express API сервер
│   ├── src/
│   │   ├── config/       # Конфигурация БД
│   │   ├── middleware/    # JWT, валидация
│   │   ├── routes/       # REST маршруты
│   │   ├── utils/        # Обработка ошибок
│   │   ├── seed.js       # Наполнение БД
│   │   └── index.js      # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React SPA клиент
│   ├── src/
│   │   ├── api/          # HTTP клиент
│   │   ├── components/   # Header, Footer, ProductCard, Filters
│   │   ├── pages/        # Home, Catalog, ProductPage, MoviePage,
│   │   │                   Cart, Checkout, Profile, Login, Admin
│   │   └── styles/       # Глобальные CSS
│   ├── Dockerfile
│   └── package.json
├── shared/               # Общие типы и константы
├── Dockerfile            # Multi-stage сборка
├── render.yaml           # Конфигурация Render
└── README.md
```

---

## Быстрый старт (локальная разработка)

### Требования

- Node.js 20+
- npm 10+

### Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd bycinema-merch

# 2. Установить зависимости
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm install

# 3. Настроить переменные окружения
cp backend/.env.example backend/.env
# Отредактировать .env при необходимости

# 4. Наполнить БД тестовыми данными
npm run seed

# 5. Запустить backend и frontend одновременно
npm run dev
```

Backend будет доступен на `http://localhost:5000`, frontend — на `http://localhost:5173`.

### Тестовые учётные записи

| Роль  | Email               | Пароль    |
|-------|---------------------|-----------|
| Админ | admin@bycinema.com  | admin123  |
| Юзер  | user@test.com       | user123   |

---

## API Эндпоинты

### Аутентификация

```
POST   /api/v1/auth/register      Регистрация
POST   /api/v1/auth/login         Вход
GET    /api/v1/auth/me            Текущий пользователь (auth)
PUT    /api/v1/auth/profile       Обновление профиля (auth)
```

### Фильмы

```
GET    /api/v1/movies              Список фильмов (поиск, пагинация)
GET    /api/v1/movies/:slug        Фильм с коллекциями и товарами
POST   /api/v1/movies              Создать (admin)
PUT    /api/v1/movies/:id          Обновить (admin)
DELETE /api/v1/movies/:id          Удалить (admin)
```

### Товары

```
GET    /api/v1/products            Каталог (фильтры, поиск, пагинация, сортировка)
GET    /api/v1/products/:slug      Детально с похожими товарами
POST   /api/v1/products            Создать (admin)
PUT    /api/v1/products/:id        Обновить (admin)
DELETE /api/v1/products/:id        Удалить (admin)
```

### Коллекции

```
GET    /api/v1/collections         Список коллекций
GET    /api/v1/collections/:slug   Коллекция с товарами
POST   /api/v1/collections         Создать (admin)
PUT    /api/v1/collections/:id     Обновить (admin)
DELETE /api/v1/collections/:id     Удалить (admin)
```

### Заказы

```
GET    /api/v1/orders              Мои заказы (auth)
GET    /api/v1/orders/:id          Детально (auth)
POST   /api/v1/orders              Создать заказ (auth)
```

### Админ-панель

```
GET    /api/v1/admin/stats         Статистика (admin)
GET    /api/v1/admin/orders        Все заказы (admin)
PUT    /api/v1/admin/orders/:id/status  Обновить статус (admin)
GET    /api/v1/admin/users         Все пользователи (admin)
```

### Параметры запроса для `/api/v1/products`

| Параметр    | Тип    | Описание                          |
|-------------|--------|-----------------------------------|
| search      | string | Поиск по названию/описанию        |
| type        | string | Фильтр по типу (Футболка, Худи…) |
| size        | string | Фильтр по размеру (S, M, L…)     |
| color       | string | Фильтр по цвету                   |
| movieId     | number | Фильтр по фильму                  |
| collectionId| number | Фильтр по коллекции               |
| minPrice    | number | Минимальная цена (в копейках)    |
| maxPrice    | number | Максимальная цена (в копейках)   |
| sort        | string | price_asc, price_desc, name       |
| page        | number | Номер страницы (default: 1)       |
| limit       | number | Элементов на странице (default: 20, max: 100) |

---

## Примеры curl-запросов

```bash
# Получение каталога товаров
curl http://localhost:5000/api/v1/products?limit=5

# Поиск по названию фильма
curl http://localhost:5000/api/v1/movies?search=космическая

# Товары по фильму
curl http://localhost:5000/api/v1/movies/kosmicheskaya-saga

# Товары по типу и цвету
curl "http://localhost:5000/api/v1/products?type=Худи&color=Чёрный"

# Регистрация
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Логин
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bycinema.com","password":"admin123"}'

# Создание заказа (требуется токен)
TOKEN="eyJhbGci..."
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items":[{"productId":1,"quantity":2,"size":"M","color":"Чёрный"}],
    "shippingAddress":{"fullName":"Иван","phone":"+7...","street":"ул. Ленина, 1","city":"Москва","zip":"101000","country":"Россия"}
  }'

# Админ: статистика
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/v1/admin/stats
```

---

## Деплой на Render

### Через render.yaml (рекомендуется)

1. Создать аккаунт на [render.com](https://render.com)
2. Подключить GitHub репозиторий
3. В Dashboard выбрать **New → Blueprint**, указать репозиторий
4. Render автоматически создаст Web Service и PostgreSQL базу

### Через Dashboard (ручная настройка)

#### Web Service

1. **New → Web Service** → выбрать репозиторий
2. Настройки:
   - **Name:** `bycinema-merch`
   - **Runtime:** `Docker`
   - **Build Command:** (оставить пустым)
   - **Start Command:** (оставить пустым)
   - **Instance Type:** Free

#### Переменные окружения

| Переменная             | Значение                                  |
|------------------------|-------------------------------------------|
| `NODE_ENV`             | `production`                              |
| `DATABASE_URL`         | `./data/bycinema.db` (SQLite) или PostgreSQL URI |
| `JWT_SECRET`           | (сгенерировать случайную строку)          |
| `JWT_EXPIRES_IN`       | `7d`                                      |
| `CLOUD_STORAGE_PROVIDER` | `local`                                 |
| `CLOUD_STORAGE_BUCKET` | `uploads`                                 |
| `STRIPE_SECRET_KEY`    | (опционально)                             |
| `FRONTEND_URL`         | `https://bycinema-merch.onrender.com`     |

3. Нажать **Deploy**

#### Seed данных

После деплоя выполните:

```bash
curl -X POST https://bycinema-merch.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bycinema.com","password":"admin123"}'
```

Для начального наполнения добавлен эндпоинт (временно):

```bash
# Или локально через Docker:
docker exec -it <container> node /app/backend/src/seed.js
```

> **Важно:** Для SQLite на Render используется ephemeral storage. Данные будут сброшены при каждом перезапуске. 
> Для production-режима переключитесь на PostgreSQL.

---

## Доступные скрипты

```bash
npm run dev              # Запуск backend + frontend одновременно
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
npm run build            # Сборка backend и frontend
npm run seed             # Наполнение БД тестовыми данными
npm run test             # Запуск тестов
npm run lint             # ESLint
npm run format           # Prettier
```

---

## Seed данные

Проект включает 6 вымышленных фильмов (без использования реальных торговых марок):

1. **Космическая сага** — 4 товара (футболка, худи, куртка, кепка)
2. **Волшебный мир** — 4 товара (свитер, мантия, шарф, футболка)
3. **Тёмный рыцарь** — 4 товара (футболка, плащ, худи, значок)
4. **Средиземье: Кольцо Всевластия** — 4 товара (жилет, свитер, футболка, плащ)
5. **Лабиринт разума** — 4 товара (костюм, футболка, худи, кепка)
6. **Королевство драконов** — 4 товара (футболка, худи, штаны, брелок)

Всего: 24 товара, 12 коллекций.

---

## Лицензия

MIT
