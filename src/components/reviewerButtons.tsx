import { Item, Section } from "react-stately";

import { useLists } from "../store/selectors";
import { Button } from "./button";
import { MenuButton } from "./menu";

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
  const lists = useLists();

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
          <MenuButton label="Add to list" onAction={(key) => alert(key)}>
            <Section key={"lists"}>
              {lists.map((list) => {
                return <Item key={list.id}>{list.title}</Item>;
              })}
            </Section>
            <Section key={"actions"}>
              <Item key="create-list">Create new list...</Item>
              <Item key="cancel">Cancel</Item>
            </Section>
          </MenuButton>
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
