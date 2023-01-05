import clsx from "clsx";
import type { mastodon } from "masto";
import { useEffect, useState } from "react";

import { useMastodon } from "../helpers/mastodonContext";
import { Status } from "./status";

interface FeedWidgetProps {
  accountId?: string;
  className?: string;
}

export function FeedWidget(props: FeedWidgetProps) {
  const { accountId } = props;
  const { client } = useMastodon();
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);

  useEffect(() => {
    setIsLoading(true);
    if (!client || !accountId) {
      return;
    }

    const statusesPromise = client.v1.accounts.listStatuses(accountId, {
      limit: 14,
      excludeReplies: true,
      excludeReblogs: false,
    });

    statusesPromise.then((res) => {
      setStatuses(res);
      setIsLoading(false);
    });
  }, [accountId, client]);

  function renderContent() {
    if (isLoading || !accountId) {
      return <p className="prose p-3 dark:prose-invert">Loading...</p>;
    }
    if (statuses.length === 0) {
      return (
        <p className="prose p-3 dark:prose-invert">
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
        props.className
      )}
    >
      {renderContent()}
    </div>
  );
}
