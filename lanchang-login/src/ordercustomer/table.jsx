import React, { useState, useEffect } from 'react';

function fetchTable() {
  return fetch('http://localhost:3333/table')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network is not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch Table', error);
      return [];
    });
}

function Table({ onSelect }) {
  const [Table, setTable] = useState([]);
  const [SelectedTable, setSelectedTable] = useState('1');

  useEffect(() => {
    fetchTable().then(data => {
      setTable(data);
    })
  }, []);

  useEffect(() => {
    onSelect(SelectedTable)
  }, [SelectedTable]);

  return (
    <div style={{ backgroundColor: 'gray', justifyContent: 'center', display: 'flex', fontSize: '20px' }}>
      <select value={SelectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
        {Table.map((table) => (
          <option key={table.tables_id} value={table.tables_id}>
            โต๊ะที่ {table.tables_number}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Table;
