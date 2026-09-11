import {
  ComponentType,
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
} from "react";

export interface VirtualScrollProps {
  renderRow: (index: number) => ReactNode;
  rowsNum: number;
}

const borderStyle: CSSProperties = {
  border: "1px solid black",
  borderRadius: 3,
};

export const VirtualScroll: ComponentType<VirtualScrollProps> = ({
  renderRow,
  rowsNum,
}) => {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(500);
  const [rows, setRows] = useState<Record<number, ReactNode>>([]);

  const rowHeight = 30;
  const verticalScrollMargin = 10;

  const generateRows = (scrollTop: number) => {
    setScrollTop(scrollTop);

    const indexStart = Math.max(
      Math.floor(scrollTop / rowHeight) - verticalScrollMargin,
      0
    );
    const indexEnd = Math.min(
      indexStart +
        Math.floor(containerHeight / rowHeight) +
        verticalScrollMargin * 2,
      rowsNum
    );

    const temp = {};

    for (let i = indexStart; i <= indexEnd; i++) {
      temp[i] = (
        <div
          key={i}
          style={{
            height: rowHeight,
            position: "absolute",
            width: "100%",
            top: i * rowHeight,
            ...borderStyle,
          }}
        >
          {renderRow(i)}
        </div>
      );
    }

    setRows(temp);
  };

  useEffect(() => {
    generateRows(0);
  }, []);

  return (
    <div
      style={{
        height: containerHeight,
        width: 500,
        overflow: "auto",
        ...borderStyle,
      }}
      onScroll={(e) => generateRows((e.target as any).scrollTop)}
    >
      <div style={{ height: rowsNum * rowHeight, position: "relative" }}>
        {Object.values(rows)}
      </div>
    </div>
  );
};
