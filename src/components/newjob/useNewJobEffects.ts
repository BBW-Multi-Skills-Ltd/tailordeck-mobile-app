import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { MakeCategory, PersonForm } from './newJobConfig'

export function usePageNoScroll(active: boolean): void {
  useEffect(() => {
    const pageElement = document.querySelector('main.page')
    if (!pageElement) return

    if (active) {
      pageElement.classList.add('page-no-scroll')
    } else {
      pageElement.classList.remove('page-no-scroll')
    }

    return () => {
      pageElement.classList.remove('page-no-scroll')
    }
  }, [active])
}

export function useSharedItemTypeSync({
  makeCategory,
  sameItemForAll,
  itemType,
  setPersons,
}: {
  makeCategory: MakeCategory
  sameItemForAll: boolean
  itemType: string
  setPersons: Dispatch<SetStateAction<PersonForm[]>>
}): void {
  useEffect(() => {
    if (makeCategory !== 'Body Wear' || !sameItemForAll) return
    setPersons((prev) => prev.map((person) => ({ ...person, itemType })))
  }, [itemType, sameItemForAll, makeCategory, setPersons])
}
