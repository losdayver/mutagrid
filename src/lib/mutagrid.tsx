import {
  ComponentType,
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  memo,
  useCallback,
} from "react";

const borderStyle: CSSProperties = {
  border: "1px solid black",
  borderRadius: 3,
};

export interface VirtualScrollProps {
  renderRow: (index: number) => ReactNode;
  rowsNum: number;
  containerHeight: number;
  rowHeight?: number;
  verticalScrollMargin?: number;
}

interface VirtualRowProps {
  index: number;
  rowHeight: number;
}

const VirtualRow: ComponentType<PropsWithChildren<VirtualRowProps>> = memo(
  ({ children, index, rowHeight }) => {
    console.log(`rendered ${index}`);
    return (
      <div
        key={index}
        style={{
          height: rowHeight,
          position: "absolute",
          width: "100%",
          top: index * rowHeight,
          ...borderStyle,
        }}
      >
        {children}
      </div>
    );
  },
  ({ index }, { index: nextIndex }) => index == nextIndex
);

export const VirtualScroll: ComponentType<VirtualScrollProps> = ({
  renderRow,
  rowsNum,
  rowHeight = 30,
  verticalScrollMargin = 10,
  containerHeight: containerHeightProp,
}) => {
  const [containerHeight, setContainerHeight] =
    useState<number>(containerHeightProp);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [indices, setIndices] = useState<number[]>([]);

  const generateRows = useCallback(
    (scrollTop: number) => {
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

      const tempArr = Array.from(
        { length: indexEnd - indexStart + 1 },
        (_, index) => indexStart + index
      );

      setIndices(tempArr);
    },
    [containerHeight]
  );

  useEffect(() => {
    generateRows(scrollTop);
  }, [containerHeight, scrollTop]);

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
        {indices.map((index) => (
          <VirtualRow index={index} key={index} rowHeight={rowHeight}>
            {renderRow(index)}
          </VirtualRow>
        ))}
      </div>
    </div>
  );
};
