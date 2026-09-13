import {
  CSSProperties,
  MouseEvent,
  Ref,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  VirtualScroll,
  VirtualScrollProps,
  VirtualScrollRef,
} from "./virtualScroll.js";

export interface TreeViewNode<Data> {
  data: Data;
  isFolder?: boolean;
  checked?: boolean;
  expanded?: boolean;
  children?: TreeViewNode<Data>[];
  level?: number;
}

export interface TreeViewProps<Data> {
  renderRowTitle: (node: TreeViewNode<Data>) => string;
  renderRowContentToTheRight?: (node: TreeViewNode<Data>) => ReactNode;
  renderIcon?: (node: TreeViewNode<Data>) => ReactNode;
  /** Handles primary and context-menu clicks on a row. */
  onClick?: (
    node: TreeViewNode<Data>,
    event: MouseEvent<HTMLDivElement>
  ) => void;
  ref?: Ref<VirtualScrollRef>;
  forest: TreeViewNode<Data>[];
  /** Configures and styles the VirtualScroll owned by this TreeView. */
  virtualScrollProps?: Omit<VirtualScrollProps, "renderRow" | "rowsNum">;
  /** Styles the flex container rendered inside each virtual row. */
  treeRowStyle?: CSSProperties;
  /** Styles the tree column containing indentation, icon, and title. */
  treeColumnStyle?: CSSProperties;
  /** Styles the container that groups all indentation levels. */
  indentationContainerStyle?: CSSProperties;
  /** Styles each indentation level and its vertical connector. */
  indentationLevelStyle?: CSSProperties;
  /** Styles the wrapper used to position a horizontal tree connector. */
  connectorStyle?: CSSProperties;
  /** Styles the visible horizontal tree connector line. */
  connectorLineStyle?: CSSProperties;
  /** Styles the container around the rendered tree icon. */
  iconContainerStyle?: CSSProperties;
  /** Styles the clipping container around the rendered row title. */
  titleContainerStyle?: CSSProperties;
  /** Styles the immediate wrapper around the rendered row title. */
  titleContentStyle?: CSSProperties;
  leftPadStep?: number;
  horizontalBarLength?: number;
  columnWidth?: number;
  barsColor?: string;
}

const walkForest = <Data,>(
  forest: TreeViewNode<Data>[],
  callback: (node: TreeViewNode<Data>) => void,
  level = 0
) => {
  forest.forEach((node) => {
    node.level = level;
    callback(node);
    if (node.isFolder && !node.expanded) return [];
    node.children && walkForest(node.children, callback, level + 1);
  });
};

const shallowCopyForest = <Data,>(forest?: TreeViewNode<Data>[]) => {
  if (!forest) return [];

  return forest.map((node) => {
    const nodeCopy = { ...node };
    if (node.children) nodeCopy.children = shallowCopyForest(node.children);
    return nodeCopy;
  });
};

const makeFlatTree = <Data,>(forest: TreeViewNode<Data>[]) => {
  const flatTree: TreeViewNode<Data>[] = [];
  walkForest(forest, (node) => flatTree.push(node));
  return flatTree;
};

export const TreeView = <Data,>({
  ref,
  forest,
  renderRowTitle,
  renderRowContentToTheRight,
  onClick,
  virtualScrollProps,
  treeRowStyle,
  treeColumnStyle,
  indentationContainerStyle,
  indentationLevelStyle,
  connectorStyle,
  connectorLineStyle,
  iconContainerStyle,
  titleContainerStyle,
  titleContentStyle,
  columnWidth,
  renderIcon,
  leftPadStep = 25,
  horizontalBarLength = 10,
  barsColor = "#0000003a",
}: TreeViewProps<Data>) => {
  const sourceForestRef = useRef(forest);
  const forestShallowCopyRef = useRef<TreeViewNode<Data>[]>(
    shallowCopyForest(forest)
  );
  const virtualScrollRef = useRef<VirtualScrollRef>(null);
  const [_, setRefreshVersion] = useState(0);

  useImperativeHandle(ref, () => ({
    updateVisible: () => virtualScrollRef.current?.updateVisible(),
  }));

  const flatTree = makeFlatTree(forestShallowCopyRef.current);

  useEffect(() => {
    if (sourceForestRef.current === forest) return;
    sourceForestRef.current = forest;
    forestShallowCopyRef.current = shallowCopyForest(forest);
    setRefreshVersion((version) => version + 1);
    virtualScrollRef.current?.updateVisible();
  }, [forest]);

  return (
    <VirtualScroll
      {...virtualScrollProps}
      ref={virtualScrollRef}
      rowsNum={flatTree?.length}
      onClick={(rowIndex, event) => {
        virtualScrollProps?.onClick?.(rowIndex, event);
        onClick?.(flatTree[rowIndex], event);
      }}
      renderRow={(rowIndex) => {
        const node = flatTree?.[rowIndex];
        if (!flatTree?.[rowIndex]) return "";

        return (
          <div
            className="lsdvr-mutagrid-tree-view-row"
            style={{ display: "flex", height: "100%", ...treeRowStyle }}
          >
            <div
              className="lsdvr-mutagrid-tree-view-tree-column"
              style={{
                height: "100%",
                display: "flex",
                cursor: "pointer",
                overflow: "hidden",
                width: columnWidth ?? "100%",
                flexShrink: 0,
                ...treeColumnStyle,
              }}
              onClick={(event) => {
                if (!node.isFolder) return;
                event.stopPropagation();
                node.expanded = !node.expanded;
                setRefreshVersion((version) => version + 1);
                virtualScrollRef.current?.updateVisible?.();
              }}
            >
              <div
                className="lsdvr-mutagrid-tree-view-indentation"
                style={{
                  height: "100%",
                  display: "flex",
                  ...indentationContainerStyle,
                }}
              >
                {Array.from({ length: node.level ?? 0 }, (_, index) => {
                  const hasNextSibling =
                    flatTree
                      .slice(rowIndex + 1)
                      .find((next) => (next.level ?? 0) <= index + 1)?.level ===
                    index + 1;

                  const hasHorizontalBar = node.level! - 1 == index;
                  const isLast = !hasNextSibling && hasHorizontalBar;

                  return (
                    <div
                      className="lsdvr-mutagrid-tree-view-indentation-level"
                      key={index}
                      style={{
                        borderLeft:
                          hasNextSibling || isLast
                            ? `1px solid ${barsColor}`
                            : "",
                        marginLeft: leftPadStep,
                        height: isLast ? "50%" : "100%",
                        position: "relative",
                        ...indentationLevelStyle,
                      }}
                    >
                      {hasHorizontalBar && (
                        <div
                          className="lsdvr-mutagrid-tree-view-connector"
                          style={{
                            left: 0,
                            position: "absolute",
                            height: "100%",
                            width: horizontalBarLength,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "end",
                            ...connectorStyle,
                          }}
                        >
                          <div
                            className="lsdvr-mutagrid-tree-view-connector-line"
                            style={{
                              borderTop: `1px solid ${barsColor}`,
                              left: leftPadStep,
                              height: isLast ? 0 : "50%",
                              width: "100%",
                              ...connectorLineStyle,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className="lsdvr-mutagrid-tree-view-icon"
                style={{
                  marginLeft: leftPadStep / 2,
                  ...iconContainerStyle,
                }}
              >
                {renderIcon
                  ? renderIcon(node)
                  : !!(node.children?.length || node.isFolder)
                    ? node.expanded
                      ? "📂"
                      : "📁"
                    : "📄"}
              </div>
              <div
                className="lsdvr-mutagrid-tree-view-title"
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  ...titleContainerStyle,
                }}
              >
                <div
                  className="lsdvr-mutagrid-tree-view-title-content"
                  style={titleContentStyle}
                >
                  <div
                    className={`lsdvr-mutagrid-tree-view-title-content-nodename ${node.isFolder ? "lsdvr-mutagrid-tree-view-title-content-nodename-folder" : "lsdvr-mutagrid-tree-view-title-content-nodename-node"}`}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    {renderRowTitle(node)}
                  </div>
                </div>
              </div>
            </div>
            {renderRowContentToTheRight && renderRowContentToTheRight(node)}
          </div>
        );
      }}
    />
  );
};
