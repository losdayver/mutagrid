import { useRef, useState } from "react";
import { VirtualScroll, VirtualScrollRef } from "../lib/virtualScroll";
import { TreeView } from "../lib/treeView";
import { ColumnedTreeView } from "../lib/columnedTreeView";
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
        <ColumnedTreeView<{ dateCreated: Date; title: string }>
          forest={previewForest}
          renderRowTitle={(node) => (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: node.isFolder ? "#545454" : "#000",
              }}
            >
              {node.data.title}
            </div>
          )}
          renderRowContentToTheRight={(node) => (
            <div style={{ borderLeft: "1px solid black" }}></div>
          )}
          outerDivStyle={{ height: 600 }}
          rowHeight={30}
          leftPadStep={30}
          columnWidth={400}
          columns={{ dateCreated: { title: "Created at", width: 200 } }}
        ></ColumnedTreeView>
      </div>
    </>
  );
};
