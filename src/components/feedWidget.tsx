/* eslint-disable @next/next/no-img-element */
import type { mastodon } from "masto";
import { useEffect, useState } from "react";

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
        excludeReblogs: true,
      })
      .then(setStatuses);
  }, [accountId, client.v1.accounts]);

  return (
    <div
      style={{
        height: 800,
        width: 400,
      }}
      className="flex flex-col overflow-y-scroll"
    >
      {statuses.map((status) => {
        return (
          <a
            key={status.id}
            className="border-b-[1px] border-neutral-500 p-2 no-underline hover:bg-neutral-100"
            href={status.url || ""}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className="flex items-center gap-3 pt-2">
              <img
                alt={status.account.displayName}
                src={status.account.avatar}
                className="-mt-2 h-8 w-8 rounded-sm"
              />

              <div className="mb-2 flex flex-col gap-1 truncate">
                <span className="truncate text-base leading-tight">
                  {status.account.displayName}
                </span>
                <span className="truncate text-xs leading-tight">
                  {status.account.acct}
                </span>
              </div>
            </div>
            <p>{status.content}</p>
            {status.mediaAttachments.map((m) => {
              return <div key={m.id}>{m.previewUrl}</div>;
            })}
          </a>
        );
      })}
    </div>
  );
}
