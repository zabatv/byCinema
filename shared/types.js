/**
 * @typedef {Object} Movie
 * @property {number} id
 * @property {string} title - Название фильма
 * @property {string} slug - URL-идентификатор
 * @property {string} description - Описание фильма
 * @property {string} posterUrl - URL постера
 * @property {string} year - Год выпуска
 * @property {string} genre - Жанр
 * @property {string} createdAt - Дата создания
 * @property {string} updatedAt - Дата обновления
 */

/**
 * @typedef {Object} Collection
 * @property {number} id
 * @property {string} name - Название коллекции
 * @property {string} slug
 * @property {string} description
 * @property {number} movieId - ID фильма
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name - Название товара
 * @property {string} slug
 * @property {string} description
 * @property {number} price - Цена в копейках/центах
 * @property {string} type - Тип одежды
 * @property {string[]} sizes - Доступные размеры
 * @property {string[]} colors - Доступные цвета
 * @property {string} imageUrl - Основное изображение
 * @property {string[]} gallery - Галерея изображений
 * @property {number} collectionId - ID коллекции
 * @property {number} movieId - ID фильма
 * @property {number} stock - Остаток на складе
 * @property {boolean} isActive - Активен ли товар
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {string} role - 'user' | 'admin'
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {number} userId
 * @property {Object} items - [{productId, name, price, quantity, size, color}]
 * @property {number} total - Общая сумма
 * @property {string} status - Статус заказа
 * @property {Object} shippingAddress - Адрес доставки
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
