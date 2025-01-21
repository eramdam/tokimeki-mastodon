import clsx from "clsx";
import type { mastodon } from "masto";
import { useEffect, useMemo, useState } from "react";

import { useMastodon } from "../helpers/mastodonContext";
import type { TokimekiAccount } from "../store/common";
import { useMastodonInstanceUrl } from "../store/mastodonStore";
import { useMastodonCurrentAccountRelationship } from "../store/mastodonStore";
import { Status } from "./status";

interface FeedWidgetProps {
  account?: TokimekiAccount;
  className?: string;
}

export function MastodonFeedWidget(props: FeedWidgetProps) {
  const { account } = props;
  const { client } = useMastodon();
  const [isLoading, setIsLoading] = useState(true);
  const currentAccountRelationship = useMastodonCurrentAccountRelationship();
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);
  const instanceUrl = useMastodonInstanceUrl();
  const isRemote = useMemo(() => {
    return !(instanceUrl && account?.url.startsWith(instanceUrl));
  }, [account?.url, instanceUrl]);

  useEffect(() => {
    setIsLoading(true);
    if (!client || !account || !currentAccountRelationship) {
      return;
    }

    const statusesPromise = client.v1.accounts
      .$select(account.id)
      .statuses.list({
        limit: 40,
        excludeReplies: true,
        excludeReblogs: !currentAccountRelationship.showingReblogs,
      });

    statusesPromise.then((res) => {
      setStatuses(res.slice(0, 20));
      setIsLoading(false);
    });
  }, [account, client, currentAccountRelationship]);

  function renderContent() {
    if (isLoading || !account) {
      return <p className="custom-prose p-2 text-center">Loading...</p>;
    }
    if (statuses.length === 0) {
      if (isRemote) {
        return (
          <p className="custom-prose p-2 text-center">
            Older posts are not available for remote users.
            <br />
            <a href={account.url} target="_blank" rel="noreferrer noopener">
              Browse original profile
            </a>
          </p>
        );
      }

      return (
        <p className="custom-prose p-2">
          It seems this user has not posted anything yet!
        </p>
      );
    }

    return statuses.map((status) => {
      const statusToUse = status.reblog || status;

      return (
        <Status
          key={status.id}
          booster={status.reblog ? status.account : undefined}
          status={statusToUse}
        ></Status>
      );
    });
  }

  return (
    <div
      className={clsx(
        "flex min-h-[400px] min-w-full flex-col overflow-y-scroll",
        props.className,
      )}
    >
      {renderContent()}
    </div>
  );
}
