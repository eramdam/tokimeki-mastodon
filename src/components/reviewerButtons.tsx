import { Button } from "./button";

interface ReviewerButtonsProps {
  onUnfollowClick: () => void;
  onKeepClick: () => void;
  onUndoClick: () => void;
  onNextClick: () => void;
  isVisible: boolean;
  shouldSkipConfirmation: boolean;
  isFetching: boolean;
}
export function ReviewerButtons(props: ReviewerButtonsProps) {
  const {
    isVisible,
    onKeepClick,
    onNextClick,
    onUndoClick,
    onUnfollowClick,
    shouldSkipConfirmation,
    isFetching,
  } = props;

  function renderContent() {
    if (isVisible) {
      return (
        <>
          <Button
            variant="secondary"
            onPress={() => onUnfollowClick()}
            isDisabled={isFetching}
          >
            Unfollow
          </Button>
          <Button
            onPress={() => onKeepClick()}
            variant="secondary"
            isDisabled={isFetching}
          >
            Keep
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          variant="secondary"
          onPress={() => onUndoClick()}
          isDisabled={isFetching}
        >
          Undo
        </Button>
        <Button
          onPress={() => onNextClick()}
          variant="secondary"
          isDisabled={isFetching}
        >
          Next
        </Button>
      </>
    );
  }
  if (shouldSkipConfirmation && !isVisible) {
    return null;
  }

  return (
    <div className="mt-2 inline-flex w-full justify-center gap-4 lg:-mb-8">
      {renderContent()}
    </div>
  );
}
