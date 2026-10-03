import { resetTestAccount } from './cleanup'

export default async function globalSetup(): Promise<void> {
  await resetTestAccount()
}
