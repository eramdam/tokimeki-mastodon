import type { TokimekiAccount } from "../store";

export function makeAccountName(account: TokimekiAccount) {
  return (
    account.displayName.trim() || account.username.trim() || account.acct.trim()
  );
}
