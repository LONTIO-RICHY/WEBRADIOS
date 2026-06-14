
import auth
import models
from database import SessionLocal

def reset_password(username, new_password):
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.username == username).first()
    if user:
        user.hashed_password = auth.hash_password(new_password)
        db.commit()
        print(f"Le mot de passe de {username} a été mis à jour avec succès !")
    else:
        print(f"Utilisateur {username} introuvable.")
    db.close()

if __name__ == "__main__":
    reset_password("kessel", "kessel123")
