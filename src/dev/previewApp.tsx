import { useRef, useState } from "react";
import { VirtualScroll, VirtualScrollRef } from "../lib/mutagrid";

export const PreviewApp = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const virtualScrollRef = useRef<VirtualScrollRef>(null);

  return (
    <div style={{ height: "100vh" }}>
      <VirtualScroll
        ref={virtualScrollRef}
        renderRow={(index) => (
          <span>
            <input
              type="checkbox"
              onChange={(e) => {
                setChecked((checked) => ({
                  ...checked,
                  [index]: e.target.checked,
                }));
                virtualScrollRef.current?.updateVisible();
              }}
              checked={checked[index]}
            />
            Hello world! {index}
          </span>
        )}
        rowsNum={200}
        outerDivStyle={{ height: "100%" }}
      ></VirtualScroll>
    </div>
  );
};
