
import sqlite3

conn = sqlite3.connect('backend/code/database.db')
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM channels")
total_channels = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM channels WHERE category_id IS NULL")
no_cat_channels = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM emissions")
total_emissions = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM emissions WHERE category_id IS NULL")
no_cat_emissions = cursor.fetchone()[0]

print(f"Total channels: {total_channels}")
print(f"Channels without category: {no_cat_channels}")
print(f"Total emissions: {total_emissions}")
print(f"Emissions without category: {no_cat_emissions}")

conn.close()
