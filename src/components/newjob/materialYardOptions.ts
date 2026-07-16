export type MaterialYardCategory = {
  id: string
  title: string
  options: string[]
}

export const commonMaterialYards = ['2', '3', '4', '5', '6', '8']

export const materialYardCategories: MaterialYardCategory[] = [
  {
    id: 'small',
    title: 'Small Jobs',
    options: ['1', '1.5', '2', '2.5', '3'],
  },
  {
    id: 'standard',
    title: 'Standard Jobs',
    options: ['4', '5', '6', '7', '8'],
  },
  {
    id: 'large',
    title: 'Large Jobs',
    options: ['10', '12', '15', '18', '20'],
  },
  {
    id: 'bulk',
    title: 'Bulk Jobs',
    options: ['25', '30', '40', '50', '100'],
  },
]
