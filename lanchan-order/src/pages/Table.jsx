import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedTable } from '../slice/tableslice';
import { setOrderId } from '../slice/cartslice';
import { useTableSelection } from '../Functions/tableselection';
import '../table.css';
import lanchan from '../image/lanchan.png';

function TableSelection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tables, loading, error } = useTableSelection();

  const reserveTable = async (tableNumber) => {
    try {
      const existingTable = sessionStorage.getItem('tableNumber');
      const existingOrderId = sessionStorage.getItem('orderId');

      // ✅ If both table and order already exist, just navigate
      if (existingTable && existingOrderId) {
        console.log("Using existing tableNumber and orderId for this tab:", existingTable, existingOrderId);
        dispatch(setSelectedTable(Number(existingTable)));
        dispatch(setOrderId(Number(existingOrderId)));
        navigate('/menu_order');
        return;
      }

      // Step 1: Reserve the selected table
      const reserveResponse = await fetch(`http://localhost:3333/table/${tableNumber}`, {
        method: 'POST',                    
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: 2 }),
      });

      if (!reserveResponse.ok) {
        throw new Error(`Failed to reserve table ${tableNumber}`);
      }

      // ✅ Now, safely store the table number
      sessionStorage.setItem('tableNumber', tableNumber.toString());
      dispatch(setSelectedTable(tableNumber));

      // Step 2: If an existing order is found, use it
      if (existingOrderId) {
        console.log("Using existing orderId for this tab:", existingOrderId);
        dispatch(setOrderId(Number(existingOrderId)));
        navigate('/menu_order');
        return;
      }

      // Step 3: Create a new order for this table
      const createOrderResponse = await fetch('http://localhost:3333/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: tableNumber }),
      });

      if (!createOrderResponse.ok) {
        throw new Error('Failed to create new order');
      }

      const responseData = await createOrderResponse.json();
      const orderId = responseData.orderId; // Ensure this matches your backend response

      if (orderId) {
        // ✅ Store orderId only in this tab
        sessionStorage.setItem('orderId', orderId.toString());
        dispatch(setOrderId(orderId));
      }

      navigate('/menu_order');
    } catch (error) {
      console.error('Error reserving table or creating order:', error);
      alert('Failed to reserve table or create order. Please try again.');
    }
  };

  const handleTableSelection = (tableNumber) => {
    reserveTable(tableNumber);
  };

  if (loading) return <div>กำลังโหลด</div>;
  if (error) return <div>เกิดข้อผิดพลาด : {error}</div>;

  return (
    <div>
      <div className="header">
        <div className="picturelogo">
          <img src={lanchan} alt="ร้านก๋วยเตี๋ยวเรือล้านช้าง" />
        </div>
        <div className="title0">ยินดีต้อนรับ</div>
        <div className="title1">ร้านก๋วยเตี๋ยวเรือล้านช้าง</div>
      </div>
      <div className="title2">กรุณาเลือกโต๊ะที่ท่านนั่ง</div>
      <div className="row">
        <div id="table-container">
          {tables.map((table) => {
            const { tables_number, status_id } = table;
            const isReserved = status_id === 2;
            const isAvailable = status_id === 1;
            return (
              <button
                key={tables_number}
                className={`box ${isReserved ? 'ไม่ว่าง' : ''}`}
                onClick={() => isAvailable && handleTableSelection(tables_number)}
                disabled={isReserved}
                aria-label={isReserved ? `Table ${tables_number} is ไม่ว่าง` : `Select Table ${tables_number}`}
              >
                <div>{tables_number}</div>
                {isReserved && <div className="reserved-text">-ไม่ว่าง</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TableSelection;
