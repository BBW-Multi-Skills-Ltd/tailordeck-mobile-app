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
    options: ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2', '2.25', '2.5', '2.75', '3'],
  },
  {
    id: 'standard',
    title: 'Standard Jobs',
    options: ['3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'],
  },
  {
    id: 'large',
    title: 'Large Jobs',
    options: ['10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24', '25'],
  },
  {
    id: 'bulk',
    title: 'Bulk Jobs',
    options: ['30', '35', '40', '45', '50', '60', '70', '80', '90', '100', '120', '150'],
  },
]
