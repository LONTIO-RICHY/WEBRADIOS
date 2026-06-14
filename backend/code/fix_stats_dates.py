from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Channel
from database import DATABASE_URL
from datetime import datetime, timedelta
import random

# Connexion à la base de données
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def fix():
    # Fix Users
    users = db.query(User).all()
    for u in users:
        if not u.created_at:
            # Assigner une date aléatoire dans les 30 derniers jours
            days_ago = random.randint(0, 30)
            u.created_at = datetime.now() - timedelta(days=days_ago)
    
    # Fix Channels
    channels = db.query(Channel).all()
    for c in channels:
        if not c.created_at:
            days_ago = random.randint(0, 30)
            c.created_at = datetime.now() - timedelta(days=days_ago)
            
    db.commit()
    print("Dates de création mises à jour pour les statistiques.")

if __name__ == "__main__":
    fix()
