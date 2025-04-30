import React, { useState, useEffect, useCallback } from 'react';
import { Navbarow } from '../owner/Navbarowcomponent/navbarow/index-ow';
import { Link } from 'react-router-dom';
import PromptpayPic from '../assets/images/promptpay.jpg'
import {
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Input
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

const styles = {
  orderContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  orderItem: {
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  updateButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  dialog: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    maxWidth: '400px',
    width: '100%',
    maxHeight: '80vh',         // Limit height of the dialog
    overflowY: 'auto'
  },
  dialogButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
};
const buttonStyle = {
  padding: '0.5rem 1.25rem',
  color: 'white',
  fontWeight: '500',
  border: 'none',
  transitionDuration: '200ms',
  width: '70%',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cursor: 'pointer',
  fontSize: '15px',
  backgroundColor: '#3b82f6',
  display: 'flex',
  justifyContent: 'center'
};

function AddMenuButton({ text, linkTo }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'End', padding: '10px' }}>
      <Button
        variant="contained"
        component={Link}
        to={linkTo}
        style={{ width: '300px' }}
      >
        {text}
      </Button>
    </div>
  );
}

//////////////////////////////////////////////////////////

const OrderDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [soups, setSoups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [meats, setMeats] = useState([]);
  const [noodleTypes, setNoodleTypes] = useState([]);
  const [noodleMenu, setNoodleMenu] = useState([]);
  const [otherMenu, setOtherMenu] = useState([]);
  const [cashAmount, setCashAmount] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [promptpayImageUrl, setPromptpayImageUrl] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [orderPromotions, setOrderPromotions] = useState({});
  const [orderPromotionResults, setOrderPromotionResults] = useState({});

  const navigate = useNavigate();
  const HandleupdateOrder = () => {
    navigate('/updateServedOrder');
  }

  useEffect(() => {
    if (paymentMethod === 'promptpay') {
      setPromptpayImageUrl('../images/promptpay.jpg');
    }
  }, [paymentMethod]);

  const handleCheckboxChange = (orderId, itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: !prev[orderId]?.[itemId]
      }
    }));

    const order = orders.find(o => o.Order_id === orderId);
    const updatedCheckedItems = {
      ...checkedItems,
      [orderId]: {
        ...checkedItems[orderId],
        [itemId]: !checkedItems[orderId]?.[itemId]
      }
    };

    // Check if all items are checked
    if (order) {
      const allItemsChecked = order.details.every(item =>
        updatedCheckedItems[orderId]?.[item.Order_detail_id]
      );
      setSelectAll(allItemsChecked);
    }
  };

  const handleSelectAllChange = (orderId) => {
    const order = orders.find(o => o.Order_id === orderId);
    if (!order) return;

    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newCheckedItems = {
      ...checkedItems,
      [orderId]: order.details.reduce((acc, item) => ({
        ...acc,
        [item.Order_detail_id]: newSelectAll
      }), {})
    };

    setCheckedItems(newCheckedItems);
  };

  useEffect(() => {
    fetchOrders();
    fetchMenus();
    fetchAllData();
    fetchPromotions();
  }, []);

  // Calculate promotion results when orders or promotions change
  useEffect(() => {
    const newPromotionResults = {};

    orders.forEach(order => {
      if (order.details.length > 0) {
        newPromotionResults[order.Order_id] = checkPromotion([...order.details]);
      }
    });

    setOrderPromotionResults(newPromotionResults);
  }, [orders, promotions]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://lanchangbackend-production.up.railway.app/getserveoder');
      if (response.ok) {
        const data = await response.json();
        const ordersWithDetails = await Promise.all(data.map(async (order) => {
          const detailsResponse = await fetch(`https://lanchangbackend-production.up.railway.app/getorderdetail/${order.Order_id}`);
          const details = await detailsResponse.json();

          setNoodleMenu(details.filter(item => item.status_id === 5));
          return { ...order, details: details.filter(item => item.status_id === 5) };
        }));
        const sortedOrders = ordersWithDetails
          .filter(order => order.details.length > 0)
          .sort((a, b) => new Date(a.Order_datetime) - new Date(b.Order_datetime));
        setOrders(sortedOrders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenus = async () => {
    try {
      const otherRes = await fetch('https://lanchangbackend-production.up.railway.app/getmenu');
      const otherData = await otherRes.json();
      setOtherMenu(otherData);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      const [soupRes, sizeRes, meatRes, noodleTypeRes] = await Promise.all([
        fetch('https://lanchangbackend-production.up.railway.app/soups'),
        fetch('https://lanchangbackend-production.up.railway.app/sizes'),
        fetch('https://lanchangbackend-production.up.railway.app/meats'),
        fetch('https://lanchangbackend-production.up.railway.app/noodletypes')
      ]);

      const [soupData, sizeData, meatData, noodleTypeData] = await Promise.all([
        soupRes.json(),
        sizeRes.json(),
        meatRes.json(),
        noodleTypeRes.json()
      ]);

      setSoups(soupData);
      setSizes(sizeData);
      setMeats(meatData);
      setNoodleTypes(noodleTypeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const promotionsRes = await fetch('https://lanchangbackend-production.up.railway.app/getactivepromotions');
      const promotionsData = await promotionsRes.json();

      const promotionsWithItems = await Promise.all(promotionsData.map(async (promo) => {
        const itemsRes = await fetch(`https://lanchangbackend-production.up.railway.app/getpromotionitems/${promo.Promotion_id}`);
        const items = await itemsRes.json();
        return { ...promo, items };
      }));

      setPromotions(promotionsWithItems);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const checkPromotion = (orderItems) => {
    const itemsArray = Array.isArray(orderItems) ? [...orderItems] : [orderItems];
    
    // Expand by quantity
    const expandedItems = [];
    for (const item of itemsArray) {
      const qty = item.Order_detail_quantity || 1;
      for (let i = 0; i < qty; i++) {
        expandedItems.push({ ...item, originalItem: item }); // Keep reference to original item
      }
    }
  
    const now = new Date();
    const appliedPromotions = [];
    let remainItems = [...expandedItems];
  
    // Sort promotions by priority (if needed) or specificity
    const sortedPromotions = [...promotions].sort((a, b) => {
      // You might want to sort by number of items required or other criteria
      return b.items.length - a.items.length;
    });
  
    for (const promo of sortedPromotions) {
      const startDate = new Date(promo.Start_date);
      const endDate = new Date(promo.End_date);
  
      if (now >= startDate && now <= endDate) {
        const requiredItems = [...promo.items];
        let promotionApplied = false;
  
        // Try to apply promotion as many times as possible
        while (true) {
          const matchedIndices = [];
          let allMatched = true;
  
          for (const promoItem of requiredItems) {
            const matchIndex = remainItems.findIndex(orderItem => {
              if (promoItem.Menu_id && orderItem.Menu_id === promoItem.Menu_id) {
                return true;
              }
              if (promoItem.Noodlemenu === 1 && 
                  orderItem.Noodle_type_id !== null && 
                  orderItem.Soup_id !== null && 
                  orderItem.Meat_id !== null && 
                  orderItem.Size_id !== null) {
                return true;
              }
              if (promoItem.Noodlemenu && promoItem.Noodlemenu !== 1 && 
                  orderItem.Noodle_type_id === promoItem.Noodlemenu) {
                return true;
              }
              return false;
            });
  
            if (matchIndex === -1) {
              allMatched = false;
              break;
            }
            matchedIndices.push(matchIndex);
          }
  
          if (allMatched && matchedIndices.length === requiredItems.length) {
            // Create the matched items array (sorted high to low to avoid splice issues)
            const sortedMatchedIndices = [...matchedIndices].sort((a, b) => b - a);
            const matchedItems = sortedMatchedIndices.map(index => remainItems[index]);
            
            // Remove matched items (from highest index to lowest)
            sortedMatchedIndices.forEach(index => {
              remainItems.splice(index, 1);
            });
  
            appliedPromotions.push({
              promotionId: promo.Promotion_id,
              promotionName: promo.Promotion_name,
              discountValue: promo.Discount_value,
              items: matchedItems,
              originalItems: matchedItems.map(item => item.originalItem)
            });
            promotionApplied = true;
          } else {
            break; // No more matches for this promotion
          }
        }
      }
    }
  
    return {
      appliedPromotions,
      remainItems: remainItems.map(item => item.originalItem)
    };
  };
  
  // Memoize the calculateCheckedItemsTotal function to prevent unnecessary recalculations
  const calculateCheckedItemsTotal = useCallback((orderId) => {
    const order = orders.find(o => o.Order_id === orderId);
    if (!order) return 0;

    const checkedOrderItems = order.details.filter(item =>
      checkedItems[orderId]?.[item.Order_detail_id]
    );

    if (checkedOrderItems.length === 0) return 0;

    // Use pre-calculated promotion results if available
    const promoResults = orderPromotionResults[orderId] || checkPromotion(checkedOrderItems);

    const baseTotal = checkedOrderItems.reduce((total, item) => {
      return total + (item.Order_detail_price * item.Order_detail_quantity);
    }, 0);

    const totalDiscount = promoResults.appliedPromotions.reduce((discount, promo) => {
      return discount + promo.discountValue;
    }, 0);

    // Update orderPromotions state (but not during render)
    const appliedPromotionsData = promoResults.appliedPromotions.map(promo => ({
      promotionId: promo.promotionId,
      promotionName: promo.promotionName,
      discountValue: promo.discountValue,
      items: promo.items.map(item => ({
        id: item.Order_detail_id,
        name: getItemDetails(item)?.name || 'Unknown item'
      }))
    }));

    // This might cause re-renders if called during render
    // Only update if values have changed
    if (JSON.stringify(orderPromotions[orderId]) !== JSON.stringify(appliedPromotionsData)) {
      setOrderPromotions(prev => ({
        ...prev,
        [orderId]: appliedPromotionsData
      }));
    }

    return baseTotal - totalDiscount;
  }, [orders, checkedItems, orderPromotionResults, orderPromotions]);

  const renderPromotionBadge = useCallback((orderId, item) => {
    const promos = orderPromotionResults[orderId]?.appliedPromotions || [];
    const itemPromos = promos.filter(promo => 
      promo.originalItems.some(promoItem => 
        promoItem.Order_detail_id === item.Order_detail_id
      )
    );
  
    return itemPromos.map((promo, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${10 + i * 25}px`,
        right: '10px',
        backgroundColor: '#ff4081',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem'
      }}>
        เข้าร่วมโปรโมชั่น : {promo.promotionName}
      </div>
    ));
  }, [orderPromotionResults]);

  const getNoodleTypeName = (id) => {
    const noodle = noodleTypes.find(type => type.Noodle_type_id === id);
    return noodle ? noodle.Noodle_type_name : 'ไม่ระบุ';
  };

  const getSoupName = (id) => {
    const soup = soups.find(s => s.Soup_id === id);
    return soup ? soup.Soup_name : 'ไม่ระบุ';
  };

  const getMeatName = (id) => {
    const meat = meats.find(m => m.Meat_id === id);
    return meat ? meat.Meat_name : 'ไม่ระบุ';
  };

  const getSizeName = (id) => {
    const size = sizes.find(s => s.Size_id === id);
    return size ? size.Size_name : 'ไม่ระบุ';
  };

  function getMenuName(orderDetail) {
    if (!orderDetail) return 'ไม่ระบุ';

    const noodle_type_name = getNoodleTypeName(orderDetail.Noodle_type_id);
    const soup_name = getSoupName(orderDetail.Soup_id);
    const meat_name = getMeatName(orderDetail.Meat_id);
    const size_name = getSizeName(orderDetail.Size_id);

    return `${noodle_type_name} ${soup_name} ${meat_name} (${size_name})`;
  }

  const getItemDetails = (orderDetail) => {
    if (orderDetail) {
      // If the order includes a custom noodle dish
      if (orderDetail.Noodle_type_id || orderDetail.Soup_id || orderDetail.Meat_id || orderDetail.Size_id) {
        return {
          name: getMenuName(orderDetail),
          price: orderDetail.Price || 0, // Assuming price is stored in order_detail
        };
      }
      // If the order is from the standard menu
      else if (orderDetail.Menu_id && Array.isArray(otherMenu)) {
        const other = otherMenu.find(o => o.Menu_id === orderDetail.Menu_id);
        return other ? {
          name: other.Menu_name,
          price: orderDetail.Price || other.Menu_price,
        } : null;
      }
    }
    return null;
  };

  const handlePayment = (orderId) => {
    setPayingOrderId(orderId);
    setOpenPaymentDialog(true);
    setPaymentMethod('3');
    setShowPaymentDetails(false);
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    if (method === 'promptpay' || method === 'cash') {
      setShowPaymentDetails(true);
    } else {
      setShowPaymentDetails(false);
    }
  };

  const handleClosePayment = () => {
    setOpenPaymentDialog(false);
    setPaymentMethod(null);
    setPayingOrderId('6');
    setShowPaymentDetails(false);
  };

  const confirmPayment = async () => {
    try {
      const order = orders.find(o => o.Order_id === payingOrderId);
      if (!order) return;

      // กรองเอาเฉพาะรายการที่ถูกเลือก
      const selectedItems = order.details.filter(
        item => checkedItems[order.Order_id]?.[item.Order_detail_id]
      );

      if (selectedItems.length === 0) {
        alert('กรุณาเลือกรายการที่ต้องการชำระเงิน');
        return;
      }

      // อัพเดตสถานะการชำระเงินเฉพาะรายการที่เลือก
      await Promise.all(selectedItems.map(item =>
        fetch(`https://lanchangbackend-production.up.railway.app/updateorderstatus/${item.Order_detail_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 6 }),
        })
      ));

      // อัพเดตสถานะการชำระเงินของออเดอร์
      if (selectedItems.length === order.details.length) {
        // ถ้าเลือกทุกรายการ อัพเดตสถานะโต๊ะด้วย
        const orderResponse = await fetch(`https://lanchangbackend-production.up.railway.app/updateorderpayment/${payingOrderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 1 }),
        });

        if (orderResponse.ok) {
          const tableResponse = await fetch(`https://lanchangbackend-production.up.railway.app/updatetablestatus/${order.tables_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: '1' }),
          });

          if (!tableResponse.ok) {
            throw new Error('Failed to update table status');
          }
        }
      }

      // อัพเดท state ของ orders
      setOrders(prevOrders =>
        prevOrders.map(o => {
          if (o.Order_id === payingOrderId) {
            return {
              ...o,
              details: o.details.filter(
                item => !checkedItems[payingOrderId]?.[item.Order_detail_id]
              )
            };
          }
          return o;
        }).filter(order => order.details.length > 0)
      );

      // รีเซ็ต checkbox
      setCheckedItems(prev => ({
        ...prev,
        [payingOrderId]: {}
      }));

      handleClosePayment();
      alert('ชำระเงินเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
    }
  };

  const formatThaiDateTime = (dateTime) => {
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const date = new Date(dateTime);
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543 - 2500;
    const time = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${day} ${month} ${year} ${time} น.`;
  };

  const handleCashPayment = (orderId) => {
    const cash = parseFloat(cashAmount);

    if (isNaN(cash)) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    const total = calculateCheckedItemsTotal(orderId);

    if (total === 0) {
      alert('กรุณาเลือกรายการที่ต้องการชำระเงิน');
      return;
    }
    const change = cash - total;
    if (change < 0) {
      alert('จำนวนเงินไม่เพียงพอ');
      return;
    }
    setChangeAmount(change);
    setShowChange(true);
  };

  const renderPaymentDetails = () => {
    if (!showPaymentDetails) return null;

    const currentOrderId = updatingItemId ?
      orders.find(order => order.details.some(item => item.Order_detail_id === updatingItemId))?.Order_id :
      payingOrderId;

    const total = calculateCheckedItemsTotal(currentOrderId);

    const promptpayImagePath = '../images/promptpay.jpg';

    return (
      <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '0.25rem' }}>
        {paymentMethod === 'cash' && (
          <>
            <h3>รายละเอียดการชำระเงิน</h3>
            <p>ยอดรวมที่ต้องชำระ: {total.toFixed(2)} บาท</p>
            <Input
              fullWidth
              label="จำนวนเงินที่รับ"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              type="number"
              style={{ marginBottom: '1rem' }}
            />

            <button
              onClick={() => handleCashPayment(currentOrderId)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              คำนวณเงินทอน
            </button>
          </>
        )}

        {paymentMethod === 'promptpay' && (
          <>
            <h3>รายละเอียดการชำระเงิน</h3>
            <p>ยอดรวมที่ต้องชำระ: {total.toFixed(2)} บาท</p>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <img
                src={PromptpayPic}
                alt="PromptPay QR Code"
                style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px' }}
                onError={(e) => {
                  console.error('Error loading PromptPay image');
                  e.target.src = 'https://via.placeholder.com/300x300?text=PromptPay+QR+Code';
                }}
              />
              <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                สแกน QR Code เพื่อชำระเงิน
              </p>
            </div>
          </>
        )}

        {showChange && (
          <Dialog open={showChange} onClose={() => setShowChange(false)}>
            <DialogTitle>เงินทอน</DialogTitle>
            <DialogContent>
              <p style={{ fontSize: '1.5rem' }}>
                เงินทอน: {changeAmount.toFixed(2)} บาท
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setShowChange(false);
              }}>
                ตกลง
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  };

  const PaymentDialog = ({ open, onClose }) => (
    <div style={styles.dialog}>
      <div style={styles.dialogContent}>
        <h2>เลือกวิธีการชำระเงิน</h2>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold' }}>
            ยอดรวมที่ต้องชำระ: {calculateCheckedItemsTotal(payingOrderId).toFixed(2)} บาท
          </p>
        </div>
        <button
          onClick={() => handlePaymentSelection('cash')}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            backgroundColor: paymentMethod === 'cash' ? '#2196F3' : '#f0f0f0',
            color: paymentMethod === 'cash' ? 'white' : 'black'
          }}
        >
          เงินสด
        </button>
        <button
          onClick={() => handlePaymentSelection('promptpay')}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            backgroundColor: paymentMethod === 'promptpay' ? '#2196F3' : '#f0f0f0',
            color: paymentMethod === 'promptpay' ? 'white' : 'black'
          }}
        >
          พร้อมเพย์
        </button>

        {renderPaymentDetails()}

        <div style={styles.dialogButtons}>
          <button onClick={onClose} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
            ยกเลิก
          </button>
          <button
            onClick={confirmPayment}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            ยืนยันการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.orderPage}>
      <Navbarow />
      <div style={styles.orderContainer}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>ชำระเงิน</h1>

        {orders.length === 0 ? (
          <h2 style={{ textAlign: 'center' }}>ไม่มีรายการชำระ</h2>
        ) : (
          orders.map((order) => (
            <div key={order.Order_id} style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2>เลขออเดอร์: {order.Order_id}</h2>
                <h2>โต๊ะที่: {order.tables_id}</h2>
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={order.details.every(item => checkedItems[order.Order_id]?.[item.Order_detail_id])}
                    onChange={() => handleSelectAllChange(order.Order_id)}
                  />
                }
                label="เลือกทั้งหมด"
              />
              <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>เวลาสั่ง: {formatThaiDateTime(order.Order_datetime)}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>

              {orderPromotionResults[order.Order_id]?.appliedPromotions.map((promotion, index) => {
  // Group by promotion to show each unique promotion once
  const isFirstOccurrence = orderPromotionResults[order.Order_id].appliedPromotions
    .findIndex(p => p.promotionId === promotion.promotionId) === index;
  
  if (isFirstOccurrence) {
    const count = orderPromotionResults[order.Order_id].appliedPromotions
      .filter(p => p.promotionId === promotion.promotionId).length;
    
    return (
      <li key={index} style={{
        backgroundColor: '#ff4081',
        color: 'white',
        padding: '5px',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 'bold'
      }}>
        {`${promotion.promotionName}: ลด ${promotion.discountValue * count} บาท`}
      </li>
    );
  }
  return null;
})}

                {order.details.map((item) => {
                  const itemDetails = getItemDetails(item);
                  return itemDetails ? (
                    <li key={item.Order_detail_id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'white',
                      padding: '0.1rem',
                      margin: '1rem 0',
                      borderRadius: '5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'relative',
                      minHeight: '150px'
                    }}>
                      {renderPromotionBadge(order.Order_id, item)}
                      <FormControlLabel
                        style={{ margin: "1px" }}
                        control={
                          <Checkbox
                            checked={checkedItems[order.Order_id]?.[item.Order_detail_id] || false}
                            onChange={() => handleCheckboxChange(order.Order_id, item.Order_detail_id)}
                          />
                        }
                      />

                      <div>
                        <strong style={{ margin: "10px", fontSize: '1.3rem', marginBottom: '1rem' }}>{itemDetails.name}</strong>
                        <div style={{ margin: "10px", fontSize: '1rem' }}>
                          <div><strong>{item.Order_detail_quantity} รายการ </strong></div>
                          <div style={{ margin: "5px 0px" }}>
                            {item.Order_detail_price * item.Order_detail_quantity} บาท
                          </div>
                          <div style={{ margin: "5px 0px", color: 'gray' }}>
                            {item.Order_detail_additional && (
                              <>เพิ่มเติม : {item.Order_detail_additional}</>
                            )}
                          </div>
                          <div style={{ color: item.Order_detail_takehome ? "darkred" : "darkgreen" }}>
                            {(item.Order_detail_takehome) === 1 ? 'รับกลับบ้าน' : 'ทานที่ร้าน'}
                          </div>
                        </div>
                      </div>
                    </li>
                  ) : null;
                })}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                <h4>ราคารวมรายการที่เลือก:</h4>
                <h3>{calculateCheckedItemsTotal(order.Order_id).toFixed(2)} บาท</h3>
              </div>
              <button
                onClick={() => handlePayment(order.Order_id)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', marginTop: '1rem' }}
              >
                ชำระรายการที่เลือก
              </button>
            </div>
          ))
        )}
      </div>

      {openPaymentDialog && (
        <PaymentDialog
          open={openPaymentDialog}
          onClose={handleClosePayment}
        />
      )}

      <div style={{
        justifyContent: 'center',
        paddingTop: '10px',
        paddingBottom: '30px',
        display: 'flex',
        margin: '0 10%'
      }}>
        <button
          style={buttonStyle}
          onClick={HandleupdateOrder}
        >
          อัปเดตรายการอาหารลูกค้า
        </button>
      </div>
    </div>
  );
};



export default OrderDisplay;