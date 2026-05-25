// chaines.data.js — Données partagées entre les deux composants
// Plus tard : remplacer par fetch("GET /api/chaines")

export const CHAINES = [
  {
    id: 1, initials: "SKY", nom: "Skyrock",
    genre: "Hip-Hop / Rap", auditeurs: "1.2M",
    couleur: "bg-red-500",
    description: "La radio Hip-Hop N°1 en France",
    stats: [{ val: "1.2M", label: "Auditeurs" }, { val: "47", label: "Émissions" }, { val: "#1", label: "Classement" }],
    programme: [
      { heure: "20:00", nom: "Planète Rap",     desc: "Booska-P & Difool", maintenant: true  },
      { heure: "22:00", nom: "La Nuit Skyrock", desc: "Mix DJ",             maintenant: false },
      { heure: "00:00", nom: "Le Skyrock Mix",  desc: "Best of Hip-Hop",    maintenant: false },
    ],
  },
  {
    id: 2, initials: "NRJ", nom: "NRJ",
    genre: "Pop / Hits", auditeurs: "980K",
    couleur: "bg-orange-500",
    description: "La radio des hits du moment",
    stats: [{ val: "980K", label: "Auditeurs" }, { val: "32", label: "Émissions" }, { val: "#2", label: "Classement" }],
    programme: [
      { heure: "06:00", nom: "Le 6/9",     desc: "Manu Levy",    maintenant: true  },
      { heure: "09:00", nom: "NRJ Matin",  desc: "Morning show", maintenant: false },
      { heure: "12:00", nom: "NRJ Midi",   desc: "Best of hits", maintenant: false },
    ],
  },
  {
    id: 3, initials: "RTL", nom: "RTL",
    genre: "Info / Talk", auditeurs: "870K",
    couleur: "bg-blue-500",
    description: "L'info en continu 24h/24",
    stats: [{ val: "870K", label: "Auditeurs" }, { val: "28", label: "Émissions" }, { val: "#3", label: "Classement" }],
    programme: [
      { heure: "07:00", nom: "RTL Matin",    desc: "Marc-Olivier Fogiel", maintenant: true  },
      { heure: "09:00", nom: "RTL Midi",     desc: "Yves Calvi",          maintenant: false },
      { heure: "20:00", nom: "RTL Soir",     desc: "Journal du soir",     maintenant: false },
    ],
  },
  {
    id: 4, initials: "OUI", nom: "Oui FM",
    genre: "Rock", auditeurs: "650K",
    couleur: "bg-green-500",
    description: "La référence Rock en France",
    stats: [{ val: "650K", label: "Auditeurs" }, { val: "20", label: "Émissions" }, { val: "#5", label: "Classement" }],
    programme: [
      { heure: "21:00", nom: "Rock en Stock", desc: "DJ Rock",    maintenant: true  },
      { heure: "23:00", nom: "Rock Night",    desc: "Best Rock",  maintenant: false },
    ],
  },
  {
    id: 5, initials: "JZ", nom: "Jazz Radio",
    genre: "Jazz / Lounge", auditeurs: "420K",
    couleur: "bg-purple-500",
    description: "Le meilleur du Jazz mondial",
    stats: [{ val: "420K", label: "Auditeurs" }, { val: "15", label: "Émissions" }, { val: "#8", label: "Classement" }],
    programme: [
      { heure: "22:00", nom: "Jazz Sessions", desc: "Claire Dupont", maintenant: true  },
      { heure: "00:00", nom: "Jazz Night",    desc: "Best of Jazz",  maintenant: false },
    ],
  },
];
