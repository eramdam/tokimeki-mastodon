import { Block } from "./block";

export function FollowingsLoadingIndicator() {
  return (
    <Block>
      <p className="prose dark:prose-invert">Loading your followings</p>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => {
          return (
            <div
              key={i}
              className="h-3 w-3 animate-pulse rounded-full bg-black/20 dark:bg-white/20"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          );
        })}
      </div>
    </Block>
  );
}