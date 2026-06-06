from pydantic import BaseModel, EmailStr


# Ce que le frontend envoie
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Ce que le backend renvoie après création
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

# Ce que l'utilisateur envoie pour se connecter
class UserLogin(BaseModel):
    username: str
    password: str

# Ce que le serveur renvoie quand la connexion réussit
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

    # Ce que le front envoie pour créer une émission
class EmissionCreate(BaseModel):
    title: str
    description: str

# Ce que le serveur renvoie
class EmissionResponse(BaseModel):
    id: int
    title: str
    description: str
    is_live: bool
    creator_id: int

    class Config:
        from_attributes = True



