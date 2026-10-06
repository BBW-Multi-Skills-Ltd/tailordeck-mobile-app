import { describe, expect, it } from 'vitest'
import { getBodyWearGroups } from '../newJobConstants'

const itemsFor = (...args: Parameters<typeof getBodyWearGroups>) => getBodyWearGroups(...args).flatMap((group) => group.items)

describe('body wear groups', () => {
  it('shows men and boys men-only plus unisex items', () => {
    expect(itemsFor('Male')).toContain('Agbada')
    expect(itemsFor('Male')).toContain('T-shirt')
    expect(itemsFor('Male')).not.toContain('Gown')
    expect(itemsFor('Boy')).toEqual(itemsFor('Male'))
  })

  it('shows women and girls women-only plus unisex items', () => {
    expect(itemsFor('Female')).toContain('Gown')
    expect(itemsFor('Female')).toContain('Trouser')
    expect(itemsFor('Female')).not.toContain('Agbada')
    expect(itemsFor('Girl')).toEqual(itemsFor('Female'))
  })

  it('shows everything when no single gender applies', () => {
    expect(itemsFor()).toEqual(expect.arrayContaining(['Agbada', 'Gown', 'T-shirt']))
  })
})
