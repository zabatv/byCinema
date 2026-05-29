import 'dotenv/config';
import { initDatabase, getDb } from './config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  await initDatabase();
  const db = getDb();

  console.log('Clearing existing data...');
  db.execute('DELETE FROM orders; DELETE FROM products; DELETE FROM collections; DELETE FROM movies; DELETE FROM users;');

  console.log('Creating admin user...');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.insert('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', ['admin@bycinema.com', hashedPassword, 'Admin', 'admin']);
  db.insert('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', ['user@test.com', bcrypt.hashSync('user123', 10), 'Test User', 'user']);

  const movies = [
    {
      title: 'Космическая сага',
      slug: 'kosmicheskaya-saga',
      description: 'Эпическая космическая опера о борьбе повстанцев с галактической империей. Легендарные персонажи, невероятные технологии и битвы в далёком космосе.',
      posterUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400',
      year: '1977',
      genre: 'Фантастика',
    },
    {
      title: 'Волшебный мир',
      slug: 'volshebnyy-mir',
      description: 'Мальчик, выживший, поступает в школу магии и открывает мир волшебства, дружбы и опасных приключений.',
      posterUrl: 'https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=400',
      year: '2001',
      genre: 'Фэнтези',
    },
    {
      title: 'Тёмный рыцарь',
      slug: 'temnyy-rytsar',
      description: 'Мрачный детектив, борющийся с преступностью в городе, погружённом во тьму. История о justice, страхе и искуплении.',
      posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400',
      year: '2005',
      genre: 'Экшн',
    },
    {
      title: 'Средиземье: Кольцо Всевластия',
      slug: 'sredizemye-koltso',
      description: 'Эпическое фэнтези-путешествие маленького хоббита, которому предстоит уничтожить древнее кольцо в огне Роковой горы.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
      year: '2001',
      genre: 'Фэнтези',
    },
    {
      title: 'Лабиринт разума',
      slug: 'labirint-razuma',
      description: 'Группа учёных проникает в сны другого человека, чтобы внедрить идею. Головокружительный триллер о границах реальности.',
      posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
      year: '2010',
      genre: 'Триллер',
    },
    {
      title: 'Королевство драконов',
      slug: 'korolevstvo-drakonov',
      description: 'Молодой викинг приручает дракона и меняет многовековую войну между людьми и драконами. История о дружбе и понимании.',
      posterUrl: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=400',
      year: '2010',
      genre: 'Анимация',
    },
  ];

  console.log('Seeding movies...');
  for (const m of movies) {
    db.insert('INSERT INTO movies (title, slug, description, posterUrl, year, genre) VALUES (?, ?, ?, ?, ?, ?)', [m.title, m.slug, m.description, m.posterUrl, m.year, m.genre]);
  }

  const collections = [
    { name: 'Повстанческая коллекция', slug: 'povstancheskaya', movieId: 1 },
    { name: 'Имперский стиль', slug: 'imperskiy-stil', movieId: 1 },
    { name: 'Факультетская форма', slug: 'fakultetskaya-forma', movieId: 2 },
    { name: 'Мир магии', slug: 'mir-magii', movieId: 2 },
    { name: 'Готэм-стиль', slug: 'gotem-stil', movieId: 3 },
    { name: 'Бэт-костюмы', slug: 'bet-kostyumy', movieId: 3 },
    { name: 'Хоббит-шик', slug: 'hobbit-shik', movieId: 4 },
    { name: 'Эльфийская элегантность', slug: 'elfiyskaya-elegantnost', movieId: 4 },
    { name: 'Сновидения', slug: 'snovideniya', movieId: 5 },
    { name: 'Подсознание', slug: 'podsoznanie', movieId: 5 },
    { name: 'Остров драконов', slug: 'ostrov-drakonov', movieId: 6 },
    { name: 'Верхом на драконе', slug: 'verhom-na-drakone', movieId: 6 },
  ];

  console.log('Seeding collections...');
  for (const c of collections) {
    db.insert('INSERT INTO collections (name, slug, description, movieId) VALUES (?, ?, ?, ?)', [c.name, c.slug, `Коллекция "${c.name}" из фильма`, c.movieId]);
  }

  const products = [
    // Movie 1: Космическая сага
    { name: 'Футболка "Повстанец"', slug: 'footbolka-povstanec', price: 249000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL'], colors: ['Белый', 'Чёрный'], collectionId: 1, movieId: 1, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
    { name: 'Худи "Галактика"', slug: 'hudi-galaktika', price: 459000, type: 'Худи', sizes: ['M', 'L', 'XL'], colors: ['Тёмно-синий', 'Чёрный'], collectionId: 1, movieId: 1, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { name: 'Куртка лётчика', slug: 'kurtka-letchika', price: 899000, type: 'Куртка', sizes: ['M', 'L', 'XL'], colors: ['Коричневый', 'Чёрный'], collectionId: 2, movieId: 1, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { name: 'Кепка "Империя"', slug: 'keepka-imperiya', price: 149000, type: 'Кепка', sizes: ['S', 'M', 'L'], colors: ['Чёрный', 'Белый'], collectionId: 2, movieId: 1, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
    // Movie 2: Волшебный мир
    { name: 'Свитер факультета', slug: 'sviter-fakulteta', price: 399000, type: 'Свитер', sizes: ['S', 'M', 'L', 'XL'], colors: ['Красный', 'Зелёный', 'Синий'], collectionId: 3, movieId: 2, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400' },
    { name: 'Мантия волшебника', slug: 'mantiya-volshebnika', price: 599000, type: 'Куртка', sizes: ['S', 'M', 'L'], colors: ['Чёрный', 'Тёмно-синий'], collectionId: 3, movieId: 2, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400' },
    { name: 'Шарф "Волшебство"', slug: 'sharf-volshebstvo', price: 199000, type: 'Аксессуар', sizes: ['S', 'M'], colors: ['Красный', 'Зелёный', 'Жёлтый'], collectionId: 4, movieId: 2, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' },
    { name: 'Футболка "Магическая"', slug: 'footbolka-magicheskaya', price: 229000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL'], colors: ['Белый', 'Чёрный', 'Серый'], collectionId: 4, movieId: 2, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400' },
    // Movie 3: Тёмный рыцарь
    { name: 'Футболка "Тёмный силуэт"', slug: 'footbolka-temnyy-siluet', price: 259000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Чёрный', 'Серый'], collectionId: 5, movieId: 3, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400' },
    { name: 'Плащ детектива', slug: 'plashch-detektiva', price: 799000, type: 'Куртка', sizes: ['M', 'L', 'XL'], colors: ['Чёрный', 'Тёмно-синий'], collectionId: 5, movieId: 3, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { name: 'Худи "Готэм"', slug: 'hudi-gotem', price: 429000, type: 'Худи', sizes: ['S', 'M', 'L', 'XL'], colors: ['Чёрный', 'Серый'], collectionId: 6, movieId: 3, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { name: 'Значок "Бэт-символ"', slug: 'znachok-bet-simvol', price: 59000, type: 'Аксессуар', sizes: ['S', 'M'], colors: ['Чёрный', 'Жёлтый'], collectionId: 6, movieId: 3, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400' },
    // Movie 4: Средиземье: Кольцо Всевластия
    { name: 'Хоббитский жилет', slug: 'hobbitskiy-zhilet', price: 549000, type: 'Одежда', sizes: ['S', 'M', 'L'], colors: ['Зелёный', 'Коричневый'], collectionId: 7, movieId: 4, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400' },
    { name: 'Эльфийский свитер', slug: 'elfiyskiy-sviter', price: 449000, type: 'Свитер', sizes: ['S', 'M', 'L', 'XL'], colors: ['Белый', 'Зелёный', 'Синий'], collectionId: 8, movieId: 4, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400' },
    { name: 'Футболка "Кольцо"', slug: 'footbolka-koltso', price: 239000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL'], colors: ['Чёрный', 'Белый', 'Золотой'], collectionId: 7, movieId: 4, stock: 55, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
    { name: 'Плащ странника', slug: 'plashch-strannika', price: 699000, type: 'Куртка', sizes: ['M', 'L', 'XL'], colors: ['Серый', 'Коричневый', 'Зелёный'], collectionId: 8, movieId: 4, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    // Movie 5: Лабиринт разума
    { name: 'Костюм "Сновидец"', slug: 'kostyum-snovidec', price: 899000, type: 'Куртка', sizes: ['S', 'M', 'L', 'XL'], colors: ['Чёрный', 'Синий'], collectionId: 9, movieId: 5, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { name: 'Футболка "Лабиринт"', slug: 'footbolka-labirint', price: 249000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Белый', 'Чёрный'], collectionId: 9, movieId: 5, stock: 65, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400' },
    { name: 'Худи "Подсознание"', slug: 'hudi-podsoznanie', price: 449000, type: 'Худи', sizes: ['M', 'L', 'XL'], colors: ['Чёрный', 'Серый', 'Синий'], collectionId: 10, movieId: 5, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { name: 'Кепка "Реальность"', slug: 'keepka-realnost', price: 159000, type: 'Кепка', sizes: ['S', 'M', 'L'], colors: ['Чёрный', 'Белый', 'Красный'], collectionId: 10, movieId: 5, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400' },
    // Movie 6: Королевство драконов
    { name: 'Футболка "Дракон"', slug: 'footbolka-drakon', price: 239000, type: 'Футболка', sizes: ['S', 'M', 'L', 'XL'], colors: ['Чёрный', 'Белый', 'Красный'], collectionId: 11, movieId: 6, stock: 70, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
    { name: 'Худи "Верхом на драконе"', slug: 'hudi-verhom-na-drakone', price: 439000, type: 'Худи', sizes: ['S', 'M', 'L', 'XL'], colors: ['Чёрный', 'Синий', 'Зелёный'], collectionId: 12, movieId: 6, stock: 28, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { name: 'Штаны "Викинг"', slug: 'shtany-viking', price: 399000, type: 'Штаны', sizes: ['S', 'M', 'L', 'XL'], colors: ['Коричневый', 'Чёрный', 'Серый'], collectionId: 11, movieId: 6, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400' },
    { name: 'Брелок "Драконье яйцо"', slug: 'brelok-drakone-yayco', price: 79000, type: 'Аксессуар', sizes: ['S'], colors: ['Зелёный', 'Красный', 'Синий'], collectionId: 12, movieId: 6, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400' },
  ];

  console.log('Seeding products...');
  for (const p of products) {
    db.insert(
      'INSERT INTO products (name, slug, description, price, type, sizes, colors, imageUrl, gallery, collectionId, movieId, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.name, p.slug, `Описание товара "${p.name}" — стильная одежда, вдохновлённая культовыми фильмами.`, p.price,
       p.type, JSON.stringify(p.sizes), JSON.stringify(p.colors), p.imageUrl, JSON.stringify([]),
       p.collectionId, p.movieId, p.stock],
    );
  }

  console.log('Seed completed successfully!');
  console.log(`  - ${movies.length} movies`);
  console.log(`  - ${collections.length} collections`);
  console.log(`  - ${products.length} products`);
  console.log('  - 2 users (admin@bycinema.com / admin123, user@test.com / user123)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
