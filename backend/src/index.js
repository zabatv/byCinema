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
      ['Космическая сага','kosmicheskaya-saga','Эпическая космическая опера','https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400','1977','Фантастика'],
      ['Волшебный мир','volshebnyy-mir','Школа магии и волшебства','https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=400','2001','Фэнтези'],
      ['Тёмный рыцарь','temnyy-rytsar','Борьба с преступностью в Готэме','https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400','2005','Экшн'],
      ['Средиземье: Кольцо','sredizemye-koltso','Хоббит уничтожает кольцо','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400','2001','Фэнтези'],
      ['Лабиринт разума','labirint-razuma','Путешествие в мир снов','https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400','2010','Триллер'],
      ['Королевство драконов','korolevstvo-drakonov','Викинг и его дракон','https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=400','2010','Анимация'],
    ];
    for (const m of movies) db.insert('INSERT INTO movies (title,slug,description,posterUrl,year,genre) VALUES (?,?,?,?,?,?)', m);

    const cols = [
      ['Повстанцы','povstantsy',1],['Империя','imperiya',1],['Факультет','fakultet',2],['Магия','magiya',2],
      ['Готэм','gotem',3],['Бэт-костюмы','bet-kostyumy',3],['Хоббит','hobbit',4],['Эльфы','elfy',4],
      ['Сны','sny',5],['Реальность','realnost',5],['Драконы','drakony',6],['Викинги','vikingi',6],
    ];
    for (const c of cols) db.insert('INSERT INTO collections (name,slug,movieId) VALUES (?,?,?)', c);

    const products = [
      ['Футболка Повстанец','footbolka-povstanec',2490,'Футболка','M,L,XL','Белый,Чёрный','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',1,1,50],
      ['Худи Галактика','hudi-galaktika',4590,'Худи','M,L,XL','Тёмно-синий,Чёрный','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',1,1,30],
      ['Куртка лётчика','kurtka-letchika',8990,'Куртка','M,L,XL','Коричневый,Чёрный','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',2,1,15],
      ['Кепка Империя','keepka-imperiya',1490,'Кепка','S,M,L','Чёрный,Белый','https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',2,1,100],
      ['Свитер факультета','sviter-fakulteta',3990,'Свитер','S,M,L,XL','Красный,Зелёный,Синий','https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',3,2,40],
      ['Мантия волшебника','mantiya-volshebnika',5990,'Куртка','S,M,L','Чёрный,Тёмно-синий','https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400',3,2,20],
      ['Шарф Волшебство','sharf-volshebstvo',1990,'Аксессуар','S,M','Красный,Зелёный','https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400',4,2,75],
      ['Футболка Магическая','footbolka-magicheskaya',2290,'Футболка','S,M,L,XL','Белый,Чёрный,Серый','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',4,2,60],
      ['Футболка Тёмный силуэт','footbolka-temnyy-siluet',2590,'Футболка','S,M,L,XL,XXL','Чёрный,Серый','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',5,3,45],
      ['Плащ детектива','plashch-detektiva',7990,'Куртка','M,L,XL','Чёрный,Тёмно-синий','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',5,3,12],
      ['Худи Готэм','hudi-gotem',4290,'Худи','S,M,L,XL','Чёрный,Серый','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',6,3,35],
      ['Значок Бэт-символ','znachok-bet-simvol',590,'Аксессуар','S,M','Чёрный,Жёлтый','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',6,3,200],
      ['Хоббитский жилет','hobbitskiy-zhilet',5490,'Одежда','S,M,L','Зелёный,Коричневый','https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400',7,4,18],
      ['Эльфийский свитер','elfiyskiy-sviter',4490,'Свитер','S,M,L,XL','Белый,Зелёный,Синий','https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',8,4,25],
      ['Футболка Кольцо','footbolka-koltso',2390,'Футболка','S,M,L,XL','Чёрный,Белый,Золотой','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',7,4,55],
      ['Плащ странника','plashch-strannika',6990,'Куртка','M,L,XL','Серый,Коричневый,Зелёный','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',8,4,10],
      ['Костюм Сновидец','kostyum-snovidec',8990,'Куртка','S,M,L,XL','Чёрный,Синий','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',9,5,20],
      ['Футболка Лабиринт','footbolka-labirint',2490,'Футболка','S,M,L,XL,XXL','Белый,Чёрный','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',9,5,65],
      ['Худи Подсознание','hudi-podsoznanie',4490,'Худи','M,L,XL','Чёрный,Серый,Синий','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',10,5,30],
      ['Кепка Реальность','keepka-realnost',1590,'Кепка','S,M,L','Чёрный,Белый,Красный','https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',10,5,80],
      ['Футболка Дракон','footbolka-drakon',2390,'Футболка','S,M,L,XL','Чёрный,Белый,Красный','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',11,6,70],
      ['Худи Верхом на драконе','hudi-verhom-na-drakone',4390,'Худи','S,M,L,XL','Чёрный,Синий,Зелёный','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',12,6,28],
      ['Штаны Викинг','shtany-viking',3990,'Штаны','S,M,L,XL','Коричневый,Чёрный,Серый','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',11,6,22],
      ['Брелок Драконье яйцо','brelok-drakone-yayco',790,'Аксессуар','S','Зелёный,Красный,Синий','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',12,6,150],
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
