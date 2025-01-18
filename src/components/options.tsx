import { useState } from "react";

import { SortOrders } from "../store/mainStore";
import { reorderFollowings, updateSettings } from "../store/actions";
import { useSettings } from "../store/selectors";
import { LinkButton } from "./linkButton";
import { Radio, RadioGroup } from "./radioGroup";

export function Options() {
  const { showBio, sortOrder, showFollowLabel, showNote, skipConfirmation } =
    useSettings();

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="custom-prose w-full">
      <h3 className="!mt-2">Options</h3>
      <div>
        <label>
          <input
            type="checkbox"
            checked={Boolean(showBio)}
            onChange={() => {
              updateSettings({
                showBio: !showBio,
              });
            }}
          />{" "}
          <strong>Show account bio</strong> (Recommended: off)
        </label>
        <p className="!mt-0">
          I&apos;ve followed a lot of accounts based on their profile or who
          they are, but not their actual tweets. Hide their bio so you can
          evaluate based on content only.
        </p>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={Boolean(showNote)}
            onChange={() => {
              updateSettings({
                showNote: !showNote,
              });
            }}
          />{" "}
          <strong>Show account notes</strong> (Recommended: off)
        </label>
        <p className="!mt-0">
          Account notes can be useful to remember why you followed someone. Hide
          their note so you can evaluate based on content only.
        </p>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={Boolean(showFollowLabel)}
            onChange={() => {
              updateSettings({
                showFollowLabel: !showFollowLabel,
              });
            }}
          />{" "}
          <strong>Show if account follows you</strong> (Recommended: off)
        </label>
        <p className="!mt-0">
          Show a badge indicating whether or not the account follows you.
        </p>
      </div>
      <RadioGroup
        className="mb-5"
        label={
          <>
            <strong>Select an order to use</strong> (Recommended: Oldest first)
          </>
        }
        value={sortOrder || SortOrders.OLDEST}
        onChange={(value) => {
          updateSettings({
            sortOrder: value as SortOrders,
          });
          reorderFollowings(value as SortOrders);
        }}
      >
        <Radio value={SortOrders.OLDEST}>
          Oldest first, chronological order
        </Radio>
        <Radio value={SortOrders.RANDOM}>Random order</Radio>
        <Radio value={SortOrders.NEWEST}>
          Newest first, reverse chronological order
        </Radio>
      </RadioGroup>

      {!showAdvanced && (
        <LinkButton
          className="text-accentColor"
          onPress={() => {
            setShowAdvanced(true);
          }}
        >
          Show advanced options...
        </LinkButton>
      )}
      {showAdvanced && (
        <>
          <h5 className="!mt-2">Advanced</h5>
          <div>
            <label>
              <input
                type="checkbox"
                checked={Boolean(skipConfirmation)}
                onChange={() => {
                  updateSettings({
                    skipConfirmation: !skipConfirmation,
                  });
                }}
              />{" "}
              <strong>Skip confirmation/undo step</strong> (Recommended: off)
            </label>
            <p className="!mt-0">
              Turn this on to skip the confirmation step after you click
              Unfollow/Keep. This will make the process faster, but you
              won&apos;t be able to undo your actions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
