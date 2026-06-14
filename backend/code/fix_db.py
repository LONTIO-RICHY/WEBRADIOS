from sqlalchemy import create_engine, text
from database import DATABASE_URL

def fix_database():
    engine = create_engine(DATABASE_URL)
    
    print(f"Connexion à la base de données : {DATABASE_URL}")
    
    with engine.connect() as connection:
        # Liste des colonnes à ajouter (Table, Nom, Type)
        columns_to_add = [
            ("users", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("channels", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("channels", "category_id", "INT NULL"),
            ("channels", "last_broadcast_at", "DATETIME NULL"),
            ("emissions", "category_id", "INT NULL"),
            ("emissions", "channel_id", "INT NULL"),
            ("comments", "emission_id", "INT NULL"),
            ("comments", "channel_id", "INT NULL"),
            ("saved_tracks", "emission_id", "INT NULL"),
        ]

        for table, col, col_type in columns_to_add:
            try:
                print(f"Vérification de la colonne '{col}' dans '{table}'...")
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                print(f"-> Colonne '{col}' ajoutée avec succès dans '{table}'.")
            except Exception as e:
                if "Duplicate column name" in str(e) or "1060" in str(e):
                    print(f"-> La colonne '{col}' existe déjà dans '{table}'.")
                else:
                    print(f"-> Erreur lors de l'ajout de '{col}' dans '{table}' : {e}")

        # On s'assure que les nouvelles tables sont créées aussi (au cas où)
        import models
        models.Base.metadata.create_all(bind=engine)
        print("-> Synchronisation des schémas terminée.")

        connection.commit()
        print("\nRéparation terminée ! Vous pouvez maintenant créer votre chaîne.")

if __name__ == "__main__":
    fix_database()
