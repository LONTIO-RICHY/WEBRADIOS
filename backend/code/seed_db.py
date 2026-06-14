import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    categories = [
        {"name": "Musique", "description": "Toutes les émissions musicales", "icon": "bx-music"},
        {"name": "Actualités", "description": "Informations et débats", "icon": "bx-news"},
        {"name": "Sport", "description": "Analyses et retransmissions sportives", "icon": "bx-football"},
        {"name": "Culture", "description": "Art, cinéma et traditions", "icon": "bx-palette"},
        {"name": "Divertissement", "description": "Humour et jeux", "icon": "bx-laugh"},
    ]

    for cat_data in categories:
        exists = db.query(models.Category).filter(models.Category.name == cat_data["name"]).first()
        if not exists:
            new_cat = models.Category(**cat_data)
            db.add(new_cat)
    
    db.commit()
    db.close()
    print("Base de données initialisée avec les catégories !")

if __name__ == "__main__":
    seed()
