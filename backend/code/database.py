from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL de connexion à MySQL via PyMySQL
# Format : mysql+pymysql://utilisateur:mot_de_passe@hôte/nom_base_de_données
# Avec WampServer par défaut, l'utilisateur est 'root' et il n'y a PAS de mot de passe.
DATABASE_URL = "mysql+pymysql://root:@localhost/web_radio_db"

# Si tu as défini un mot de passe pour root, remplace la ligne ci-dessus par :
# DATABASE_URL = "mysql+pymysql://root:TON_MOT_DE_PASSE@localhost/web_radio_db"

# Création du moteur de connexion
engine = create_engine(DATABASE_URL)

# Session pour interagir avec la base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour nos modèles
Base = declarative_base()

# Dépendance pour obtenir la session de DB dans nos routes FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
