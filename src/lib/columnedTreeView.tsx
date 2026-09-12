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
  const [grabbedColumn, setGrabbedColumn] = useState<{
    index: number;
    startX: number;
    currentX: number;
    startWidth: number;
  } | null>(null);
  const treeViewRef = useRef<VirtualScrollRef>(null);

  const renderResizeHandle = (columnIndex: number) => (
    <div
      data-grabbed={grabbedColumn?.index === columnIndex}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setGrabbedColumn({
          index: columnIndex,
          startX: event.clientX,
          currentX: event.clientX,
          startWidth: columnWidths[columnIndex],
        });
      }}
      onPointerMove={(event) => {
        setGrabbedColumn((column) =>
          column?.index === columnIndex
            ? { ...column, currentX: event.clientX }
            : column
        );
      }}
      onPointerUp={(event) => {
        if (grabbedColumn?.index === columnIndex) {
          const width = Math.max(
            0,
            grabbedColumn.startWidth + event.clientX - grabbedColumn.startX
          );
          setColumnWidths((widths) =>
            widths.map((currentWidth, index) =>
              index === columnIndex ? width : currentWidth
            )
          );
        }
        setGrabbedColumn(null);
      }}
      onPointerCancel={() => setGrabbedColumn(null)}
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
      {grabbedColumn && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left:
              columnWidths
                .slice(0, grabbedColumn.index)
                .reduce((sum, width) => sum + width, 0) +
              Math.max(
                0,
                grabbedColumn.startWidth +
                  grabbedColumn.currentX -
                  grabbedColumn.startX
              ),
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
            width: columnWidths[0],
            flexShrink: 0,
            border: "1px solid black",
            position: "relative",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          file
          {columnsEntries.length > 0 && renderResizeHandle(0)}
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
                  : columnWidths[index + 1],
              ...(index == Object.keys(columns).length - 1 ? { flex: 1 } : {}),
            }}
          >
            {val?.title}
            {index < columnsEntries.length - 1 &&
              renderResizeHandle(index + 1)}
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
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width:
                  index === columnsEntries.length - 1
                    ? undefined
                    : columnWidths[index + 1],
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
