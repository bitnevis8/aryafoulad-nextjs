'use client';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            >
              {columns.map((column, colIndex) => {
                let cellValue;
                if (column.cell) {
                  cellValue = column.cell(row);
                } else if (typeof column.accessor === 'function') {
                  cellValue = column.accessor(row);
                } else if (column.accessor.includes('.')) {
                  cellValue = column.accessor.split('.').reduce((obj, key) => obj && obj[key], row);
                } else {
                  cellValue = row[column.accessor];
                }
                
                return (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900"
                >
                    {cellValue || '-'}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      )}
    </div>
  );
};

export default Table; 