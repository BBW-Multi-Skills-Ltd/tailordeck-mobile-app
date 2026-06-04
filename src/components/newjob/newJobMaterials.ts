import type { MaterialCategory } from './newJobTypes'

export const materialCategories: MaterialCategory[] = [
  {
    id: 'local',
    title: 'Local Materials',
    options: [
      { name: 'Ankara', description: 'Vibrant cotton fabric with rich, colourful patterns used for daily wear.' },
      { name: 'Lace', description: 'Embroidered mesh fabric used for premium traditional party wear.' },
      { name: 'Aso Oke', description: 'Thick, handwoven traditional fabric used for special family celebrations.' },
      { name: 'Adire', description: 'Beautifully patterned cotton cloth made using local indigo tie-dye methods.' },
      { name: 'Kampala', description: 'Colourful, locally hand-dyed cotton fabric for casual clothing.' },
      { name: 'Guinea Brocade', description: 'Crisp, polished cotton with subtle patterns woven into the fabric.' },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial Materials',
    options: [
      { name: 'Crepe', description: 'Smooth fabric with a textured, pebbled feel used for office gowns.' },
      { name: 'Scuba', description: 'Thick, stretchy fabric that gives clothes a structured and fitted shape.' },
      { name: 'Chiffon', description: 'Lightweight, see-through fabric used for flowing dresses and soft tops.' },
      { name: 'Cotton Jersey', description: 'Soft, highly stretchy material used for casual t-shirts and loungewear.' },
      { name: 'Linen', description: 'High-quality, breathable fabric perfect for hot weather and resort wear.' },
      { name: 'Polyester Blends', description: 'Long-lasting, wrinkle-free fabric ideal for everyday mass production.' },
    ],
  },
  {
    id: 'industrial',
    title: 'Industrial Materials',
    options: [
      { name: 'Khaki', description: 'Sturdy, heavyweight cotton fabric used for workwear and uniform trousers.' },
      { name: 'Denim', description: 'Strong, rugged cotton twill used to make durable jeans and jackets.' },
      { name: 'Gabardine', description: 'Tightly woven, durable fabric used for tailored corporate suits.' },
      { name: 'Reflective Polyester', description: 'High-visibility neon fabric used to make safety vests.' },
      { name: 'Canvas', description: 'Extreme heavy-duty cloth used for aprons, industrial bags, and shoes.' },
      { name: 'Drill', description: 'Tough cotton material used for heavy utility uniforms and overalls.' },
    ],
  },
  {
    id: 'international',
    title: 'International Materials',
    options: [
      { name: 'Satin', description: 'Glossy, smooth fabric with a shiny surface used for evening dresses.' },
      { name: 'Organza', description: 'Thin, stiff, see-through fabric used to create dramatic volume and ruffles.' },
      { name: 'Velvet', description: 'Soft, plush fabric with a thick pile used for luxury wear.' },
      { name: 'Tulle', description: 'Fine, delicate netting fabric used for bridal veils and dress layers.' },
      { name: 'Silk', description: 'Premium natural fabric loved for its high shine and soft drape.' },
      { name: 'Taffeta', description: 'Crisp, smooth fabric that holds its shape well for ballgowns.' },
      { name: 'Sequinned Netting', description: 'Mesh fabric covered in sparkling beads for glamorous party outfits.' },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    options: [{ name: 'Other Material', description: 'Click here to type your material if it is not listed above.' }],
  },
]

