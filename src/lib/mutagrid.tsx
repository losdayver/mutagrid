import {
  ComponentType,
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  memo,
  useCallback,
  useRef,
} from "react";

const borderStyle: CSSProperties = {
  border: "1px solid black",
  borderRadius: 3,
};

export interface VirtualScrollProps {
  renderRow: (index: number) => ReactNode;
  rowsNum: number;
  outerDivStyle?: CSSProperties;
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
  outerDivStyle,
  rowHeight = 30,
  verticalScrollMargin = 10,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);
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
    [containerHeight, rowHeight, rowsNum, verticalScrollMargin]
  );

  useEffect(() => {
    generateRows(scrollTop);
  }, [generateRows, scrollTop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() =>
      setContainerHeight(container.clientHeight)
    );
    observer.observe(container);
    setContainerHeight(container.clientHeight);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={outerDivStyle}>
      <div
        ref={containerRef}
        style={{
          width: 500,
          overflow: "auto",
          height: "100%",
          ...borderStyle,
        }}
        onScroll={(e) => {
          const value = (e.target as any).scrollTop;
          setScrollTop(value);
          generateRows(value);
        }}
      >
        <div style={{ height: rowsNum * rowHeight, position: "relative" }}>
          {indices.map((index) => (
            <VirtualRow index={index} key={index} rowHeight={rowHeight}>
              {renderRow(index)}
            </VirtualRow>
          ))}
        </div>
      </div>
    </div>
  );
};
