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
      renderRow={(index) => {
        const node = flatTree?.[index];
        if (!flatTree?.[index]) return "";

        return (
          <div
            style={{ height: "100%", display: "flex", cursor: "pointer"  }}
            onClick={() => {
              node.expanded = !node.expanded;
              setRefreshVersion((version) => version + 1);
              virtualScrollRef.current?.updateVisible?.();
            }}
          >
            <div style={{ height: "100%", display: "flex" }}>
              {Array.from({ length: node.level ?? 0 }, (_, index) => (
                <div
                  key={index}
                  style={{
                    borderLeft: "1px solid black",
                    marginLeft: leftPadStep,
                    height: "100%",
                  }}
                ></div>
              ))}
            </div>
            <div style={{ paddingLeft: leftPadStep / 2 }}>
              {!!(node.children?.length || node.isFolder) ? (
                <span>{node.expanded ? "📂" : "📁"}</span>
              ) : (
                "📄"
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
