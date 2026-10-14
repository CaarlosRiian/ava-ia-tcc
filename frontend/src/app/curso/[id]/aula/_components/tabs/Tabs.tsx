"use client";

import { KeyboardEvent, ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  eager?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  ariaLabel: string;
  defaultTabId?: string;
  activeId?: string;
  onActiveChange?: (id: string) => void;
  className?: string;
  panelClassName?: string;
}

export default function Tabs({
  tabs,
  ariaLabel,
  defaultTabId,
  activeId: controlledId,
  onActiveChange,
  className = "w-full",
  panelClassName = "p-5 lg:p-8",
}: TabsProps) {
  const baseId = useId();
  const [internalId, setInternalId] = useState(defaultTabId ?? tabs[0]?.id);
  const activeId = controlledId ?? internalId;

  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([activeId, ...tabs.filter((t) => t.eager).map((t) => t.id)])
  );
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setVisited((prev) => (prev.has(activeId) ? prev : new Set(prev).add(activeId)));
  }, [activeId]);

  const selectTab = useCallback(
    (id: string, moveFocus = false) => {
      setInternalId(id);
      onActiveChange?.(id);
      const button = buttonRefs.current[id];
      if (moveFocus) button?.focus();
      button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    },
    [onActiveChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (e.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index - 1 + tabs.length) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    e.preventDefault();
    selectTab(tabs[next].id, true);
  };

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  return (
    <div className={className}>
      <div className="border-b border-gray-200 px-2 sm:px-4 shrink-0 bg-white">
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(el) => { buttonRefs.current[tab.id] = el; }}
                id={tabId(tab.id)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId(tab.id)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`shrink-0 whitespace-nowrap px-4 py-3.5 -mb-px text-sm font-semibold border-b-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F52E0] focus-visible:ring-inset rounded-t-lg ${
                  isActive
                    ? "border-[#FF7A00] text-[black]"
                    : "border-transparent text-gray-500 hover:text-[#161B1D]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            id={panelId(tab.id)}
            role="tabpanel"
            aria-labelledby={tabId(tab.id)}
            hidden={!isActive}
            tabIndex={0}
            className={`${panelClassName} focus:outline-none ${isActive ? "animate-in fade-in duration-200" : ""}`}
          >
            {visited.has(tab.id) || isActive ? tab.content : null}
          </div>
        );
      })}
    </div>
  );
}