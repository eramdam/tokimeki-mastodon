import type { mastodon } from "masto";
import { useEffect, useState } from "react";
import { Status } from "./status";

interface FeedWidgetProps {
  accountId: string;
  client: mastodon.Client;
}

export function FeedWidget(props: FeedWidgetProps) {
  const { client, accountId } = props;
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([]);

  useEffect(() => {
    client.v1.accounts
      .listStatuses(accountId, {
        limit: 10,
        excludeReplies: true,
        excludeReblogs: false,
      })
      .then(setStatuses);
  }, [accountId, client.v1.accounts]);

  function renderContent() {
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
    <div
      style={{
        height: 800,
        width: 400,
      }}
      className="flex flex-col overflow-y-scroll"
    >
      {renderContent()}
    </div>
  );
}
