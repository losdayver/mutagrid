import {
  ComponentType,
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { VirtualScroll, VirtualScrollRef } from "./virtualScroll";

interface TreeViewNode<Data> {
  data: Data;
  isFolder?: boolean;
  checked?: boolean;
  expanded?: boolean;
  children?: TreeViewNode<Data>[];
  level?: number;
}

export interface TreeViewProps<Data> {
  forest: TreeViewNode<Data>[];
  renderRowTitle: (node: TreeViewNode<Data>) => ReactNode;
  renderRowContentToTheRight?: (node: TreeViewNode<Data>) => ReactNode;
  outerDivStyle?: CSSProperties;
  rowStyle?: CSSProperties;
  rowHeight?: number;
  leftPadStep?: number;
  leftItemPad?: number;
  columnWidth?: number;
  barsColor?: string;
  renderIcon?: (node: TreeViewNode<Data>) => ReactNode;
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
  forest,
  renderRowTitle,
  renderRowContentToTheRight,
  outerDivStyle,
  rowStyle,
  rowHeight,
  columnWidth,
  leftPadStep = 25,
  leftItemPad = -10,
  barsColor = "#0000003a",
  renderIcon = (node) =>
    !!(node.children?.length || node.isFolder) ? (
      <div style={{ paddingLeft: 2 }}>{node.expanded ? "📂" : "📁"}</div>
    ) : (
      "⠀"
    ),
}: TreeViewProps<Data>) => {
  const sourceForestRef = useRef(forest);
  const forestShallowCopyRef = useRef<TreeViewNode<Data>[]>(
    shallowCopyForest(forest)
  );
  const virtualScrollRef = useRef<VirtualScrollRef>(null);
  const [_, setRefreshVersion] = useState(0);

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
      ref={virtualScrollRef}
      outerDivStyle={outerDivStyle}
      rowsNum={flatTree?.length}
      rowStyle={rowStyle}
      rowHeight={rowHeight}
      renderRow={(rowIndex) => {
        const node = flatTree?.[rowIndex];
        if (!flatTree?.[rowIndex]) return "";

        return (
          <div style={{ display: "flex", height: "100%" }}>
            <div
              style={{
                height: "100%",
                display: "flex",
                cursor: "pointer",
                overflow: "hidden",
                minWidth: columnWidth ?? "100%",
              }}
              onClick={() => {
                node.expanded = !node.expanded;
                setRefreshVersion((version) => version + 1);
                virtualScrollRef.current?.updateVisible?.();
              }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
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
                      key={index}
                      style={{
                        borderLeft:
                          hasNextSibling || isLast
                            ? `1px solid ${barsColor}`
                            : "",
                        marginLeft: leftPadStep,
                        height: isLast ? "50%" : "100%",
                        position: "relative",
                      }}
                    >
                      {hasHorizontalBar && (
                        <div
                          style={{
                            left: 0,
                            position: "absolute",
                            height: "100%",
                            width: leftPadStep + leftItemPad,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "end",
                          }}
                        >
                          <div
                            style={{
                              borderTop: `1px solid ${barsColor}`,
                              left: leftPadStep,
                              height: isLast ? 0 : "50%",
                              width: "100%",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginLeft: leftPadStep / 2,
                }}
              >
                {renderIcon(node)}
              </div>
              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                <div>{renderRowTitle(node)}</div>
              </div>
            </div>
            {renderRowContentToTheRight && renderRowContentToTheRight(node)}
          </div>
        );
      }}
    />
  );
};
