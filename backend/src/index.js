import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { initDatabase, getDb } from './config/database.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';
import { PORT, FRONTEND_URL } from './config/env.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import collectionRoutes from './routes/collections.js';
import movieRoutes from './routes/movies.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function autoSeed() {
  try {
    const db = getDb();
    const existing = db.queryOne('SELECT COUNT(*) as count FROM movies');
    if (existing && existing.count > 0) { console.log('DB already seeded'); return; }

    console.log('Auto-seeding database...');
    const hp = bcrypt.hashSync('admin123', 10);
    db.insert('INSERT INTO users (email, password, name, role) VALUES (?,?,?,?)', ['admin@bycinema.com', hp, 'Admin', 'admin']);
    db.insert('INSERT INTO users (email, password, name, role) VALUES (?,?,?,?)', ['user@test.com', bcrypt.hashSync('user123', 10), 'Test User', 'user']);

    const movies = [
      ['Космическая сага','kosmicheskaya-saga','Эпическая космическая опера','https://placehold.co/400x600/1a1a2e/e94560?text=Space+Saga','1977','Фантастика'],
      ['Волшебный мир','volshebnyy-mir','Школа магии и волшебства','https://placehold.co/400x600/2d1b69/ffd700?text=Magic+World','2001','Фэнтези'],
      ['Тёмный рыцарь','temnyy-rytsar','Борьба с преступностью в Готэме','https://placehold.co/400x600/1a1a1a/808080?text=Dark+Knight','2005','Экшн'],
      ['Средиземье: Кольцо','sredizemye-koltso','Хоббит уничтожает кольцо','https://placehold.co/400x600/2d5a27/d4a574?text=Middle+Earth','2001','Фэнтези'],
      ['Лабиринт разума','labirint-razuma','Путешествие в мир снов','https://placehold.co/400x600/16213e/0f3460?text=Inception','2010','Триллер'],
      ['Королевство драконов','korolevstvo-drakonov','Викинг и его дракон','https://placehold.co/400x600/1a3a2e/ff6b35?text=Dragon+Kingdom','2010','Анимация'],
    ];
    for (const m of movies) db.insert('INSERT INTO movies (title,slug,description,posterUrl,year,genre) VALUES (?,?,?,?,?,?)', m);

    const cols = [
      ['Повстанцы','povstantsy',1],['Империя','imperiya',1],['Факультет','fakultet',2],['Магия','magiya',2],
      ['Готэм','gotem',3],['Бэт-костюмы','bet-kostyumy',3],['Хоббит','hobbit',4],['Эльфы','elfy',4],
      ['Сны','sny',5],['Реальность','realnost',5],['Драконы','drakony',6],['Викинги','vikingi',6],
    ];
    for (const c of cols) db.insert('INSERT INTO collections (name,slug,movieId) VALUES (?,?,?)', c);

    const products = [
      ['Футболка Повстанец','footbolka-povstanec',249000,'Футболка','S,M,L,XL','Белый,Чёрный','https://placehold.co/400x500/1a1a2e/fff?text=T-Shirt',1,1,50],
      ['Худи Галактика','hudi-galaktika',459000,'Худи','M,L,XL','Тёмно-синий,Чёрный','https://placehold.co/400x500/1a1a2e/e94560?text=Hoodie',1,1,30],
      ['Куртка лётчика','kurtka-letchika',899000,'Куртка','M,L,XL','Коричневый,Чёрный','https://placehold.co/400x500/2d1b69/ffd700?text=Jacket',2,1,15],
      ['Кепка Империя','keepka-imperiya',149000,'Кепка','S,M,L','Чёрный,Белый','https://placehold.co/400x500/1a1a1a/fff?text=Cap',2,1,100],
      ['Свитер факультета','sviter-fakulteta',399000,'Свитер','S,M,L,XL','Красный,Зелёный,Синий','https://placehold.co/400x500/2d1b69/e94560?text=Sweater',3,2,40],
      ['Мантия волшебника','mantiya-volshebnika',599000,'Куртка','S,M,L','Чёрный,Тёмно-синий','https://placehold.co/400x500/1a1a2e/4a4a8a?text=Robe',3,2,20],
      ['Шарф Волшебство','sharf-volshebstvo',199000,'Аксессуар','S,M','Красный,Зелёный','https://placehold.co/400x500/ff6b35/fff?text=Scarf',4,2,75],
      ['Футболка Магическая','footbolka-magicheskaya',229000,'Футболка','S,M,L,XL','Белый,Чёрный,Серый','https://placehold.co/400x500/2d1b69/ffd700?text=Magic+Shirt',4,2,60],
      ['Футболка Тёмный силуэт','footbolka-temnyy-siluet',259000,'Футболка','S,M,L,XL,XXL','Чёрный,Серый','https://placehold.co/400x500/1a1a1a/808080?text=Dark+Shirt',5,3,45],
      ['Плащ детектива','plashch-detektiva',799000,'Куртка','M,L,XL','Чёрный,Тёмно-синий','https://placehold.co/400x500/1a1a1a/ffd700?text=Cloak',5,3,12],
      ['Худи Готэм','hudi-gotem',429000,'Худи','S,M,L,XL','Чёрный,Серый','https://placehold.co/400x500/1a1a1a/e94560?text=Gotham+Hoodie',6,3,35],
      ['Значок Бэт-символ','znachok-bet-simvol',59000,'Аксессуар','S,M','Чёрный,Жёлтый','https://placehold.co/400x500/ffd700/1a1a1a?text=Badge',6,3,200],
      ['Хоббитский жилет','hobbitskiy-zhilet',549000,'Одежда','S,M,L','Зелёный,Коричневый','https://placehold.co/400x500/2d5a27/d4a574?text=Vest',7,4,18],
      ['Эльфийский свитер','elfiyskiy-sviter',449000,'Свитер','S,M,L,XL','Белый,Зелёный,Синий','https://placehold.co/400x500/2d5a27/fff?text=Elven+Sweater',8,4,25],
      ['Футболка Кольцо','footbolka-koltso',239000,'Футболка','S,M,L,XL','Чёрный,Белый,Золотой','https://placehold.co/400x500/d4a574/1a1a1a?text=Ring+Shirt',7,4,55],
      ['Плащ странника','plashch-strannika',699000,'Куртка','M,L,XL','Серый,Коричневый,Зелёный','https://placehold.co/400x500/4a3728/d4a574?text=Traveler+Cloak',8,4,10],
      ['Костюм Сновидец','kostyum-snovidec',899000,'Куртка','S,M,L,XL','Чёрный,Синий','https://placehold.co/400x500/16213e/0f3460?text=Dream+Suit',9,5,20],
      ['Футболка Лабиринт','footbolka-labirint',249000,'Футболка','S,M,L,XL,XXL','Белый,Чёрный','https://placehold.co/400x500/16213e/e94560?text=Labyrinth',9,5,65],
      ['Худи Подсознание','hudi-podsoznanie',449000,'Худи','M,L,XL','Чёрный,Серый,Синий','https://placehold.co/400x500/16213e/0f3460?text=Subconscious',10,5,30],
      ['Кепка Реальность','keepka-realnost',159000,'Кепка','S,M,L','Чёрный,Белый,Красный','https://placehold.co/400x500/0f3460/fff?text=Reality+Cap',10,5,80],
      ['Футболка Дракон','footbolka-drakon',239000,'Футболка','S,M,L,XL','Чёрный,Белый,Красный','https://placehold.co/400x500/1a3a2e/ff6b35?text=Dragon+Shirt',11,6,70],
      ['Худи Верхом на драконе','hudi-verhom-na-drakone',439000,'Худи','S,M,L,XL','Чёрный,Синий,Зелёный','https://placehold.co/400x500/1a3a2e/ff6b35?text=Dragon+Hoodie',12,6,28],
      ['Штаны Викинг','shtany-viking',399000,'Штаны','S,M,L,XL','Коричневый,Чёрный,Серый','https://placehold.co/400x500/4a3728/d4a574?text=Viking+Pants',11,6,22],
      ['Брелок Драконье яйцо','brelok-drakone-yayco',79000,'Аксессуар','S','Зелёный,Красный,Синий','https://placehold.co/400x500/ff6b35/fff?text=Dragon+Egg',12,6,150],
    ];
    for (const p of products) {
      db.insert('INSERT INTO products (name,slug,price,type,sizes,colors,imageUrl,collectionId,movieId,stock) VALUES (?,?,?,?,?,?,?,?,?,?)', [
        p[0],p[1],p[2],p[3],JSON.stringify(p[4].split(',')),JSON.stringify(p[5].split(',')),p[6],p[7],p[8],p[9],
      ]);
    }

    console.log(`Auto-seed done: ${movies.length} movies, ${products.length} products`);
  } catch (err) {
    console.error('Auto-seed failed:', err);
  }
}

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

initDatabase().then(() => {
  autoSeed().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  });
});

export default app;
