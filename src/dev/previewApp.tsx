import { useState } from "react";
import { VirtualScroll } from "../lib/mutagrid";

export const PreviewApp = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div style={{ height: "100vh" }}>
      <VirtualScroll
        renderRow={(index) => (
          <span>
            <input
              type="checkbox"
              onChange={(e) => {
                setChecked((checked) => ({
                  ...checked,
                  [index]: e.target.checked,
                }));
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
