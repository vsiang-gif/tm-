import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables (camelCase columns, do not rename) --------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const collectorToken = pgTable('collector_token', {
  userId: text('userId').primaryKey(),
  tokenHash: text('tokenHash').notNull().unique(),
  tokenPreview: text('tokenPreview').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type PatternStatus = 'pending' | 'cropping' | 'done' | 'failed'

export const patterns = pgTable(
  'patterns',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    goodsId: text('goodsId').notNull(),
    title: text('title').notNull(),
    productUrl: text('productUrl').notNull(),
    imageUrl: text('imageUrl').notNull(),
    salesText: text('salesText').notNull(),
    salesCount: integer('salesCount').notNull(),
    keyword: text('keyword'),
    status: text('status').$type<PatternStatus>().notNull().default('pending'),
    jobId: text('jobId'),
    attempts: integer('attempts').notNull().default(0),
    croppedPathname: text('croppedPathname'),
    error: text('error'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('patterns_user_goods_idx').on(t.userId, t.goodsId),
    index('patterns_user_status_idx').on(t.userId, t.status),
  ],
)

export type Pattern = typeof patterns.$inferSelect
