'use client';

export function TrackingEmptyState() {
  return (
    <tr>
      <td colSpan={4} className="p-8 text-center text-slate-400" role="status">
        Nenhuma distribuidora vinculada.
      </td>
    </tr>
  );
}