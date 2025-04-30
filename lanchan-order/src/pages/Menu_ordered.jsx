import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../menu_ordered.css';
import noodle from '../image/noodle.png';
import { setOrderId } from '../slice/cartslice';
import { useMemo } from 'react';

const MenuOrdered = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [itemPromoMap, setItemPromoMap] = useState({});

  const orderId = useSelector(state => state.cart.orderId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem('orderId');
    if (storedOrderId) {
      dispatch(setOrderId(Number(storedOrderId)));
    }
    console.log("Current tab orderId:", storedOrderId);
  }, [dispatch]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      getTotalCartItems();
      fetchPromotions();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`https://lanchangbackend-production.up.railway.app/orders/${orderId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.status}`);
      }

      // Get raw data from the backend
      const data = await response.json();

      // Use Set to track processed IDs to avoid processing the same item twice
      const processedIds = new Set();
      const uniqueItems = [];

      // Process each item only once by Order_detail_id
      data.forEach(item => {
        if (!processedIds.has(item.Order_detail_id)) {
          processedIds.add(item.Order_detail_id);
          uniqueItems.push(item);
        }
      });

      setOrderDetails(uniqueItems);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Updated function to fetch promotions with requirements
  const fetchPromotions = async () => {
    try {
      const res = await fetch('https://lanchangbackend-production.up.railway.app/getactivepromotions');
      const activePromos = await res.json();

      const promosWithItems = await Promise.all(
        activePromos.map(async (promo) => {
          const itemsRes = await fetch(`https://lanchangbackend-production.up.railway.app/getpromotionitems/${promo.Promotion_id}`);
          const items = await itemsRes.json();

          // Group promotion items by category for combo detection
          const itemsByType = {};
          items.forEach(item => {
            const type = item.Menu_id ? `menu_${item.Menu_id}` :
              (item.Noodlemenu === 1 ? 'noodle' : 'unknown');

            if (!itemsByType[type]) {
              itemsByType[type] = [];
            }
            itemsByType[type].push(item);
          });

          return {
            ...promo,
            items,
            itemsByType
          };
        })
      );

      setPromotions(promosWithItems);
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
    }
  };

  const getTotalCartItems = () => {
    fetch(`https://lanchangbackend-production.up.railway.app/gettotalcountorderdetail/${orderId}`)
      .then(response => response.json())
      .then(data => {
        setTotalItems(data.Total_items);
      })
      .catch(error => {
        console.error('Error fetching total cart items:', error);
        setTotalItems(0);
      });
  };

  const callStaff = async () => {
    try {
      const response = await fetch(`https://lanchangbackend-production.up.railway.app/orders/${orderId}/callstaff`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      alert('ทำการเรียกพนักงานมาชำระเงินเรียบร้อย');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const BacktoMenu = () => {
    navigate('/menu_order');
  };

  // Using the updated promotion logic to check if an item is part of a combo
  const getPromotionForItem = (item) => {
    return itemPromoMap[item.Order_detail_id] || null;
  };

  // Calculate order totals and discounts
  useEffect(() => {
    if (orderDetails.length === 0 || promotions.length === 0) return;

    const promoMap = {}; // itemId: promo

    const availableItems = [...orderDetails.map(item => ({ ...item, used: false }))];

    promotions.forEach(promo => {
      const requiredItemTypes = Object.keys(promo.itemsByType || {});
      let combosFound = 0;
      let keepChecking = true;

      while (keepChecking) {
        const comboItems = [];
        let comboComplete = true;

        for (const itemType of requiredItemTypes) {
          const foundItem = availableItems.find(item => {
            if (item.used) return false;

            if (itemType.startsWith('menu_')) {
              const menuId = parseInt(itemType.split('_')[1]);
              return item.Menu_id === menuId;
            } else if (itemType === 'noodle') {
              return item.Menu_id === null;
            }
            return false;
          });

          if (foundItem) {
            comboItems.push(foundItem);
          } else {
            comboComplete = false;
            break;
          }
        }

        if (comboComplete && comboItems.length === requiredItemTypes.length) {
          comboItems.forEach(item => {
            const index = availableItems.findIndex(i => i.Order_detail_id === item.Order_detail_id);
            if (index !== -1) {
              availableItems[index].used = true;
              promoMap[item.Order_detail_id] = promo;
            }
          });

          combosFound++;
        } else {
          keepChecking = false;
        }
      }
    });

    setItemPromoMap(promoMap);
  }, [orderDetails, promotions]);

  const { totalFullPrice, totalDiscount, finalPrice } = useMemo(() => {
    let fullPrice = 0;
    let discount = 0;

    orderDetails.forEach(item => {
      const itemQty = item.Order_detail_quantity;
      const unitPrice = item.Order_detail_price;
      fullPrice += unitPrice * itemQty;
    });

    // Count how many times each promotion appears in itemPromoMap
    const promoCount = {};
    Object.values(itemPromoMap).forEach(promo => {
      promoCount[promo.Promotion_id] = (promoCount[promo.Promotion_id] || 0) + 1;
    });

    // For each promotion, determine how many full combos were applied
    promotions.forEach(promo => {
      const itemTypesCount = Object.keys(promo.itemsByType || {}).length;
      const matchedItems = promoCount[promo.Promotion_id] || 0;
      const fullCombos = Math.floor(matchedItems / itemTypesCount);
      discount += fullCombos * promo.Discount_value;
    });

    return {
      totalFullPrice: fullPrice,
      totalDiscount: discount,
      finalPrice: fullPrice - discount
    };
  }, [orderDetails, promotions, itemPromoMap]);


  return (
    <div className="menu-ordered-container">
      <header>
        <h1 className="ordered-title">รายการที่สั่ง</h1>
      </header>

      {orderId && (
        <div className="order-id">
          <h2>เลขออเดอร์ของคุณ: {orderId}</h2>
        </div>
      )}

      <div className="ordered-items-list">
        {orderDetails.map(item => {
          const promo = getPromotionForItem(item);
          const itemQty = item.Order_detail_quantity;
          const unitPrice = item.Order_detail_price;
          const itemFullPrice = unitPrice * itemQty;
          const itemName = item.name || item.Menu_name || 'ก๋วยเตี๋ยว';

          return (
            <div key={item.Order_detail_id} className="ordered-item">
              <img
                src={item.Menu_id ? `https://lanchangbackend-production.up.railway.app/menuimage/${item.Menu_id}` : noodle}
                alt={itemName}
                className="ordered-item-image"
              />
              <div className="ordered-item-details">
                <div className="ordered-item-name">
                  {itemName}
                </div>
                {promo && (
                  <p id="promotion-name">เข้าร่วมโปรโมชั่น: {promo.Promotion_name} - ลด {promo.Discount_value} บาท</p>
                )}
                <p>จำนวน: {itemQty}</p>
                <p>ราคา: {unitPrice} บาท</p>

                <p>
                  สถานะ: {
                    item.status_id === 3 ? 'กำลังจัดเตรียม' :
                      item.status_id === 4 ? 'เสิร์ฟแล้ว' :
                        item.status_id === 5 ? 'รอชำระเงิน' :
                          item.status_id === 6 ? 'ชำระเงินแล้ว' :
                            item.status_id
                  }
                </p>
                <div className='takehomenote'>
                  {item.Order_detail_takehome === 1
                    ? <p id='takehome'>สั่งกลับบ้าน</p>
                    : <p id='dinein'>ทานที่ร้าน</p>}
                </div>
                {item.Order_detail_additional && (
                  <p className='ordered-additional-note'>เพิ่มเติม: {item.Order_detail_additional}</p>
                )}
              </div>
            </div>
          );
        })}

        <div className="total-price">
          <h3>จำนวนรายการทั้งหมด: {totalItems}</h3>
        </div>
        <div className='total-quantities'>
          <h3>ราคารวมทั้งหมด: {totalFullPrice} บาท</h3>
          <h3 id='alldiscount'>ส่วนลดรวม: {totalDiscount} บาท</h3>
          <h3 id='finaltotalprice'>ราคาหลังหักส่วนลด: {finalPrice} บาท</h3>
        </div>

        <div className="menu-ordered-actions">
          <button onClick={BacktoMenu} className="back-to-menu-btn">กลับไปสั่งอาหารเพิ่ม</button>
          <button onClick={callStaff} className="callstaff">เรียกพนักงานมาชำระเงิน</button>
        </div>
      </div>
    </div>
  );
};

export default MenuOrdered;