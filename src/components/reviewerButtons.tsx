import { Button } from "./button";

interface ReviewerButtonsProps {
  onUnfollowClick: () => void;
  onKeepClick: () => void;
  onUndoClick: () => void;
  onNextClick: () => void;
  isVisible: boolean;
  shouldSkipConfirmation: boolean;
}
export function ReviewerButtons(props: ReviewerButtonsProps) {
  const {
    isVisible,
    onKeepClick,
    onNextClick,
    onUndoClick,
    onUnfollowClick,
    shouldSkipConfirmation,
  } = props;

  function renderContent() {
    if (isVisible) {
      return (
        <>
          <Button variant="secondary" onPress={() => onUnfollowClick()}>
            Unfollow
          </Button>
          <Button onPress={() => onKeepClick()} variant="secondary">
            Keep
          </Button>
        </>
      );
    }

    return (
      <>
        <Button variant="secondary" onPress={() => onUndoClick()}>
          Undo
        </Button>
        <Button onPress={() => onNextClick()} variant="secondary">
          Next
        </Button>
      </>
    );
  }
  if (shouldSkipConfirmation && !isVisible) {
    return null;
  }

  return (
    <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
      {renderContent()}
    </div>
  );
}
