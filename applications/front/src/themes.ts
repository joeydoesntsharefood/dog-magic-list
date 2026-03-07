export const themes = {
  default: {
    name: 'D2D Terminal',
    colors: {
      background: 'bg-[#0A0A0A]', // Preto quase puro
      surface: 'bg-[#121212]', // Cinza escuro para áreas de destaque
      primary: 'text-[#E8DCCA]', // Creme pergaminho (Texto Principal)
      secondary: 'text-[#9E8C6A]', // Bronze (Texto de suporte / Labels)
      accent: 'bg-[#8A3A34]', // Vermelho Tattoo (Ações Críticas)
      accentText: 'text-[#E8DCCA]',
      border: 'border-[#1C1C1C]', // Bordas sutis
      inputBorder: 'border-[#2A2A2A]',
      highlight: 'border-[#9E8C6A]', // Bronze para foco
      muted: 'text-[#6E5C49]', // Marrom Couro para textos desativados
      success: 'text-[#4CAF50]',
      error: 'text-[#8A3A34]'
    },
    fonts: {
      mono: 'font-mono'
    }
  }
};

export type ThemeType = keyof typeof themes;
