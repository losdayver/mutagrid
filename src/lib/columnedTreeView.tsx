import { useEffect, useRef, useState } from "react";
import { TreeView, TreeViewProps } from "./treeView";
import { VirtualScrollRef } from "./virtualScroll";

export interface ColumnedTreeViewProps<
  Data extends Record<string, unknown>,
> extends TreeViewProps<Data> {
  columns: Partial<{
    [Key in keyof Data]: {
      title: string;
      width: number;
    };
  }>;
}

export const ColumnedTreeView = <Data extends Record<string, unknown>>(
  props: ColumnedTreeViewProps<Data>
) => {
  const { columns, columnWidth = 100 } = props;

  const columnsEntries = Object.entries(columns);

  const [columnWidths, setColumnWidths] = useState<number[]>([
    columnWidth,
    ...columnsEntries.map((col) => col[1]!.width),
  ]);
  const treeViewRef = useRef<VirtualScrollRef>(null);

  useEffect(() => {
    setInterval(
      () => setColumnWidths((columns) => [columns[0] + 5, columns[1]]),
      100
    );
  }, []);

  useEffect(() => {
    treeViewRef.current?.updateVisible();
  }, [columnWidths]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ minWidth: columnWidths[0], border: "1px solid black" }}>
          file
        </div>
        {columnsEntries.map(([key, val], index) => (
          <div
            key={key}
            style={{
              border: "1px solid black",
              height: "100%",
              width:
                index == Object.keys(columns).length - 1
                  ? ""
                  : columnWidths[index],
              ...(index == Object.keys(columns).length - 1 ? { flex: 1 } : {}),
            }}
          >
            {val?.title}
          </div>
        ))}
      </div>
      <TreeView
        {...props}
        ref={treeViewRef}
        columnWidth={columnWidths[0]}
        renderRowContentToTheRight={(node) => {
          return columnsEntries.map(([key, val], index) => (
            <div
              key={key}
              style={{
                borderLeft: "1px solid black",
                height: "100%",
                width: columnWidths[index],
              }}
            >
              {JSON.stringify(node.data[key]) as any}
            </div>
          ));
        }}
      />
    </div>
  );
};
