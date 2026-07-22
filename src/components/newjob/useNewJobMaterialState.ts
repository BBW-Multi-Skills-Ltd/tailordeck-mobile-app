import { useState } from 'react'
import type { MaterialQuality, MaterialSource } from './newJobConfig'

export function useNewJobMaterialState() {
  const [materialType, setMaterialType] = useState('')
  const [customMaterialType, setCustomMaterialType] = useState('')
  const [openMaterialCategory, setOpenMaterialCategory] = useState('local')
  const [materialColor, setMaterialColor] = useState('')
  const [materialYards, setMaterialYards] = useState('')
  const [materialQuality, setMaterialQuality] = useState<MaterialQuality>('Normal')
  const [materialSource, setMaterialSource] = useState<MaterialSource>('Client is Providing Material')

  return {
    customMaterialType,
    materialColor,
    materialQuality,
    materialSource,
    materialType,
    materialYards,
    openMaterialCategory,
    setCustomMaterialType,
    setMaterialColor,
    setMaterialQuality,
    setMaterialSource,
    setMaterialType,
    setMaterialYards,
    setOpenMaterialCategory,
  }
}
