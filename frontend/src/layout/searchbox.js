import { useState, useRef, useEffect } from "react";
import namesAndIds from "../namesAndIds";
import * as Ariakit from "@ariakit/react";
import "../css/searchbox.css";

export default function SearchBox() {
  const comboboxStore = Ariakit.useComboboxStore();
  const [selectedValue, setSelectedValue] = useState(null);

  // We can observe the store's "value" state directly. This returns what the user typed.
  const searchValue = comboboxStore.useState("value");

  // Filter your array based on the searchValue
  const filteredNames = namesAndIds.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Create a ref for focusing on hotkey press
  const comboboxRef = useRef(null);

  // Hotkey for "/"
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isTypingElsewhere =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable;

      if (!isTypingElsewhere && event.key === "/") {
        event.preventDefault();
        comboboxRef.current?.focus();
        comboboxStore.setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [comboboxStore]);

  const handleSelect = (value) => {
    setSelectedValue(value);
    const selectedItem = namesAndIds.find((item) => item.name === value);
    if (selectedItem) {
      window.location.href = `/subsystem/${selectedItem.id}`;
    }
  };

  return (
    <Ariakit.ComboboxProvider store={comboboxStore} id ="searchbox">
      {/* Attach ref for focusing */}
      <Ariakit.Combobox
        ref={comboboxRef}
        store={comboboxStore}
        placeholder='Use "/" to search'
        className="combobox searchbox"
      />
      <Ariakit.ComboboxPopover
        store={comboboxStore}
        gutter={4}
        sameWidth
        className="popover searchbox"
      >
        {/* Map over the filtered array instead of the original */}
        {filteredNames.length === 0 ? <Ariakit.ComboboxItem>No results</Ariakit.ComboboxItem> :
          filteredNames.map((item) => (
          <Ariakit.ComboboxItem
            key={item.id}
            value={item.name}
            onClick={() => handleSelect(item.name)}
            className={
              "combobox-item" + (selectedValue === item.name ? " selected" : "")
            }
          >
            {item.name}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
