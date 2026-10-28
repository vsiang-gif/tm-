import { integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const licenses = pgTable('licenses', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  holder: text('holder').notNull(),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('active'),
  maxDevices: integer('max_devices').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const licenseDevices = pgTable(
  'license_devices',
  {
    id: serial('id').primaryKey(),
    licenseId: integer('license_id').notNull(),
    machineId: text('machine_id').notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.licenseId, t.machineId)],
)

export type License = typeof licenses.$inferSelect
