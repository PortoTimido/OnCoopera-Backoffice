import { useEffect, useRef, useState, type ReactNode } from 'react'

type TableSkeletonRowsProps = { columns: number; rows?: number }

export function DataGridSkeleton({ columns = 6, rows = 6 }: TableSkeletonRowsProps) {
  return <section aria-busy="true" aria-label="Carregando dados" className="overflow-hidden rounded-3xl bg-white shadow-[4px_4px_0_rgba(187,202,196,0.2)]">
    <div className="grid grid-cols-6 gap-4 bg-surface-soft px-4 py-4">{Array.from({ length: columns }, (_, index) => <span className="data-grid-skeleton-block h-3" key={index} />)}</div>
    <div className="divide-y divide-[#bbcac4]/15 px-4">{Array.from({ length: rows }, (_, rowIndex) => <div className="grid grid-cols-6 gap-4 py-4" key={rowIndex}>{Array.from({ length: columns }, (_, columnIndex) => <span className="data-grid-skeleton-block h-4" key={columnIndex} style={{ width: `${columnIndex === columns - 1 ? 52 : 56 + ((rowIndex * 17 + columnIndex * 13) % 34)}%` }} />)}</div>)}</div>
  </section>
}

export function TableSkeletonRows({ columns, rows = 6 }: TableSkeletonRowsProps) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr aria-hidden="true" className="data-grid-skeleton-row border-t border-[#bbcac4]/15" key={rowIndex}>
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td className="px-4 py-4" key={columnIndex}>
          <span className="data-grid-skeleton-block" style={{ width: `${columnIndex === columns - 1 ? 52 : 56 + ((rowIndex * 17 + columnIndex * 13) % 34)}%` }} />
        </td>
      ))}
    </tr>
  ))
}

export function DataGridTransition({ changeKey, children }: { changeKey: string; children: ReactNode }) {
  const previousKey = useRef(changeKey)
  const [animationVersion, setAnimationVersion] = useState(0)

  useEffect(() => {
    if (previousKey.current === changeKey) return
    previousKey.current = changeKey
    setAnimationVersion((version) => version + 1)
  }, [changeKey])

  return <div className="data-grid-transition" key={animationVersion}>{children}</div>
}
