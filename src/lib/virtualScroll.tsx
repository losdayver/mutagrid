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
  forwardRef,
  useImperativeHandle,
} from "react";
import { borderStyle } from "./temporary";

export interface VirtualScrollProps {
  renderRow: (index: number) => ReactNode;
  rowsNum: number;
  outerDivStyle?: CSSProperties;
  rowStyle?: CSSProperties;
  rowHeight?: number;
  verticalScrollMargin?: number;
}

export interface VirtualScrollRef {
  /** Rows as memoized by default. If row content (children) updates this method should be called */
  updateVisible: () => void;
}

interface VirtualRowProps {
  index: number;
  rowHeight: number;
  refreshVersion: number;
  style?: CSSProperties;
}

const VirtualRow: ComponentType<PropsWithChildren<VirtualRowProps>> = memo(
  ({ children, index, rowHeight, style }) => (
    <div
      key={index}
      style={{
        height: rowHeight,
        position: "absolute",
        width: "100%",
        top: index * rowHeight,
        ...style,
      }}
    >
      {children}
    </div>
  ),
  (
    { index, refreshVersion, rowHeight },
    {
      index: nextIndex,
      refreshVersion: nextRefreshVersion,
      rowHeight: nextRowHeight,
    }
  ) =>
    index == nextIndex &&
    rowHeight == nextRowHeight &&
    refreshVersion == nextRefreshVersion
);

export const VirtualScroll = forwardRef<VirtualScrollRef, VirtualScrollProps>(
  (
    {
      renderRow,
      rowsNum,
      outerDivStyle,
      rowHeight = 30,
      verticalScrollMargin = 10,
      rowStyle,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [scrollTop, setScrollTop] = useState<number>(0);
    const [indices, setIndices] = useState<number[]>([]);
    const [refreshVersion, setRefreshVersion] = useState(0);

    useImperativeHandle(ref, () => ({
      updateVisible: () =>
        setRefreshVersion((refreshVersion) => refreshVersion + 1),
    }));

    const generateRows = useCallback(
      (scrollTop: number) => {
        const indexStart = Math.max(
          Math.floor(scrollTop / rowHeight) - verticalScrollMargin,
          0
        );
        const indexEnd = Math.min(
          indexStart +
            Math.floor(containerHeight / rowHeight) +
            verticalScrollMargin * 2 -
            1,
          rowsNum - 1
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
              <VirtualRow
                index={index}
                key={index}
                rowHeight={rowHeight}
                refreshVersion={refreshVersion}
                style={rowStyle}
              >
                {renderRow(index)}
              </VirtualRow>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
