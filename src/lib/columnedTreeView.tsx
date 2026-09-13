import { CSSProperties, useEffect, useRef, useState } from "react";
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
      /** Styles this column's header cell after the shared header cell style. */
      headerCellStyle?: CSSProperties;
      /** Styles this column's body cells after the shared data cell style. */
      dataCellStyle?: CSSProperties;
    };
  }>;
  /** Styles the root wrapper containing the header and TreeView. */
  columnedTreeViewStyle?: CSSProperties;
  /** Styles the row containing all column headers. */
  headerRowStyle?: CSSProperties;
  /** Styles every column header cell. */
  headerCellStyle?: CSSProperties;
  /** Styles only the first header cell that represents the tree column. */
  firstHeaderCellStyle?: CSSProperties;
  /** Styles body cells rendered for configured data columns. */
  dataCellStyle?: CSSProperties;
  /** Styles each draggable column resize handle. */
  resizeHandleStyle?: CSSProperties;
  /** Styles the indicator shown for the actively resized column. */
  resizeIndicatorStyle?: CSSProperties;
  /** Styles the persistent vertical divider rendered after each resizable column. */
  columnDividerStyle?: CSSProperties;
}

export const ColumnedTreeView = <Data extends Record<string, unknown>>(
  props: ColumnedTreeViewProps<Data>
) => {
  const {
    columns,
    columnWidth: firstColumnWidth = 100,
    virtualScrollProps,
    columnedTreeViewStyle,
    headerRowStyle,
    headerCellStyle,
    firstHeaderCellStyle,
    dataCellStyle,
    resizeHandleStyle,
    resizeIndicatorStyle,
    columnDividerStyle,
  } = props;
  const columnsEntries = Object.entries(columns);
  const columnKeys = [FIRST_COLUMN_KEY, ...columnsEntries.map(([key]) => key)];

  const [columnWidths, setColumnWidths] = useState(() =>
    Object.fromEntries<number>([
      [FIRST_COLUMN_KEY, firstColumnWidth],
      ...columnsEntries.map(([key, val]) => [key, val!.width] as const),
    ])
  );
  const [grabbedColumn, setGrabbedColumn] = useState<string | null>(null);
  const pointerXRef = useRef(0);
  const treeViewRef = useRef<VirtualScrollRef>(null);
  const tableWidth = columnKeys.reduce(
    (sum, key) => sum + columnWidths[key],
    0
  );

  const renderResizeHandle = (columnKey: string) => (
    <div
      className="lsdvr-mutagrid-columned-tree-view-resize-handle"
      data-column-key={columnKey}
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
          [columnKey]: Math.max(20, widths[columnKey] + offset),
        }));
      }}
      onPointerUp={() => setGrabbedColumn(null)}
      onLostPointerCapture={() => setGrabbedColumn(null)}
      style={{
        position: "absolute",
        top: 0,
        right: -8,
        width: 16,
        height: "100%",
        cursor: "col-resize",
        touchAction: "none",
        pointerEvents: "auto",
        zIndex: 1,
        ...resizeHandleStyle,
      }}
    />
  );

  useEffect(() => {
    treeViewRef.current?.updateVisible();
  }, [columnWidths]);

  return (
    <div
      className="lsdvr-mutagrid-columned-tree-view"
      style={{ position: "relative", ...columnedTreeViewStyle }}
    >
      {grabbedColumn != null && (
        <div
          className="lsdvr-mutagrid-columned-tree-view-resize-indicator"
          data-column-key={grabbedColumn}
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
            ...resizeIndicatorStyle,
          }}
        />
      )}
      {Object.keys(columnWidths)
        .slice(0, -1)
        .map((key) => (
          <div
            className="lsdvr-mutagrid-columned-tree-view-column-divider"
            data-column-key={key}
            key={key}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: columnKeys
                .slice(0, columnKeys.indexOf(key) + 1)
                .reduce((sum, key) => sum + columnWidths[key], 0),
              width: 1,
              background: "black",
              pointerEvents: "none",
              zIndex: 1,
              ...columnDividerStyle,
            }}
          >
            {renderResizeHandle(key)}
          </div>
        ))}
      <div
        className="lsdvr-mutagrid-columned-tree-view-header"
        style={{ display: "flex", minWidth: tableWidth, ...headerRowStyle }}
      >
        <div
          className="lsdvr-mutagrid-columned-tree-view-header-cell lsdvr-mutagrid-columned-tree-view-first-header-cell"
          data-column-key={FIRST_COLUMN_KEY}
          style={{
            width: columnWidths[FIRST_COLUMN_KEY],
            flexShrink: 0,
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            position: "relative",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ...headerCellStyle,
            ...firstHeaderCellStyle,
          }}
        >
          file
        </div>
        {columnsEntries.map(([key, val], index) => (
          <div
            className="lsdvr-mutagrid-columned-tree-view-header-cell"
            data-column-key={key}
            key={key}
            style={{
              borderTop: "1px solid black",
              borderLeft: "1px solid black",
              borderRight:
                index == Object.keys(columns).length - 1
                  ? "1px solid black"
                  : "",
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
              ...headerCellStyle,
              ...val?.headerCellStyle,
            }}
          >
            {val?.title}
          </div>
        ))}
      </div>
      <TreeView
        {...props}
        ref={treeViewRef}
        virtualScrollProps={{
          ...virtualScrollProps,
          outerDivStyle: {
            border: "1px solid black",
            ...virtualScrollProps?.outerDivStyle,
            minWidth: tableWidth,
          },
        }}
        columnWidth={columnWidths[FIRST_COLUMN_KEY]}
        renderRowContentToTheRight={(node) => {
          return columnsEntries.map(([key, val], index) => (
            <div
              className="lsdvr-mutagrid-columned-tree-view-data-cell"
              data-column-key={key}
              key={key}
              style={{
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
                ...dataCellStyle,
                ...val?.dataCellStyle,
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
