import { useRef, useState } from "react";
import { VirtualScroll, VirtualScrollRef } from "../lib/virtualScroll";
import { TreeView } from "../lib/treeView";
import { previewForest } from "./previewForest";

export const PreviewApp = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const virtualScrollRef = useRef<VirtualScrollRef>(null);

  return (
    <>
      {/* <div style={{ height: "30vh" }}>
        <VirtualScroll
          ref={virtualScrollRef}
          renderRow={(index) => (
            <span>
              <input
                type="checkbox"
                onChange={(e) => {
                  setChecked((checked) => ({
                    ...checked,
                    [index]: !!e.target.checked,
                  }));
                  virtualScrollRef.current?.updateVisible();
                }}
                checked={!!checked[index]}
              />
              Hello world! {index}
            </span>
          )}
          rowsNum={200}
          outerDivStyle={{ height: "100%" }}
        ></VirtualScroll>
      </div> */}
      <div style={{ height: "100%" }}>
        <TreeView<string>
          forest={previewForest}
          renderRowContent={(node) => (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {node.data}
            </div>
          )}
          outerDivStyle={{ height: 600 }}
        ></TreeView>
      </div>
    </>
  );
};
