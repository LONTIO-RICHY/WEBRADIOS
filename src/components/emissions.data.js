// emissions.data.js — Données partagées entre EmissionsGauche et EmissionsDroite
// Plus tard : remplacer par fetch("GET /api/emissions")

export const EMISSIONS = [
  {
    id: 1, initials: "NRJ", nom: "Le 6/9",
    animateur: "Manu Levy", horaire: "06:00-09:00",
    genre: "Pop", couleur: "bg-orange-500", live: true,
    chaine: "NRJ", description: "Le morning show incontournable de NRJ avec Manu Levy. Musique, humour et bonne humeur pour bien commencer la journée.",
    animateurs: [
      { initials: "ML", nom: "Manu Levy",   role: "Présentateur principal", couleur: "bg-orange-500" },
      { initials: "SB", nom: "Sarah B",     role: "Co-animatrice",          couleur: "bg-pink-400"   },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "06:00 - 09:00", today: true  },
      { jour: "Demain",      heure: "06:00 - 09:00", today: false },
      { jour: "Mercredi",    heure: "06:00 - 09:00", today: false },
    ],
  },
  {
    id: 2, initials: "SKY", nom: "Planète Rap",
    animateur: "Booska-P", horaire: "20:00-22:00",
    genre: "Hip-Hop", couleur: "bg-red-500", live: true,
    chaine: "Skyrock", description: "Planète Rap est l'émission Hip-Hop de référence en France. Chaque soir, Booska-P et Difool reçoivent les plus grands artistes rap pour des interviews exclusives et des freestyles.",
    animateurs: [
      { initials: "BD", nom: "Booska-P", role: "Présentateur principal", couleur: "bg-red-500"    },
      { initials: "DF", nom: "Difool",   role: "Co-animateur",           couleur: "bg-orange-500" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "20:00 - 22:00", today: true  },
      { jour: "Demain",      heure: "20:00 - 22:00", today: false },
      { jour: "Mercredi",    heure: "20:00 - 22:00", today: false },
    ],
  },
  {
    id: 3, initials: "RTL", nom: "RTL Matin",
    animateur: "Marc-Olivier", horaire: "07:00-09:30",
    genre: "Info", couleur: "bg-blue-500", live: false,
    chaine: "RTL", description: "Le rendez-vous matinal de RTL avec toute l'actualité nationale et internationale présentée par Marc-Olivier Fogiel.",
    animateurs: [
      { initials: "MO", nom: "Marc-Olivier Fogiel", role: "Présentateur", couleur: "bg-blue-500" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "07:00 - 09:30", today: true  },
      { jour: "Demain",      heure: "07:00 - 09:30", today: false },
    ],
  },
  {
    id: 4, initials: "OUI", nom: "Rock en Stock",
    animateur: "DJ Rock", horaire: "21:00-23:00",
    genre: "Rock", couleur: "bg-green-500", live: false,
    chaine: "Oui FM", description: "Le meilleur du Rock classique et moderne chaque soir sur Oui FM.",
    animateurs: [
      { initials: "DR", nom: "DJ Rock", role: "Animateur", couleur: "bg-green-500" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "21:00 - 23:00", today: true  },
      { jour: "Demain",      heure: "21:00 - 23:00", today: false },
    ],
  },
  {
    id: 5, initials: "JZ", nom: "Jazz Sessions",
    animateur: "Claire Dupont", horaire: "22:00-00:00",
    genre: "Jazz", couleur: "bg-purple-500", live: false,
    chaine: "Jazz Radio", description: "Une plongée dans l'univers du jazz avec les meilleurs artistes du moment.",
    animateurs: [
      { initials: "CD", nom: "Claire Dupont", role: "Animatrice", couleur: "bg-purple-500" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "22:00 - 00:00", today: true  },
      { jour: "Demain",      heure: "22:00 - 00:00", today: false },
    ],
  },
  {
    id: 6, initials: "FUN", nom: "Club Fun",
    animateur: "DJ Antoine", horaire: "23:00-06:00",
    genre: "Électro", couleur: "bg-yellow-500", live: false,
    chaine: "Fun Radio", description: "La nuit électro de Fun Radio avec les meilleurs DJ internationaux.",
    animateurs: [
      { initials: "DA", nom: "DJ Antoine", role: "Animateur", couleur: "bg-yellow-500" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "23:00 - 06:00", today: true  },
      { jour: "Demain",      heure: "23:00 - 06:00", today: false },
    ],
  },
  {
    id: 7, initials: "FI", nom: "Journal 20H",
    animateur: "Laurence", horaire: "20:00-20:30",
    genre: "Info", couleur: "bg-blue-700", live: true,
    chaine: "France Info", description: "Le journal du soir de France Info avec toute l'actualité du jour présentée par Laurence.",
    animateurs: [
      { initials: "LR", nom: "Laurence", role: "Présentatrice", couleur: "bg-blue-700" },
    ],
    diffusions: [
      { jour: "Aujourd'hui", heure: "20:00 - 20:30", today: true  },
      { jour: "Demain",      heure: "20:00 - 20:30", today: false },
      { jour: "Mercredi",    heure: "20:00 - 20:30", today: false },
    ],
  },
];
