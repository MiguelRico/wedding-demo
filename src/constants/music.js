export const MUSIC_MOMENTS = [
  ["guest-arrival", "Llegada de los invitados", "Música ambiental", "UsersRound"],
  ["groom-entrance", "Entrada del novio", "Canción elegida", "LogIn"],
  ["bride-entrance", "Entrada de la novia", "Canción principal", "Heart"],
  ["readings", "Lecturas", "Música suave (opcional)", "BookOpen"],
  ["rings", "Intercambio de alianzas", "Música instrumental", "Gem"],
  ["signing", "Firma de los documentos", "Canción elegida", "PenLine"],
  ["newlyweds-exit", "Salida de los novios", "Canción alegre", "DoorOpen"],
  ["cocktail", "Cóctel", "Playlist relajada", "GlassWater"],
  ["banquet-entrance", "Entrada al banquete", "Canción de presentación", "UtensilsCrossed"],
  ["salon-entrance", "Entrada de los novios al salón", "Canción especial", "Music"],
  ["cake", "Corte de la tarta", "Canción elegida", "CakeSlice"],
  ["first-dance", "Primer baile", "Canción de apertura", "Disc3"],
  ["open-bar", "Apertura de la barra libre", "Canción potente para arrancar la fiesta", "PartyPopper"],
  ["special-moments", "Momentos especiales (ramo, regalos, etc.)", "Canciones específicas", "Gift"],
  ["end-party", "Fin de la fiesta", "Última canción", "Flag"],
].map(([id, label, description]) => ({ id, label, description }));

export const getMusicMoment = (id) => MUSIC_MOMENTS.find((moment) => moment.id === id);
