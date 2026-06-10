from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relations
    emissions = relationship("Emission", back_populates="creator")
    tracks = relationship("Track", back_populates="owner") # Ajouté : les musiques de l'utilisateur


class Emission(Base):
    __tablename__ = "emissions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    is_live = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="emissions")


# NOUVELLE TABLE : Pour stocker les fichiers MP3 sur le serveur
class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False) # Chemin du fichier sur le serveur (ex: uploads/music1.mp3)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tracks")
