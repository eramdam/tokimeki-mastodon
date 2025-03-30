import { ReviewTypes } from "../store";
import { Block } from "./block";

export function AccountsLoadingIndicator(props: { reviewType: ReviewTypes }) {
  const renderText = () => {
    if (props.reviewType === ReviewTypes.FOLLOWINGS) {
      return <p className="custom-prose">Loading your followings</p>;
    }

    return <p className="custom-prose">Loading your follow requests</p>;
  };
  return (
    <Block className="text-center lg:max-w-md">
      {renderText()}
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
