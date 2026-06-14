from sqlalchemy.orm import Session
from database import SessionLocal
import models
import auth

def create_or_fix_admin():
    db = SessionLocal()
    try:
        print("Recherche de l'administrateur LUKO...")
        admin = db.query(models.User).filter(models.User.username == "LUKO").first()
        
        hashed_pw = auth.hash_password("LUKO123")
        
        if not admin:
            print("LUKO n'existe pas. Création en cours...")
            admin = models.User(
                username="LUKO",
                email="admin@luko.com",
                hashed_password=hashed_pw,
                is_admin=True,
                is_active=True
            )
            db.add(admin)
            print("-> Administrateur créé avec succès.")
        else:
            print("LUKO existe déjà. Mise à jour des droits et du mot de passe...")
            admin.is_admin = True
            admin.is_active = True
            admin.hashed_password = hashed_pw
            print("-> Droits et mot de passe mis à jour.")
        
        db.commit()
        print("\nVous pouvez maintenant vous connecter avec :")
        print("Nom d'utilisateur : LUKO")
        print("Mot de passe : LUKO123")
        
    except Exception as e:
        print(f"Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_or_fix_admin()
