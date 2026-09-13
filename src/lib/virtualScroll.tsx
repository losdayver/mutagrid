import {
  ComponentType,
  CSSProperties,
  MouseEvent,
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

export interface VirtualScrollProps {
  renderRow: (index: number) => ReactNode;
  rowsNum: number;
  /** Styles the outer wrapper that controls the VirtualScroll dimensions. */
  outerDivStyle?: CSSProperties;
  /** Styles the scrollable viewport that owns both scrollbars. */
  viewportStyle?: CSSProperties;
  /** Styles the full-size canvas that contains all virtual row positions. */
  contentStyle?: CSSProperties;
  /** Styles every currently mounted virtual row wrapper. */
  rowStyle?: CSSProperties;
  rowHeight?: number;
  verticalScrollMargin?: number;
  /** Handles primary and context-menu clicks on a rendered row. */
  onClick?: (index: number, event: MouseEvent<HTMLDivElement>) => void;
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
  onClick?: VirtualScrollProps["onClick"];
}

const VirtualRow: ComponentType<PropsWithChildren<VirtualRowProps>> = memo(
  ({ children, index, rowHeight, style, onClick }) => (
    <div
      className="lsdvr-mutagrid-virtual-scroll-row"
      key={index}
      onClick={(event) => onClick?.(index, event)}
      onContextMenu={(event) => onClick?.(index, event)}
      style={{
        height: rowHeight,
        position: "absolute",
        width: "100%",
        top: index * rowHeight,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </div>
  ),
  (
    { index, refreshVersion, rowHeight, style, onClick },
    {
      index: nextIndex,
      refreshVersion: nextRefreshVersion,
      rowHeight: nextRowHeight,
      style: nextStyle,
      onClick: nextOnClick,
    }
  ) =>
    index == nextIndex &&
    rowHeight == nextRowHeight &&
    refreshVersion == nextRefreshVersion &&
    style == nextStyle &&
    onClick == nextOnClick
);

export const VirtualScroll = forwardRef<VirtualScrollRef, VirtualScrollProps>(
  (
    {
      renderRow,
      rowsNum,
      outerDivStyle,
      viewportStyle,
      contentStyle,
      rowHeight = 30,
      verticalScrollMargin = 10,
      rowStyle,
      onClick,
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
      <div className="lsdvr-mutagrid-virtual-scroll" style={outerDivStyle}>
        <div
          className="lsdvr-mutagrid-virtual-scroll-viewport"
          ref={containerRef}
          style={{
            overflow: "auto",
            height: "100%",
            ...viewportStyle,
          }}
          onScroll={(e) => {
            const value = (e.target as any).scrollTop;
            setScrollTop(value);
            generateRows(value);
          }}
        >
          <div
            className="lsdvr-mutagrid-virtual-scroll-content"
            style={{
              height: rowsNum * rowHeight,
              position: "relative",
              ...contentStyle,
            }}
          >
            {indices.map((index) => (
              <VirtualRow
                index={index}
                key={index}
                rowHeight={rowHeight}
                refreshVersion={refreshVersion}
                style={rowStyle}
                onClick={onClick}
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
