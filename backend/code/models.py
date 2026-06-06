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

    # Relation : Un utilisateur peut avoir plusieurs émissions
    emissions = relationship("Emission", back_populates="creator")


class Emission(Base):
    __tablename__ = "emissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    is_live = Column(Boolean, default=False) # True si l'utilisateur diffuse actuellement
    
    # Clé étrangère pour lier l'émission à son créateur (User)
    creator_id = Column(Integer, ForeignKey("users.id"))

    # Relation inverse
    creator = relationship("User", back_populates="emissions")

