// src/theme/typography.ts
export type FontWeight = '400' | '500' | '600' | '700';

export const typography = {
  fontFamily: 'Inter', // assuming Inter is linked in the project
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as FontWeight },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: '600' as FontWeight },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as FontWeight },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as FontWeight },
  button: { fontSize: 15, lineHeight: 22, fontWeight: '500' as FontWeight },
};
