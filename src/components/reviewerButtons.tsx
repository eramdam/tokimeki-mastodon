import { isString } from "lodash-es";
import { useState } from "react";
import { Item, Section } from "react-stately";

import { useMastodon } from "../helpers/mastodonContext";
import { createMastodonList } from "../store/mastodonStore";
import { useMastodonLists } from "../store/mastodonStore";
import { useMastodonCurrentAccountListIds } from "../store/mastodonStore";
import { Button, SmallButton } from "./button";
import { MenuButton } from "./menu";
import { PopoverButton } from "./popover";
import { TextInput } from "./textField";

enum ItemKeysEnum {
  CREATE_LIST = "create-list",
  CANCEL = "cancel",
}

interface ReviewerButtonsProps {
  onUnfollowClick: () => void;
  onKeepClick: () => void;
  onUndoClick: () => void;
  onNextClick: () => void;
  onAddToList: (listId: string) => void;
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
    onAddToList,
    shouldSkipConfirmation,
    isFetching,
  } = props;
  const lists = useMastodonLists();
  const currentAccountListIds = useMastodonCurrentAccountListIds();
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isAddingToList, setIsAddingTolist] = useState(false);
  const [listName, setListName] = useState("");
  const { client } = useMastodon();

  const renderMenuButton = () => {
    if (isCreatingList) {
      return (
        <PopoverButton type="menu" label="Add to list" isOpen={isCreatingList}>
          <div className="m-4 mt-2 flex flex-col gap-2">
            <TextInput
              label="List name"
              onChange={setListName}
              value={listName}
              className="flex flex-col gap-2"
            />
            <SmallButton
              isStatic
              variant="primary"
              onPress={async () => {
                if (!client) {
                  return;
                }
                await createMastodonList(client, listName);
                setIsCreatingList(false);
                setIsAddingTolist(true);
                setListName("");
              }}
            >
              Create list
            </SmallButton>
            <SmallButton
              isStatic
              variant="secondary"
              onPress={async () => {
                setIsCreatingList(false);
                setIsAddingTolist(true);
                setListName("");
              }}
            >
              Cancel
            </SmallButton>
          </div>
        </PopoverButton>
      );
    }

    return (
      <MenuButton
        label="Add to list"
        onAction={(key) => {
          if (key === ItemKeysEnum.CANCEL) {
            return;
          }
          if (key === ItemKeysEnum.CREATE_LIST) {
            setIsCreatingList(true);
          } else if (isString(key)) {
            onAddToList(key);
            setIsAddingTolist(false);
          }
        }}
        onOpenChange={setIsAddingTolist}
        isOpen={isAddingToList}
      >
        <Section>
          {lists.map((list) => {
            return (
              <Item key={list.id} textValue={list.title}>
                {list.title}
                {currentAccountListIds?.includes(list.id) && (
                  <span className="ml-3 align-middle">✅</span>
                )}
              </Item>
            );
          })}
        </Section>
        <Section>
          <Item key={ItemKeysEnum.CREATE_LIST}>Create new list...</Item>
          <Item key={ItemKeysEnum.CANCEL}>Cancel</Item>
        </Section>
      </MenuButton>
    );
  };

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
          {renderMenuButton()}
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
