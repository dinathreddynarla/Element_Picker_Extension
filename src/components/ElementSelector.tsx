import React, { useEffect, useState } from "react";
import { getCurrentTab } from "../utils/helper";

const ElementSelector: React.FC = () => {
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const [tabId, setTabId] = useState<number>();

  useEffect(() => {
    updateToggleState();
  }, []);

  const updateToggleState = async () => {
    const tabId = await getCurrentTab();
    if (tabId !== null) {
      setTabId(tabId);
      chrome.storage.local.get(
        [`toggle_${tabId}`],
        (result: Record<string, boolean>) => {
          setIsToggled(result[`toggle_${tabId}`] ?? false);
        }
      );
    }
  };
  const toggleSelector = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    chrome.storage.local.set({ [`toggle_${tabId}`]: newState });
  };

  return (
    <div className="extension">
      <h2>Element Selector</h2>
      <button
        onClick={toggleSelector}
        style={{ backgroundColor: isToggled ? "red" : "green", color: "white" }}
      >
        {isToggled ? "Stop" : "Start"}
      </button>
    </div>
  );
};

export default ElementSelector;
