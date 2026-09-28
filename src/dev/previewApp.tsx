import { ColumnedTreeView } from "../lib/columnedTreeView";
import { previewForest, type PreviewTreeNodeType } from "./previewForest";
import fileSvgUrl from "./assets/File.svg?url";
import folderClosedUrl from "./assets/Folder closed.svg";
import folderOpenUrl from "./assets/Folder open.svg";
import { useRef } from "react";
import type { TreeViewRef } from "../lib/treeView";

export const PreviewApp = () => {
  const ref = useRef<TreeViewRef<PreviewTreeNodeType>>(null);

  return (
    <div style={{ height: "100%" }}>
      <ColumnedTreeView<PreviewTreeNodeType>
        ref={ref}
        leftPadStep={30}
        columnWidth={400}
        horizontalBarLength={5}
        virtualScrollProps={{ outerDivStyle: { height: 600 } }}
        renderRowTitle={(node) => node.data.title}
        forest={previewForest}
        onClick={(node, event) => {
          if (event.button === 2) event.preventDefault();
          console.log(node.data.title);
        }}
        onSelect={(node) => {
          console.log(`got selected node: ${JSON.stringify(node.data)}`);
          console.log(
            `got node from ref: ${JSON.stringify(ref.current?.getSelectedNode()?.data)}`
          );
        }}
        columns={{
          dateCreated: { title: "Created at", width: 200 },
          size: { title: "Size", width: 120 },
          owner: { title: "Owner", width: 140 },
          randomText: { title: "Random text", width: 200 },
        }}
        renderIcon={(node) =>
          node.isFolder ? (
            node.expanded ? (
              <img src={folderOpenUrl} alt="" width={20} height={20} />
            ) : (
              <img src={folderClosedUrl} alt="" width={20} height={20} />
            )
          ) : (
            <img src={fileSvgUrl} alt="" width={20} height={20} />
          )
        }
      ></ColumnedTreeView>
    </div>
  );
};
