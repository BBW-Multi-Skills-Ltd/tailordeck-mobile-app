export type MaterialColorOption = {
  name: string
  hex: string
}

export type MaterialColorCategory = {
  id: string
  title: string
  options: MaterialColorOption[]
}

export const commonMaterialColors: MaterialColorOption[] = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Wine', hex: '#7B1E37' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Cream', hex: '#F4E8D5' },
]

export const materialColorCategories: MaterialColorCategory[] = [
  {
    id: 'neutral',
    title: 'Neutral Colors',
    options: [
      { name: 'Black', hex: '#111111' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Cream', hex: '#F4E8D5' },
      { name: 'Grey', hex: '#8C8C8C' },
      { name: 'Brown', hex: '#6B3F2A' },
    ],
  },
  {
    id: 'warm',
    title: 'Warm Colors',
    options: [
      { name: 'Red', hex: '#C62828' },
      { name: 'Wine', hex: '#7B1E37' },
      { name: 'Orange', hex: '#F97316' },
      { name: 'Gold', hex: '#C9A84C' },
      { name: 'Yellow', hex: '#FACC15' },
    ],
  },
  {
    id: 'cool',
    title: 'Cool Colors',
    options: [
      { name: 'Navy Blue', hex: '#1B2A4A' },
      { name: 'Royal Blue', hex: '#2563EB' },
      { name: 'Green', hex: '#118C5A' },
      { name: 'Purple', hex: '#7C3AED' },
      { name: 'Teal', hex: '#0F766E' },
    ],
  },
  {
    id: 'soft',
    title: 'Soft Colors',
    options: [
      { name: 'Pink', hex: '#F9A8D4' },
      { name: 'Peach', hex: '#FDBA74' },
      { name: 'Lilac', hex: '#C4B5FD' },
      { name: 'Sky Blue', hex: '#93C5FD' },
      { name: 'Mint', hex: '#A7F3D0' },
    ],
  },
]
