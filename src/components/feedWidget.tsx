import type { mastodon } from "masto";
import { useEffect, useState } from "react";
import { useMastoClient } from "../helpers/mastodonHelpers";
import { Status } from "./status";

interface FeedWidgetProps {
  accountId: string;
}

export function FeedWidget(props: FeedWidgetProps) {
  const { accountId } = props;
  const client = useMastoClient();
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);

  useEffect(() => {
    setIsLoading(true);
    if (!client) {
      return;
    }

    client.v1.accounts
      .listStatuses(accountId, {
        limit: 30,
        excludeReplies: true,
        excludeReblogs: false,
      })
      .then((res) => {
        setStatuses(res);
        setIsLoading(false);
      });
  }, [accountId, client]);

  function renderContent() {
    if (isLoading) {
      return <p className="prose p-3">Loading...</p>;
    }
    if (statuses.length === 0) {
      return (
        <p className="prose p-3">
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
    <div className="flex flex-col overflow-y-scroll">{renderContent()}</div>
  );
}
