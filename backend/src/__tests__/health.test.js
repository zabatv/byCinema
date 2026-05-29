import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import 'dotenv/config';
import { initDatabase, getDb } from '../config/database.js';

describe('Database', () => {
  before(async () => {
    process.env.DATABASE_URL = ':memory:';
    await initDatabase();
  });

  it('should have movies table', () => {
    const db = getDb();
    const movies = db.queryAll("SELECT name FROM sqlite_master WHERE type='table' AND name='movies'");
    assert.ok(movies.length > 0);
  });

  it('should have products table', () => {
    const db = getDb();
    const products = db.queryAll("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
    assert.ok(products.length > 0);
  });
});
