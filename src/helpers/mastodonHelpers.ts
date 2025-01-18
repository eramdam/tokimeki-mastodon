import type { TokimekiAccount } from "../store/common";

export function makeAccountName(account: TokimekiAccount) {
  return (
    account.displayName.trim() || account.username.trim() || account.acct.trim()
  );
}
