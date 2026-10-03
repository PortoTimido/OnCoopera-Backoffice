const categoryCardColors: Record<string, string> = {
  saude: '#C2A5E8',
  tratamento: '#B99AE7',
  nutricao: '#3DCCB5',
  'bem-estar': '#75D7C4',
  prevencao: '#FFE176',
  cuidadores: '#FFC96B',
}

const fallbackCategoryCardColor = '#9CA3AF'

function normalizeCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getArticleCategoryCardColor(categoryName?: string) {
  if (!categoryName) {
    return fallbackCategoryCardColor
  }

  return categoryCardColors[normalizeCategoryName(categoryName)] ?? fallbackCategoryCardColor
}
