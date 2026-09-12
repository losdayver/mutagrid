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
  renderRowContent: (node: TreeViewNode<Data>) => ReactNode;
  outerDivStyle?: CSSProperties;
  rowStyle?: CSSProperties;
  rowHeight?: number;
  leftPadStep?: number;
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
  renderRowContent,
  outerDivStyle,
  rowStyle,
  rowHeight,
  leftPadStep = 25,
}: TreeViewProps<Data>) => {
  const sourceForestRef = useRef(forest);
  const forestShallowCopyRef = useRef<TreeViewNode<Data>[]>(
    shallowCopyForest(forest)
  );
  const virtualScrollRef = useRef<VirtualScrollRef>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

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
      renderRow={(index) => {
        const node = flatTree?.[index];
        if (!flatTree?.[index]) return "";

        return (
          <div
            style={{ height: "100%", display: "flex", cursor: "pointer" }}
            onClick={() => {
              node.expanded = !node.expanded;
              setRefreshVersion((version) => version + 1);
              virtualScrollRef.current?.updateVisible?.();
            }}
          >
            <div style={{ height: "100%", display: "flex" }}>
              {Array.from({ length: node.level ?? 0 }, (_, index) => {
                const hasNextSibling =
                  flatTree
                    .slice(index + 1)
                    .find((next) => (next.level ?? 0) <= node.level!)?.level ===
                  node.level;

                return (
                  <div
                    key={index}
                    style={{
                      borderLeft: hasNextSibling ? "1px solid #0000003a" : "",
                      marginLeft: leftPadStep,
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    {node.level! - 1 == index && (
                      <div
                        style={{
                          left: 0,
                          position: "absolute",
                          height: "100%",
                          width: leftPadStep * 0.8,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "end",
                        }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid #0000003a",
                            left: leftPadStep,
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
                paddingLeft: leftPadStep * 0.8,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {!!(node.children?.length || node.isFolder) ? (
                <span>{node.expanded ? "📂" : "📁"}</span>
              ) : (
                "⠀"
              )}
            </div>
            <div>{renderRowContent(node)}</div>
            {/* todo make node name and actual contents separate */}
          </div>
        );
      }}
    />
  );
};
