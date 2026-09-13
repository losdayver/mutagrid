import { ColumnedTreeView } from "../lib/columnedTreeView";
import { previewForest } from "./previewForest";
import fileSvgUrl from "./assets/File.svg?url";
import folderClosedUrl from "./assets/Folder closed.svg";
import folderOpenUrl from "./assets/Folder open.svg";

export const PreviewApp = () => {
  return (
    <div style={{ height: "100%" }}>
      <ColumnedTreeView<{
        dateCreated: Date;
        title: string;
        randomText: string;
        size: string;
        owner: string;
      }>
        leftPadStep={30}
        columnWidth={400}
        horizontalBarLength={5}
        forest={previewForest}
        renderRowTitle={(node) => node.data.title}
        onClick={(node, event) => {
          if (event.button === 2) event.preventDefault();
          window.alert(
            `${event.button === 2 ? "Right" : "Left"} click: ${node.data.title}`
          );
        }}
        virtualScrollProps={{ outerDivStyle: { height: 600 } }}
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
