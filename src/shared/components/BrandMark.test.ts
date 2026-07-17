import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import BrandMark from './BrandMark.vue'

describe('BrandMark', () => {
  it('renders product name', () => {
    render(BrandMark)
    expect(screen.getByText('项目协作工作台')).toBeInTheDocument()
  })
})
