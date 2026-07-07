import { describe, it, expect } from 'vitest'
import { getAvatarColor } from './avatar'

describe('getAvatarColor', () => {
  it('returns coral for letters A-C', () => {
    expect(getAvatarColor('Alice')).toEqual({ bg: '#FAECE7', text: '#712B13' })
    expect(getAvatarColor('Bob')).toEqual({ bg: '#FAECE7', text: '#712B13' })
    expect(getAvatarColor('Charlie')).toEqual({ bg: '#FAECE7', text: '#712B13' })
  })

  it('returns green for letters D-F', () => {
    expect(getAvatarColor('David')).toEqual({ bg: '#EAF3DE', text: '#27500A' })
    expect(getAvatarColor('Emma')).toEqual({ bg: '#EAF3DE', text: '#27500A' })
    expect(getAvatarColor('Frank')).toEqual({ bg: '#EAF3DE', text: '#27500A' })
  })

  it('returns amber for letters G-I', () => {
    expect(getAvatarColor('Grace')).toEqual({ bg: '#FAEEDA', text: '#633806' })
    expect(getAvatarColor('Henry')).toEqual({ bg: '#FAEEDA', text: '#633806' })
    expect(getAvatarColor('Iris')).toEqual({ bg: '#FAEEDA', text: '#633806' })
  })

  it('returns teal for letters J-L', () => {
    expect(getAvatarColor('Jack')).toEqual({ bg: '#E1F5EE', text: '#085041' })
    expect(getAvatarColor('Karen')).toEqual({ bg: '#E1F5EE', text: '#085041' })
    expect(getAvatarColor('Luis')).toEqual({ bg: '#E1F5EE', text: '#085041' })
  })

  it('returns blue for letters M-O', () => {
    expect(getAvatarColor('Marla')).toEqual({ bg: '#E6F1FB', text: '#0C447C' })
    expect(getAvatarColor('Nancy')).toEqual({ bg: '#E6F1FB', text: '#0C447C' })
    expect(getAvatarColor('Oscar')).toEqual({ bg: '#E6F1FB', text: '#0C447C' })
  })

  it('returns purple for letters P-R', () => {
    expect(getAvatarColor('Paul')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
    expect(getAvatarColor('Quinn')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
    expect(getAvatarColor('Rachel')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
  })

  it('returns pink for letters S-U', () => {
    expect(getAvatarColor('Sam')).toEqual({ bg: '#FBEAF0', text: '#72243E' })
    expect(getAvatarColor('Tina')).toEqual({ bg: '#FBEAF0', text: '#72243E' })
    expect(getAvatarColor('Uma')).toEqual({ bg: '#FBEAF0', text: '#72243E' })
  })

  it('returns accent for letters V-Z', () => {
    expect(getAvatarColor('Victor')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
    expect(getAvatarColor('Wendy')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
    expect(getAvatarColor('Zara')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
  })

  it('handles lowercase names', () => {
    expect(getAvatarColor('alice')).toEqual({ bg: '#FAECE7', text: '#712B13' })
  })

  it('returns default color for non-alpha characters', () => {
    expect(getAvatarColor('123')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
    expect(getAvatarColor('')).toEqual({ bg: '#EEEDFE', text: '#534AB7' })
  })

  it('uses first character for color', () => {
    expect(getAvatarColor('Dennis')).toEqual({ bg: '#EAF3DE', text: '#27500A' })
    expect(getAvatarColor('Dennis García')).toEqual({ bg: '#EAF3DE', text: '#27500A' })
  })
})
