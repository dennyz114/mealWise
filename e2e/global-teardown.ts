import { resetTestAccount } from './cleanup'

export default async function globalTeardown(): Promise<void> {
  await resetTestAccount()
}
