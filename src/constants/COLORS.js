// Paleta de cores do Inatelinos.
// Todas as cores derivam do azul institucional do Inatel (#1E60AD),
// variando luminosidade/saturação sobre o mesmo matiz (~212°).
const COLORS = {
  // Escala da cor primária (do mais claro ao mais escuro)
  blue50: "#E8F0F9",
  blue100: "#C6DBF1",
  blue200: "#9CC0E6",
  blue300: "#6FA3D9",
  blue400: "#4581C4",
  blue500: "#1E60AD", // Azul Inatel — cor primária da marca
  blue600: "#1A5293",
  blue700: "#154379",
  blue800: "#10345E",
  blue900: "#0B2440",

  // Papéis semânticos
  primary: "#1E60AD", // botões e ações principais
  primaryDark: "#154379", // estados pressionados / fundos de destaque
  accent: "#4581C4", // ícones e elementos ativos
  link: "#6FA3D9", // links e textos de ação sobre fundo escuro
  highlight: "#7FD4FF", // brilho/realce (ex.: anel de stories)

  // Gradiente do anel de stories (substitui o gradiente do Instagram)
  storyGradient: ["#1E60AD", "#4581C4", "#7FD4FF"],

  // Neutros do tema escuro
  black: "#000000",
  surface: "#111111",
  border: "#444444",
  textPrimary: "#FFFFFF",
  textSecondary: "#BBBBBB",
  textMuted: "#777777",

  // Estados
  error: "#FF3333",
  like: "#FF3250",
  success: "#33BB33",
};

export default COLORS;
