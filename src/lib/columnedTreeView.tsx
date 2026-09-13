import { useEffect, useRef, useState } from "react";
import { TreeView, TreeViewProps } from "./treeView";
import { VirtualScrollRef } from "./virtualScroll";

const FIRST_COLUMN_KEY = "$firstColumn$";

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
  const { columns, columnWidth: firstColumnWidth = 100 } = props;
  const columnsEntries = Object.entries(columns);
  const columnKeys = [
    FIRST_COLUMN_KEY,
    ...columnsEntries.map(([key]) => key),
  ];

  const [columnWidths, setColumnWidths] = useState(() =>
    Object.fromEntries<number>([
      [FIRST_COLUMN_KEY, firstColumnWidth],
      ...columnsEntries.map(([key, val]) => [key, val!.width] as const),
    ])
  );
  const [grabbedColumn, setGrabbedColumn] = useState<string | null>(null);
  const pointerXRef = useRef(0);
  const treeViewRef = useRef<VirtualScrollRef>(null);

  const renderResizeHandle = (columnKey: string) => (
    <div
      data-grabbed={grabbedColumn === columnKey}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerXRef.current = event.clientX;
        setGrabbedColumn(columnKey);
      }}
      onPointerMove={(event) => {
        if (grabbedColumn !== columnKey) return;
        const offset = event.clientX - pointerXRef.current;
        pointerXRef.current = event.clientX;
        setColumnWidths((widths) => ({
          ...widths,
          [columnKey]: Math.max(0, widths[columnKey] + offset),
        }));
      }}
      onPointerUp={() => setGrabbedColumn(null)}
      onLostPointerCapture={() => setGrabbedColumn(null)}
      style={{
        position: "absolute",
        top: 0,
        right: -4,
        width: 8,
        height: "100%",
        cursor: "col-resize",
        touchAction: "none",
        zIndex: 1,
      }}
    />
  );

  useEffect(() => {
    treeViewRef.current?.updateVisible();
  }, [columnWidths]);

  return (
    <div style={{ position: "relative" }}>
      {grabbedColumn != null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: columnKeys
              .slice(0, columnKeys.indexOf(grabbedColumn) + 1)
              .reduce((sum, key) => sum + columnWidths[key], 0),
            width: 1,
            background: "blue",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: columnWidths[FIRST_COLUMN_KEY],
            flexShrink: 0,
            border: "1px solid black",
            position: "relative",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          file
          {columnsEntries.length > 0 && renderResizeHandle(FIRST_COLUMN_KEY)}
        </div>
        {columnsEntries.map(([key, val], index) => (
          <div
            key={key}
            style={{
              border: "1px solid black",
              height: "100%",
              position: "relative",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
              width:
                index == Object.keys(columns).length - 1
                  ? ""
                  : columnWidths[key],
              ...(index == Object.keys(columns).length - 1 ? { flex: 1 } : {}),
            }}
          >
            {val?.title}
            {index < columnsEntries.length - 1 && renderResizeHandle(key)}
          </div>
        ))}
      </div>
      <TreeView
        {...props}
        ref={treeViewRef}
        columnWidth={columnWidths[FIRST_COLUMN_KEY]}
        renderRowContentToTheRight={(node) => {
          return columnsEntries.map(([key, val], index) => (
            <div
              key={key}
              style={{
                borderLeft: "1px solid black",
                height: "100%",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width:
                  index === columnsEntries.length - 1
                    ? undefined
                    : columnWidths[key],
                ...(index === columnsEntries.length - 1
                  ? { flex: 1 }
                  : { flexShrink: 0 }),
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
