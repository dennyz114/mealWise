const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: '#FAECE7', text: '#712B13' },  // A-C: Coral
  { bg: '#EAF3DE', text: '#27500A' },  // D-F: Green
  { bg: '#FAEEDA', text: '#633806' },  // G-I: Amber
  { bg: '#E1F5EE', text: '#085041' },  // J-L: Teal
  { bg: '#E6F1FB', text: '#0C447C' },  // M-O: Blue
  { bg: '#EEEDFE', text: '#534AB7' },  // P-R: Purple
  { bg: '#FBEAF0', text: '#72243E' },  // S-U: Pink
  { bg: '#EEEDFE', text: '#534AB7' },  // V-Z: Accent
]

const DEFAULT_COLOR: { bg: string; text: string } = { bg: '#EEEDFE', text: '#534AB7' }

export const getAvatarColor = (name: string): { bg: string; text: string } => {
  const first = name.charAt(0).toUpperCase()
  const code = first.charCodeAt(0)

  if (code < 65 || code > 90) return DEFAULT_COLOR

  const index = Math.min(Math.floor((code - 65) / 3), AVATAR_COLORS.length - 1)
  const color = AVATAR_COLORS[index]
  return color ?? DEFAULT_COLOR
}
